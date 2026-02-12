#!/usr/bin/env python3
"""
AIS Data Normalization Utilities
Handles normalization and denormalization of vessel trajectory data
"""

import numpy as np
from typing import List, Dict, Union
from datetime import datetime


def normalize_latitude(lat: float) -> float:
    """
    Normalize latitude to range [0, 1)
    
    Args:
        lat: Latitude in degrees [-90, 90]
    
    Returns:
        Normalized latitude in range [0, 1)
    
    Formula: norm_lat = (lat + 90.0) / 180.0
    """
    # Apply boundary conditions
    if lat > 90.0:
        lat = 90.0
    elif lat < -90.0:
        lat = -90.0
    
    norm_lat = (lat + 90.0) / 180.0
    
    # Ensure result is in [0, 1)
    if norm_lat >= 1.0:
        norm_lat = 0.9999
    elif norm_lat < 0.0:
        norm_lat = 0.0
    
    return norm_lat


def denormalize_latitude(norm_lat: float) -> float:
    """
    Denormalize latitude from range [0, 1) back to degrees
    
    Args:
        norm_lat: Normalized latitude in range [0, 1)
    
    Returns:
        Latitude in degrees [-90, 90]
    
    Formula: lat = norm_lat * 180.0 - 90.0
    """
    lat = norm_lat * 180.0 - 90.0
    
    # Apply boundary conditions
    if lat > 90.0:
        lat = 90.0
    elif lat < -90.0:
        lat = -90.0
    
    return lat


def normalize_longitude(lon: float) -> float:
    """
    Normalize longitude to range [0, 1)
    
    Args:
        lon: Longitude in degrees [-180, 180]
    
    Returns:
        Normalized longitude in range [0, 1)
    
    Formula: norm_lon = (lon + 180.0) / 360.0
    """
    # Apply boundary conditions
    if lon > 180.0:
        lon = 180.0
    elif lon < -180.0:
        lon = -180.0
    
    norm_lon = (lon + 180.0) / 360.0
    
    # Ensure result is in [0, 1)
    if norm_lon >= 1.0:
        norm_lon = 0.9999
    elif norm_lon < 0.0:
        norm_lon = 0.0
    
    return norm_lon


def denormalize_longitude(norm_lon: float) -> float:
    """
    Denormalize longitude from range [0, 1) back to degrees
    
    Args:
        norm_lon: Normalized longitude in range [0, 1)
    
    Returns:
        Longitude in degrees [-180, 180]
    
    Formula: lon = norm_lon * 360.0 - 180.0
    """
    lon = norm_lon * 360.0 - 180.0
    
    # Apply boundary conditions
    if lon > 180.0:
        lon = 180.0
    elif lon < -180.0:
        lon = -180.0
    
    return lon


def normalize_sog(sog: float) -> float:
    """
    Normalize Speed Over Ground (SOG) to range [0, 1)
    
    Args:
        sog: Speed in knots
    
    Returns:
        Normalized SOG in range [0, 1)
    
    Formula: norm_sog = sog / 30.0
    """
    norm_sog = float(sog) / 30.0
    
    # Ensure result is in [0, 1)
    if norm_sog >= 1.0:
        norm_sog = 0.9999
    elif norm_sog < 0.0:
        norm_sog = 0.0
    
    return norm_sog


def denormalize_sog(norm_sog: float) -> float:
    """
    Denormalize Speed Over Ground (SOG) back to knots
    
    Args:
        norm_sog: Normalized SOG in range [0, 1)
    
    Returns:
        Speed in knots
    
    Formula: sog = norm_sog * 30.0
    """
    return norm_sog * 30.0


def normalize_cog(cog: float) -> float:
    """
    Normalize Course Over Ground (COG) to range [0, 1)
    
    Args:
        cog: Course in degrees [0, 360]
    
    Returns:
        Normalized COG in range [0, 1)
    
    Formula: norm_cog = cog / 360.0
    """
    norm_cog = float(cog) / 360.0
    
    # Ensure result is in [0, 1)
    if norm_cog >= 1.0:
        norm_cog = 0.9999
    elif norm_cog < 0.0:
        norm_cog = 0.0
    
    return norm_cog


def denormalize_cog(norm_cog: float) -> float:
    """
    Denormalize Course Over Ground (COG) back to degrees
    
    Args:
        norm_cog: Normalized COG in range [0, 1)
    
    Returns:
        Course in degrees [0, 360]
    
    Formula: cog = norm_cog * 360.0
    """
    cog = norm_cog * 360.0
    
    # Ensure within valid range
    if cog >= 360.0:
        cog = 359.99
    elif cog < 0.0:
        cog = 0.0
    
    return cog


def normalize_delta_time(timestamp: Union[str, datetime], prev_timestamp: Union[str, datetime, None] = None) -> float:
    """
    Normalize time difference between successive records
    
    Args:
        timestamp: Current timestamp (ISO string or datetime)
        prev_timestamp: Previous timestamp (ISO string or datetime), None for first record
    
    Returns:
        Normalized delta time in range [0, 1)
    
    Formula: delta_time = (timestamp - prev_timestamp) / 39600.0
    Note: For first record, delta_time = 0
    """
    # Handle first record
    if prev_timestamp is None:
        return 0.0
    
    # Convert to datetime if strings
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    if isinstance(prev_timestamp, str):
        prev_timestamp = datetime.fromisoformat(prev_timestamp.replace('Z', '+00:00'))
    
    # Calculate time difference in seconds
    delta_seconds = (timestamp - prev_timestamp).total_seconds()
    
    # Normalize by 39600 seconds (11 hours)
    delta_time = delta_seconds / 39600.0
    
    # Ensure result is in [0, 1)
    if delta_time >= 1.0:
        delta_time = 0.9999
    elif delta_time < 0.0:
        delta_time = 0.0
    
    return delta_time


def denormalize_delta_time(norm_delta_time: float) -> float:
    """
    Denormalize delta time back to seconds
    
    Args:
        norm_delta_time: Normalized delta time in range [0, 1)
    
    Returns:
        Time difference in seconds
    
    Formula: delta_seconds = norm_delta_time * 39600.0
    """
    return norm_delta_time * 39600.0


def normalize_trajectory(trajectory: List[Dict]) -> List[Dict]:
    """
    Normalize entire trajectory
    
    Args:
        trajectory: List of AIS points with keys:
                   - lat: float (latitude in degrees)
                   - lon: float (longitude in degrees)
                   - speed: float (SOG in knots)
                   - course: float (COG in degrees)
                   - timestamp: str or datetime
    
    Returns:
        List of normalized points with keys:
        - lat_norm, lon_norm, sog_norm, cog_norm, deltaTime
        - lat, lon (original values preserved)
        - timestamp (original timestamp preserved)
    """
    normalized = []
    
    for i, point in enumerate(trajectory):
        # Get previous timestamp for delta time calculation
        prev_timestamp = trajectory[i-1]['timestamp'] if i > 0 else None
        
        normalized_point = {
            # Normalized values
            'lat_norm': normalize_latitude(point['lat']),
            'lon_norm': normalize_longitude(point['lon']),
            'sog_norm': normalize_sog(point['speed']),
            'cog_norm': normalize_cog(point['course']),
            'deltaTime': normalize_delta_time(point['timestamp'], prev_timestamp),
            # Preserve original values
            'lat': point['lat'],
            'lon': point['lon'],
            'speed': point['speed'],
            'course': point['course'],
            'timestamp': point['timestamp']
        }
        
        normalized.append(normalized_point)
    
    return normalized


def denormalize_trajectory(normalized_trajectory: List[Dict]) -> List[Dict]:
    """
    Denormalize entire trajectory
    
    Args:
        normalized_trajectory: List of points with normalized values
                              (lat_norm, lon_norm, sog_norm, cog_norm, deltaTime)
    
    Returns:
        List of denormalized points with lat, lon, speed, course in original units
    """
    denormalized = []
    
    for point in normalized_trajectory:
        denormalized_point = {
            'lat': denormalize_latitude(point['lat_norm']),
            'lon': denormalize_longitude(point['lon_norm']),
            'speed': denormalize_sog(point['sog_norm']),
            'course': denormalize_cog(point['cog_norm']),
            'delta_seconds': denormalize_delta_time(point['deltaTime'])
        }
        
        # Preserve timestamp if available
        if 'timestamp' in point:
            denormalized_point['timestamp'] = point['timestamp']
        
        denormalized.append(denormalized_point)
    
    return denormalized


# ============================================================================
# Test Functions
# ============================================================================

def test_normalization():
    """Test normalization and denormalization functions"""
    print("Testing Normalization Functions")
    print("=" * 60)
    
    # Test latitude
    test_lats = [-90.0, -45.0, 0.0, 45.0, 90.0, -100.0, 100.0]
    print("\nLatitude:")
    for lat in test_lats:
        norm = normalize_latitude(lat)
        denorm = denormalize_latitude(norm)
        print(f"  {lat:7.2f} -> {norm:.4f} -> {denorm:7.2f}")
    
    # Test longitude
    test_lons = [-180.0, -90.0, 0.0, 90.0, 180.0, -200.0, 200.0]
    print("\nLongitude:")
    for lon in test_lons:
        norm = normalize_longitude(lon)
        denorm = denormalize_longitude(norm)
        print(f"  {lon:7.2f} -> {norm:.4f} -> {denorm:7.2f}")
    
    # Test SOG
    test_sogs = [0.0, 5.0, 10.0, 15.0, 20.0, 30.0, 35.0]
    print("\nSpeed Over Ground (knots):")
    for sog in test_sogs:
        norm = normalize_sog(sog)
        denorm = denormalize_sog(norm)
        print(f"  {sog:5.1f} -> {norm:.4f} -> {denorm:5.1f}")
    
    # Test COG
    test_cogs = [0.0, 45.0, 90.0, 180.0, 270.0, 360.0]
    print("\nCourse Over Ground (degrees):")
    for cog in test_cogs:
        norm = normalize_cog(cog)
        denorm = denormalize_cog(norm)
        print(f"  {cog:6.1f} -> {norm:.4f} -> {denorm:6.1f}")
    
    # Test delta time
    print("\nDelta Time:")
    print(f"  First record: {normalize_delta_time('2024-01-01T00:00:00Z', None):.4f}")
    
    from datetime import timedelta
    t1 = datetime(2024, 1, 1, 0, 0, 0)
    t2 = t1 + timedelta(hours=1)
    t3 = t1 + timedelta(hours=11)
    
    norm1 = normalize_delta_time(t2, t1)
    norm2 = normalize_delta_time(t3, t1)
    print(f"  1 hour diff: {norm1:.4f} -> {denormalize_delta_time(norm1):.0f} seconds")
    print(f"  11 hour diff: {norm2:.4f} -> {denormalize_delta_time(norm2):.0f} seconds")


if __name__ == "__main__":
    test_normalization()
