#!/usr/bin/env python3
"""
Generic PostgreSQL MCP Server
Executes arbitrary SQL queries on a PostgreSQL database
"""

import asyncio
import logging
import sys
import json
from typing import Any, List, Dict

# MCP SDK
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Database
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("postgres_mcp.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("postgres-mcp")

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "ais",
    "user": "postgres",
    "password": "Shilpa5"
}

# Create MCP server
app = Server("postgres-generic")

# ============================================================================
# Helper Functions
# ============================================================================

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def serialize_value(value):
    """Convert Python types to JSON-serializable types"""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    elif isinstance(value, bytes):
        return value.hex()
    elif value is None:
        return None
    else:
        return value

def execute_query(query: str, params: List = None) -> Dict:
    """
    Execute SQL query and return results
    
    Args:
        query: SQL query string
        params: Optional list of parameters for parameterized queries
    
    Returns:
        Dict with rows, row_count, columns
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        logger.info(f"Executing query: {query[:100]}...")
        if params:
            logger.info(f"With params: {params}")
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # Check if query returns results (SELECT, RETURNING, etc.)
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            # Convert rows to list of dicts with serialized values
            serialized_rows = []
            for row in rows:
                serialized_row = {k: serialize_value(v) for k, v in dict(row).items()}
                serialized_rows.append(serialized_row)
            
            result = {
                "rows": serialized_rows,
                "row_count": len(serialized_rows),
                "columns": columns
            }
        else:
            # For INSERT, UPDATE, DELETE, etc.
            conn.commit()
            result = {
                "rows": [],
                "row_count": cursor.rowcount,
                "columns": [],
                "affected_rows": cursor.rowcount
            }
        
        cursor.close()
        conn.close()
        
        logger.info(f"Query executed successfully: {result['row_count']} rows")
        return result
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        return {
            "error": str(e),
            "rows": [],
            "row_count": 0,
            "columns": []
        }

def execute_query_readonly(query: str, params: List = None) -> Dict:
    """
    Execute read-only SQL query (SELECT only)
    
    Args:
        query: SQL query string (must be SELECT)
        params: Optional list of parameters
    
    Returns:
        Dict with rows, row_count, columns
    """
    # Simple validation - check if query starts with SELECT
    query_upper = query.strip().upper()
    if not query_upper.startswith('SELECT'):
        return {
            "error": "Only SELECT queries allowed in read-only mode",
            "rows": [],
            "row_count": 0,
            "columns": []
        }
    
    return execute_query(query, params)

def list_tables() -> Dict:
    """List all tables in the database"""
    query = """
        SELECT 
            table_schema,
            table_name,
            table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
    """
    return execute_query(query)

def describe_table(table_name: str) -> Dict:
    """Get table schema information"""
    query = """
        SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY ordinal_position
    """
    return execute_query(query, [table_name])

# ============================================================================
# MCP Tool Definitions
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="execute_sql",
            description="Execute any SQL query (SELECT, INSERT, UPDATE, DELETE, etc.). Use with caution for write operations.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "SQL query to execute"
                    },
                    "params": {
                        "type": "array",
                        "description": "Optional parameters for parameterized queries (use %s placeholders)",
                        "items": {"type": ["string", "number", "null"]},
                        "default": []
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="execute_select",
            description="Execute read-only SELECT queries. Safer option when you only need to read data.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "SELECT query to execute"
                    },
                    "params": {
                        "type": "array",
                        "description": "Optional parameters for parameterized queries",
                        "items": {"type": ["string", "number", "null"]},
                        "default": []
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="list_tables",
            description="List all tables in the database with their schema and type.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="describe_table",
            description="Get detailed schema information for a specific table including columns, data types, and constraints.",
            inputSchema={
                "type": "object",
                "properties": {
                    "table_name": {
                        "type": "string",
                        "description": "Name of the table to describe"
                    }
                },
                "required": ["table_name"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls"""
    try:
        if name == "execute_sql":
            query = arguments.get("query")
            params = arguments.get("params", [])
            result = execute_query(query, params if params else None)
            
        elif name == "execute_select":
            query = arguments.get("query")
            params = arguments.get("params", [])
            result = execute_query_readonly(query, params if params else None)
            
        elif name == "list_tables":
            result = list_tables()
            
        elif name == "describe_table":
            table_name = arguments.get("table_name")
            result = describe_table(table_name)
            
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
    logger.info("Generic PostgreSQL MCP Server Starting")
    logger.info(f"Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    logger.info("=" * 60)
    
    # Test database connection
    try:
        conn = get_db_connection()
        logger.info("✅ Database connection successful")
        conn.close()
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
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
