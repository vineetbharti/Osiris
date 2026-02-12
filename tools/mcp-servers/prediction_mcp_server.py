#!/usr/bin/env python3
"""
TrAISformer Prediction MCP Server
Performs sliding window trajectory prediction using trained TrAISformer model
"""

import asyncio
import logging
import sys
import json
from typing import Any, List, Dict
import numpy as np
import torch
import pandas as pd

# MCP SDK
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# TrAISformer components
from config_trAISformer import Config
from utils import models
from utils import trainers
from utils import datasets
from utils import utils

cf = Config()
TB_LOG = cf.tb_log
if TB_LOG:
    from torch.utils.tensorboard import SummaryWriter

    tb = SummaryWriter()

# make deterministic
utils.set_seed(42)
torch.pi = torch.acos(torch.zeros(1)).item() * 2

# Normalization utilities
from utils.normalization_utils import (
    normalize_latitude, normalize_longitude, normalize_sog, normalize_cog, 
    normalize_delta_time, denormalize_latitude, denormalize_longitude,
    denormalize_sog, denormalize_cog
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("prediction_mcp.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("prediction-mcp")

# Create MCP server
app = Server("traisformer-prediction")

# Global model state
model = None
device = None
v_ranges = None
v_roi_min = None

# ============================================================================
# Model Initialization
# ============================================================================

def load_model():
    """Load TrAISformer model"""
    global model, device, v_ranges, v_roi_min, init_seqlen, max_seqlen
    
    logger.info("Loading TrAISformer model...")
    
    # Set device
    device = cf.device
    logger.info(f"Using device: {device}")

    #Set Initial Sequence length
    init_seqlen = cf.init_seqlen

    # Load model
    ## Model
    # ===============================
    model = models.TrAISformer(cf, partition_model=None)


    model_path = cf.ckpt_path
    logger.info(f"Loading model from: {model_path}")
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    max_seqlen = init_seqlen + 6 * 10

    
    # Setup normalization parameters (from testing code)
    v_ranges = torch.tensor([2, 3, 0, 0, 0]).to(device)
    v_roi_min = torch.tensor([model.lat_min, -7, 0, 0, 0]).to(device)
    
    logger.info(f"✅ Model loaded successfully")
    logger.info(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    logger.info(f"v_ranges: {v_ranges}")
    logger.info(f"v_roi_min: {v_roi_min}")

# ============================================================================
# Data Normalization Functions
# ============================================================================

def normalize_dataframe(trajectory_df: List[Dict]) -> pd.DataFrame:
    """
    Normalize raw trajectory data from dataframe format
    
    Args:
        trajectory_df: List of dicts with keys:
            - latitude: float (degrees)
            - longitude: float (degrees)
            - sog: float (speed over ground in knots)
            - cog: float (course over ground in degrees)
            - timestamp: str (ISO format)
            - start_port_lat: float (optional)
            - start_port_long: float (optional)
            - end_port_lat: float (optional)
            - end_port_long: float (optional)
    
    Returns:
        DataFrame with normalized values:
            - lat_norm, lon_norm, sog_norm, cog_norm, deltaTime
            - timestamp (preserved)
            - start_port_lat, start_port_long, end_port_lat, end_port_long (preserved)
    """
    logger.info(f"Normalizing dataframe with {len(trajectory_df)} points")
    
    normalized_data = []
    
    for i, point in enumerate(trajectory_df):
        # Calculate delta time
        if i == 0:
            delta_time = 0.0
            prev_timestamp = None
        else:
            prev_timestamp = trajectory_df[i-1]['timestamp']
        
        # Normalize fields
        normalized_point = {
            # Normalized fields
            'lat_norm': normalize_latitude(point['latitude']),
            'lon_norm': normalize_longitude(point['longitude']),
            'sog_norm': normalize_sog(point['sog']),
            'cog_norm': normalize_cog(point['cog']),
            'deltaTime': normalize_delta_time(point['timestamp'], prev_timestamp),
            
            # Preserve original fields
            'timestamp': point['timestamp'],
        }
        
        # Preserve port coordinates if present
        if 'start_port_lat' in point:
            normalized_point['start_port_lat'] = point['start_port_lat']
        if 'start_port_long' in point:
            normalized_point['start_port_long'] = point['start_port_long']
        if 'end_port_lat' in point:
            normalized_point['end_port_lat'] = point['end_port_lat']
        if 'end_port_long' in point:
            normalized_point['end_port_long'] = point['end_port_long']
        
        normalized_data.append(normalized_point)
    
    # Convert to DataFrame
    df = pd.DataFrame(normalized_data)
    
    logger.info(f"✅ Normalized dataframe created: {df.shape}")
    logger.info(f"Columns: {list(df.columns)}")
    
    return df

# ============================================================================
# Prediction Functions
# ============================================================================
def denormalize_coordinates(normalized_tensor: torch.Tensor) -> np.ndarray:
    """
    Denormalize predicted coordinates back to lat/lon
    
    Args:
        normalized_tensor: Normalized predictions [batch, seq, features]
                          Can be 2 features (lat, lon) or 5 features (lat, lon, sog, cog, deltaTime)
    
    Returns:
        Denormalized coordinates in degrees [batch, seq, 2] for lat/lon only
    """
    # Check number of features
    num_features = normalized_tensor.shape[-1]

    if num_features == 2:
        # Only lat/lon - use first 2 elements of v_ranges and v_roi_min
        v_ranges_subset = v_ranges[:2]
        v_roi_min_subset = v_roi_min[:2]
        coords = (normalized_tensor * v_ranges_subset + v_roi_min_subset) * torch.pi / 180
    elif num_features == 5:
        # All features - use full v_ranges and v_roi_min
        coords = (normalized_tensor * v_ranges + v_roi_min) * torch.pi / 180
        # Only return lat/lon
        coords = coords[..., :2]
    else:
        raise ValueError(f"Expected 2 or 5 features, got {num_features}")

    coords_deg = coords * 180 / torch.pi
    return coords_deg.cpu().numpy()

def haversine_distance(coord1: np.ndarray, coord2: np.ndarray) -> np.ndarray:
    """
    Calculate Haversine distance between two coordinate arrays
    
    Args:
        coord1: [lat1, lon1] in degrees
        coord2: [lat2, lon2] in degrees
    
    Returns:
        Distance in kilometers
    """
    lat1, lon1 = np.radians(coord1[..., 0]), np.radians(coord1[..., 1])
    lat2, lon2 = np.radians(coord2[..., 0]), np.radians(coord2[..., 1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    
    return 6371 * c  # Earth radius in km

async def predict_trajectory(
    trajectory_data: List[Dict],
    prediction_steps: int = 10,
    ensemble_samples: int = 5
) -> Dict:
    """
    Predict future trajectory using sliding window approach
    
    Sliding Window Strategy:
    - Start with first init_seqlen (20) points
    - Predict next prediction_steps points
    - Slide window forward by prediction_steps
    - Use all available points (actual + predicted) for next prediction
    - Continue until full trajectory is predicted
    
    Args:
        trajectory_data: List of AIS points with normalized values
                         Each point: {lat_norm, lon_norm, sog_norm, cog_norm, deltaTime}
        prediction_steps: Number of steps to predict in each iteration
        ensemble_samples: Number of ensemble predictions per step
    
    Returns:
        Dict with:
        - all_points: List of all points (actual + predicted) with metadata
        - num_actual_points: Number of points that were never predicted
        - num_predicted_points: Number of points that were predicted
        - iterations: Number of sliding window iterations
    """
    try:
        logger.info(f"Starting sliding window prediction")
        logger.info(f"Input trajectory length: {len(trajectory_data)} points")
        logger.info(f"Prediction steps per iteration: {prediction_steps}")
        logger.info(f"Ensemble samples: {ensemble_samples}")
        
        n_points = len(trajectory_data)
        
        # Validate input length
        if n_points < init_seqlen:
            return {
                "error": f"Input trajectory too short. Need at least {init_seqlen} points, got {n_points}"
            }
        
        # Convert trajectory data to numpy array
        seq = np.zeros((n_points, 5), dtype=np.float32)
        
        for i, point in enumerate(trajectory_data):
            seq[i, 0] = point['lat_norm']
            seq[i, 1] = point['lon_norm']
            seq[i, 2] = point['sog_norm']
            seq[i, 3] = point['cog_norm']
            seq[i, 4] = point['deltaTime']
        
        # Convert to torch tensor [1, n_points, 5]
        seq_full = torch.from_numpy(seq).unsqueeze(0).to(device)
        
        logger.info(f"Full sequence tensor shape: {seq_full.shape}")
        
        # Store all output points
        all_points = []
        
        # Iteration 1: Use first init_seqlen points, predict next prediction_steps
        # Store first init_seqlen points as-is (never predicted)
        logger.info(f"Iteration 1: Using first {init_seqlen} points to predict next {prediction_steps}")
        
        for i in range(init_seqlen):
            # Denormalize to get actual lat/lon
            actual_coords = denormalize_coordinates(seq_full[:, i:i+1, :2])
            
            all_points.append({
                'index': i,
                'lat': float(actual_coords[0, 0, 0]),
                'lon': float(actual_coords[0, 0, 1]),
                'lat_norm': float(seq[i, 0]),
                'lon_norm': float(seq[i, 1]),
                'sog_norm': float(seq[i, 2]),
                'cog_norm': float(seq[i, 3]),
                'deltaTime': float(seq[i, 4]),
                'is_predicted': False,
                'iteration': 0
            })
        
        # Sliding window loop
        current_position = init_seqlen
        iteration = 1
        
        while current_position < n_points:
            # Determine how many steps to predict
            steps_to_predict = min(prediction_steps, n_points - current_position)
            
            logger.info(f"Iteration {iteration}: Position {current_position}, predicting {steps_to_predict} steps")
            
            # Use all points up to current position as input
            seqs_init = seq_full[:, :current_position, :]
            
            # Ensemble predictions
            error_ens = torch.zeros((1, steps_to_predict, ensemble_samples)).to(device)
            pred_coords_ensemble = []
            
            with torch.no_grad():
                for i_sample in range(ensemble_samples):
                    # Predict using TrAISformer
                    preds = trainers.sample(
                        model,
                        seqs_init,
                        steps_to_predict,
                        temperature=1.0,
                        sample=True,
                        sample_mode=cf.sample_mode,
                        r_vicinity=cf.r_vicinity,
                        top_k=cf.top_k
                    )
                    
                    # Denormalize predictions
                    pred_coords = denormalize_coordinates(preds)
                    pred_coords_ensemble.append(pred_coords)
                    
                    # Calculate error against actual if available
                    if current_position + steps_to_predict <= n_points:
                        inputs = seq_full[:, current_position:current_position + steps_to_predict, :2]
                        input_coords_tensor = (inputs * v_ranges[:2] + v_roi_min[:2]) * torch.pi / 180 
                        # Haversine distance
                        #pred_coords_tensor = torch.from_numpy(pred_coords).to(device) * torch.pi / 180
                        pred_coords_tensor = (preds[:, :steps_to_predict, :2] * v_ranges[:2] + v_roi_min[:2]) * torch.pi / 180
                        logger.info(f"Haversine inputs - input_coords: {input_coords_tensor.shape}, pred_coords: {pred_coords_tensor.shape}")
                        d = utils.haversine(input_coords_tensor, pred_coords_tensor)
                        error_ens[:, :, i_sample] = d.squeeze(0)
            
            # Stack ensemble predictions
            pred_coords_ensemble = np.array(pred_coords_ensemble)  # [ensemble, batch, steps, 2]
            
            # Calculate statistics
            mean_predictions = np.mean(pred_coords_ensemble, axis=0)[0]  # [steps, 2]
            std_predictions = np.std(pred_coords_ensemble, axis=0)[0]    # [steps, 2]
            
            # Calculate mean error if we have ground truth
            if current_position + steps_to_predict <= n_points:
                mean_error = error_ens.mean(dim=-1).squeeze(0).cpu().numpy()
            else:
                mean_error = np.zeros(steps_to_predict)
            
            # Store predicted points
            for step in range(steps_to_predict):
                point_index = current_position + step
                
                # Get normalized values from prediction or actual
                if point_index < n_points:
                    # We have actual data for comparison
                    lat_norm_actual = float(seq[point_index, 0])
                    lon_norm_actual = float(seq[point_index, 1])
                    sog_norm_actual = float(seq[point_index, 2])
                    cog_norm_actual = float(seq[point_index, 3])
                    deltaTime_actual = float(seq[point_index, 4])
                else:
                    # Pure prediction, no ground truth
                    lat_norm_actual = None
                    lon_norm_actual = None
                    sog_norm_actual = None
                    cog_norm_actual = None
                    deltaTime_actual = None
                
                all_points.append({
                    'index': point_index,
                    'lat': float(mean_predictions[step, 0]),
                    'lon': float(mean_predictions[step, 1]),
                    'lat_std': float(std_predictions[step, 0]),
                    'lon_std': float(std_predictions[step, 1]),
                    'is_predicted': True,
                    'iteration': iteration,
                    'error_km': float(mean_error[step]) if point_index < n_points else None,
                    # Store actual normalized values if available
                    'lat_norm_actual': lat_norm_actual,
                    'lon_norm_actual': lon_norm_actual,
                    'sog_norm_actual': sog_norm_actual,
                    'cog_norm_actual': cog_norm_actual,
                    'deltaTime_actual': deltaTime_actual
                })
            
            # Move window forward
            current_position += steps_to_predict
            iteration += 1
        
        logger.info(f"✅ Sliding window prediction complete")
        logger.info(f"Total points: {len(all_points)}")
        logger.info(f"Actual points (not predicted): {init_seqlen}")
        logger.info(f"Predicted points: {len(all_points) - init_seqlen}")
        logger.info(f"Total iterations: {iteration}")
        logger.info(f"Mean error: {mean_error}")
        
        return {
            "all_points": all_points,
            "num_actual_points": init_seqlen,
            "num_predicted_points": len(all_points) - init_seqlen,
            "total_points": len(all_points),
            "iterations": iteration,
            "prediction_steps_per_iteration": prediction_steps,
            "ensemble_samples": ensemble_samples,
            "model_config": {
                "sample_mode": cf.sample_mode,
                "r_vicinity": cf.r_vicinity,
                "top_k": cf.top_k,
                "init_seqlen": init_seqlen
            }
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return {"error": str(e)}

async def evaluate_trajectory(
    actual_trajectory: List[Dict],
    init_seqlen: int = 20,
    prediction_steps: int = 10,
    ensemble_samples: int = 5
) -> Dict:
    """
    Evaluate model on historical trajectory using sliding window
    
    Args:
        actual_trajectory: Complete trajectory with actual positions
        init_seqlen: Initial sequence length to use for prediction
        prediction_steps: Number of steps to predict
        ensemble_samples: Number of ensemble predictions
    
    Returns:
        Dict with predictions, actual values, and error metrics
    """
    try:
        logger.info(f"Evaluating trajectory: {len(actual_trajectory)} points")
        
        if len(actual_trajectory) < init_seqlen + prediction_steps:
            return {
                "error": f"Trajectory too short. Need at least {init_seqlen + prediction_steps} points"
            }
        
        # Use initial sequence for prediction
        init_sequence = actual_trajectory[:init_seqlen]
        actual_future = actual_trajectory[init_seqlen:init_seqlen + prediction_steps]
        
        # Predict future
        prediction_result = await predict_trajectory(
            init_sequence,
            prediction_steps,
            ensemble_samples
        )
        
        if "error" in prediction_result:
            return prediction_result
        
        predictions = prediction_result["predictions"]
        
        # Calculate errors against actual positions
        errors = []
        for i, (pred, actual) in enumerate(zip(predictions, actual_future)):
            pred_coord = np.array([pred['lat'], pred['lon']])
            actual_coord = np.array([actual['lat'], actual['lon']])
            
            distance_km = haversine_distance(pred_coord, actual_coord)
            
            errors.append({
                'step': i + 1,
                'predicted_lat': pred['lat'],
                'predicted_lon': pred['lon'],
                'actual_lat': actual['lat'],
                'actual_lon': actual['lon'],
                'error_km': float(distance_km),
                'lat_std': pred['lat_std'],
                'lon_std': pred['lon_std']
            })
        
        # Calculate summary statistics
        error_values = [e['error_km'] for e in errors]
        
        result = {
            "evaluation_results": errors,
            "summary": {
                "mean_error_km": float(np.mean(error_values)),
                "median_error_km": float(np.median(error_values)),
                "std_error_km": float(np.std(error_values)),
                "max_error_km": float(np.max(error_values)),
                "min_error_km": float(np.min(error_values))
            },
            "input_length": init_seqlen,
            "prediction_steps": prediction_steps,
            "ensemble_samples": ensemble_samples
        }
        
        logger.info(f"✅ Evaluation complete. Mean error: {result['summary']['mean_error_km']:.2f} km")
        
        return result
        
    except Exception as e:
        logger.error(f"Evaluation error: {e}", exc_info=True)
        return {"error": str(e)}

# ============================================================================
# MCP Tool Definitions
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="normalize_trajectory_data",
            description="Normalizes raw AIS trajectory data from dataframe format. Converts lat/lon/sog/cog/timestamp to normalized values (lat_norm, lon_norm, sog_norm, cog_norm, deltaTime) ready for model input. Preserves port coordinates.",
            inputSchema={
                "type": "object",
                "properties": {
                    "trajectory_data": {
                        "type": "array",
                        "description": "Raw trajectory data as array of objects",
                        "items": {
                            "type": "object",
                            "properties": {
                                "latitude": {"type": "number", "description": "Latitude in degrees [-90, 90]"},
                                "longitude": {"type": "number", "description": "Longitude in degrees [-180, 180]"},
                                "sog": {"type": "number", "description": "Speed over ground in knots"},
                                "cog": {"type": "number", "description": "Course over ground in degrees [0, 360]"},
                                "timestamp": {"type": "string", "description": "ISO format timestamp"},
                                "start_port_lat": {"type": "number", "description": "Start port latitude (optional)"},
                                "start_port_long": {"type": "number", "description": "Start port longitude (optional)"},
                                "end_port_lat": {"type": "number", "description": "End port latitude (optional)"},
                                "end_port_long": {"type": "number", "description": "End port longitude (optional)"}
                            },
                            "required": ["latitude", "longitude", "sog", "cog", "timestamp"]
                        }
                    }
                },
                "required": ["trajectory_data"]
            }
        ),
        Tool(
            name="predict_future_trajectory",
            description="Predicts future ship positions using sliding window approach. Takes normalized AIS data and returns predicted lat/lon coordinates with confidence bounds.",
            inputSchema={
                "type": "object",
                "properties": {
                    "trajectory_data": {
                        "type": "array",
                        "description": "Array of normalized AIS points. Each point must have: lat_norm, lon_norm, sog_norm, cog_norm, deltaTime (all in range [0, 1))",
                        "items": {
                            "type": "object",
                            "properties": {
                                "lat_norm": {"type": "number"},
                                "lon_norm": {"type": "number"},
                                "sog_norm": {"type": "number"},
                                "cog_norm": {"type": "number"},
                                "deltaTime": {"type": "number"}
                            },
                            "required": ["lat_norm", "lon_norm", "sog_norm", "cog_norm", "deltaTime"]
                        }
                    },
                    "prediction_steps": {
                        "type": "integer",
                        "description": "Number of future time steps to predict",
                        "default": 10
                    },
                    "ensemble_samples": {
                        "type": "integer",
                        "description": "Number of ensemble predictions (more = better confidence bounds)",
                        "default": 5
                    }
                },
                "required": ["trajectory_data"]
            }
        ),
        Tool(
            name="evaluate_prediction",
            description="Evaluates model performance on historical trajectory. Uses initial sequence to predict future, then compares with actual positions.",
            inputSchema={
                "type": "object",
                "properties": {
                    "actual_trajectory": {
                        "type": "array",
                        "description": "Complete trajectory with normalized values and actual lat/lon",
                        "items": {
                            "type": "object",
                            "properties": {
                                "lat_norm": {"type": "number"},
                                "lon_norm": {"type": "number"},
                                "sog_norm": {"type": "number"},
                                "cog_norm": {"type": "number"},
                                "deltaTime": {"type": "number"},
                                "lat": {"type": "number", "description": "Actual latitude in degrees"},
                                "lon": {"type": "number", "description": "Actual longitude in degrees"}
                            },
                            "required": ["lat_norm", "lon_norm", "sog_norm", "cog_norm", "deltaTime", "lat", "lon"]
                        }
                    },
                    "init_seqlen": {
                        "type": "integer",
                        "description": "Initial sequence length to use for prediction",
                        "default": 20
                    },
                    "prediction_steps": {
                        "type": "integer",
                        "description": "Number of steps to predict and evaluate",
                        "default": 10
                    },
                    "ensemble_samples": {
                        "type": "integer",
                        "description": "Number of ensemble predictions",
                        "default": 5
                    }
                },
                "required": ["actual_trajectory"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls"""
    try:
        if name == "normalize_trajectory_data":
            trajectory_data = arguments.get("trajectory_data")
            
            # Normalize the dataframe
            df = normalize_dataframe(trajectory_data)
            
            # Convert DataFrame to list of dicts for JSON serialization
            result = {
                "normalized_data": df.to_dict('records'),
                "shape": list(df.shape),
                "columns": list(df.columns),
                "sample": df.head(3).to_dict('records') if len(df) > 0 else []
            }
            
        elif name == "predict_future_trajectory":
            trajectory_data = arguments.get("trajectory_data")
            prediction_steps = arguments.get("prediction_steps", 10)
            ensemble_samples = arguments.get("ensemble_samples", 5)
            
            result = await predict_trajectory(
                trajectory_data,
                prediction_steps,
                ensemble_samples
            )
            
        elif name == "evaluate_prediction":
            actual_trajectory = arguments.get("actual_trajectory")
            init_seqlen = arguments.get("init_seqlen", 20)
            prediction_steps = arguments.get("prediction_steps", 10)
            ensemble_samples = arguments.get("ensemble_samples", 5)
            
            result = await evaluate_prediction(
                actual_trajectory,
                init_seqlen,
                prediction_steps,
                ensemble_samples
            )
            
        else:
            result = {"error": f"Unknown tool: {name}"}
        
        return [TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
        
    except Exception as e:
        logger.error(f"Error in tool {name}: {e}", exc_info=True)
        return [TextContent(
            type="text",
            text=json.dumps({"error": str(e)}, indent=2)
        )]

# ============================================================================
# Main Entry Point
# ============================================================================

async def main():
    logger.info("=" * 60)
    logger.info("TrAISformer Prediction MCP Server Starting")
    logger.info("=" * 60)
    
    # Load model
    try:
        cf = Config()
        TB_LOG = cf.tb_log
        if TB_LOG:
            from torch.utils.tensorboard import SummaryWriter
            tb = SummaryWriter()

        # make deterministic
        utils.set_seed(42)
        torch.pi = torch.acos(torch.zeros(1)).item() * 2
        load_model()
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        sys.exit(1)
    
    # Run MCP server
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
