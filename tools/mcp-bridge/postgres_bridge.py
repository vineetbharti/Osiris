#!/usr/bin/env python3
"""
Bridge between LM Studio and persistent PostgreSQL MCP Server
Keeps one MCP server process running and routes requests to it
"""

from flask import Flask, Response, request
from flask_cors import CORS
import json
import subprocess
import logging
import queue
import threading
import time

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MCP_SERVER_PATH = "/sanji/Shipping/AISDK/TrAISformer-main/postgres_mcp_server.py"

# Shared MCP subprocess
mcp_process = None
mcp_lock = threading.Lock()
request_id = 0
response_queues = {}

def start_mcp_server():
    """Start the PostgreSQL MCP server subprocess"""
    global mcp_process
    
    logger.info("Starting PostgreSQL MCP server subprocess...")
    mcp_process = subprocess.Popen(
        ["python3.10", MCP_SERVER_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Initialize
    init_msg = {
        "jsonrpc": "2.0",
        "id": 0,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "bridge", "version": "1.0"}
        }
    }
    
    mcp_process.stdin.write(json.dumps(init_msg) + '\n')
    mcp_process.stdin.flush()
    
    # Read init response
    init_resp = mcp_process.stdout.readline()
    logger.info("PostgreSQL MCP server initialized")
    
    # Send initialized notification
    init_notif = {"jsonrpc": "2.0", "method": "notifications/initialized"}
    mcp_process.stdin.write(json.dumps(init_notif) + '\n')
    mcp_process.stdin.flush()
    
    # Start background reader
    threading.Thread(target=read_mcp_responses, daemon=True).start()
    
    logger.info("✅ PostgreSQL MCP server ready!")

def read_mcp_responses():
    """Read responses from MCP server"""
    global mcp_process
    while mcp_process and mcp_process.poll() is None:
        try:
            line = mcp_process.stdout.readline()
            if not line:
                break
            
            try:
                resp = json.loads(line)
                req_id = resp.get('id')
                
                if req_id is not None and req_id in response_queues:
                    response_queues[req_id].put(resp)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from MCP: {line}")
        except Exception as e:
            logger.error(f"Error reading MCP: {e}")
            break
    
    logger.warning("MCP reader thread stopped")

def call_mcp_tool(tool_name: str, arguments: dict, timeout=180):
    """Call MCP tool with 3-minute timeout for database queries"""
    global request_id, mcp_process
    
    # Check if process is alive, restart if needed
    if mcp_process is None or mcp_process.poll() is not None:
        logger.warning("MCP process not running, restarting...")
        start_mcp_server()
    
    with mcp_lock:
        request_id += 1
        req_id = request_id
    
    response_queue = queue.Queue()
    response_queues[req_id] = response_queue
    
    request = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    
    try:
        start_time = time.time()
        logger.info(f"Calling MCP tool: {tool_name}")
        mcp_process.stdin.write(json.dumps(request) + '\n')
        mcp_process.stdin.flush()
        
        response = response_queue.get(timeout=timeout)
        elapsed = time.time() - start_time
        logger.info(f"Query completed in {elapsed:.2f} seconds")
        
        del response_queues[req_id]
        return response
        
    except queue.Empty:
        elapsed = time.time() - start_time
        logger.error(f"Timeout after {elapsed:.2f} seconds")
        if req_id in response_queues:
            del response_queues[req_id]
        return {"error": f"Timeout after {timeout} seconds"}
    except Exception as e:
        logger.error(f"Error calling MCP: {e}")
        if req_id in response_queues:
            del response_queues[req_id]
        return {"error": str(e)}

# SSE endpoint for LM Studio
@app.route('/mcp', methods=['GET', 'POST'])
def mcp_endpoint():
    """MCP endpoint - handles both SSE (GET) and JSON-RPC (POST)"""
    
    # Handle POST requests (JSON-RPC)
    if request.method == 'POST':
        try:
            data = request.json
            method = data.get('method')
            params = data.get('params', {})
            req_id = data.get('id')
            
            logger.info(f"POST request: method={method}, id={req_id}")
            
            if method == 'initialize':
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {
                            "name": "postgres-bridge",
                            "version": "1.0.0"
                        }
                    }
                }
            
            elif method == 'tools/list':
                # Forward to MCP server
                with mcp_lock:
                    global request_id
                    request_id += 1
                    list_req_id = request_id
                
                response_queue = queue.Queue()
                response_queues[list_req_id] = response_queue
                
                list_request = {
                    "jsonrpc": "2.0",
                    "id": list_req_id,
                    "method": "tools/list"
                }
                
                logger.info("Requesting tools list from MCP server...")
                mcp_process.stdin.write(json.dumps(list_request) + '\n')
                mcp_process.stdin.flush()
                
                try:
                    mcp_response = response_queue.get(timeout=30)  # Increased from 5s to 30s
                    del response_queues[list_req_id]
                    
                    logger.info(f"Received tools list with {len(mcp_response.get('result', {}).get('tools', []))} tools")
                    
                    return {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": mcp_response.get('result', {})
                    }
                except queue.Empty:
                    if list_req_id in response_queues:
                        del response_queues[list_req_id]
                    logger.error("Timeout waiting for tools list from MCP server")
                    return {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32603,
                            "message": "Timeout listing tools from MCP server"
                        }
                    }
            
            elif method == 'tools/call':
                tool_name = params.get('name')
                arguments = params.get('arguments', {})
                
                result = call_mcp_tool(tool_name, arguments)
                
                if 'error' in result:
                    return {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {"code": -32603, "message": result['error']}
                    }
                else:
                    return {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": result.get('result', result)
                    }
            
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }
            
        except Exception as e:
            logger.error(f"POST error: {e}", exc_info=True)
            return {
                "jsonrpc": "2.0",
                "id": request.json.get('id') if request.json else None,
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }, 500
    
    # Handle GET requests (SSE connection)
    else:
        logger.info("SSE connection requested")
        
        def generate():
            """Generate SSE events"""
            yield f"data: {json.dumps({'type': 'connected'})}\n\n"
            
            try:
                while True:
                    yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
                    time.sleep(30)
            except GeneratorExit:
                logger.info("SSE connection closed")
        
        return Response(
            generate(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )

@app.route('/health', methods=['GET'])
def health():
    return {
        "status": "healthy",
        "mcp_running": mcp_process is not None and mcp_process.poll() is None
    }

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("PostgreSQL MCP Bridge Starting")
    logger.info(f"MCP Server: {MCP_SERVER_PATH}")
    logger.info("Bridge will keep MCP server running persistently")
    logger.info("=" * 60)
    
    # Start MCP server on startup
    start_mcp_server()
    
    # Start Flask
    logger.info("Starting Flask server on port 5003...")
    app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)
