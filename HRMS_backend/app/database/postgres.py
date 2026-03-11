"""
PostgreSQL database connection

This module provides a synchronous connection pool to the PostgreSQL database.
"""

import os
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg2.pool import SimpleConnectionPool
import psycopg2
import logging

load_dotenv()
logger = logging.getLogger(__name__)

_connection_pool = None


def get_connection_params():
    """Get database connection parameters from environment variables."""
    return {
        "host": os.getenv("POSTGRES_HOST"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
        "database": os.getenv("POSTGRES_DB"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "sslmode": "require"
    }


def init_pool(minconn=2, maxconn=10):
    """
    Initialize the connection pool.
    
    Args:
        minconn: Minimum number of connections in the pool
        maxconn: Maximum number of connections in the pool
    """
    global _connection_pool
    
    if _connection_pool is not None:
        logger.debug("Database connection pool already initialized")
        return
    
    try:
        params = get_connection_params()
        logger.info(f"Initializing database connection pool to {params['host']}:{params['port']}/{params['database']}")
        
        _connection_pool = SimpleConnectionPool(
            minconn=minconn,
            maxconn=maxconn,
            **params
        )
        
        logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database connection pool: {e}")
        raise


def close_pool():
    """Close all connections in the pool."""
    global _connection_pool
    
    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None
        logger.info("Database connection pool closed")


@contextmanager
def get_db_connection():
    """
    Context manager for getting a database connection from the pool.
    
    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees")
            results = cursor.fetchall()
    """
    if _connection_pool is None:
        init_pool()
    
    conn = _connection_pool.getconn()
    try:
        yield conn
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        _connection_pool.putconn(conn)


@contextmanager
def get_db_cursor(commit=False):
    """
    Context manager for getting a database cursor.
    
    Args:
        commit: If True, commits the transaction on success
    
    Usage:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute("INSERT INTO employees (...) VALUES (...)")
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database cursor error: {e}")
            raise
        finally:
            cursor.close()


def execute_query(query, params=None, fetch_one=False, commit=False):
    """Execute a query and return results as dict"""
    from psycopg2.extras import RealDictCursor
    
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute(query, params)
            
            if commit:
                conn.commit()
                if cursor.description:
                    result = cursor.fetchone() if fetch_one else cursor.fetchall()
                    return dict(result) if fetch_one and result else [dict(r) for r in result]
                return cursor.rowcount
            
            if cursor.description:
                result = cursor.fetchone() if fetch_one else cursor.fetchall()
                return dict(result) if fetch_one and result else [dict(r) for r in result]
            return None
        except Exception as e:
            if commit:
                conn.rollback()
            logger.error(f"Query error: {e}")
            raise
        finally:
            cursor.close()


def test_connection():
    """Test database connection"""
    try:
        result = execute_query("SELECT 1")
        logger.info(f"Database connection successful: {result}")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


if __name__ == "__main__":
    # Test the connection
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    from logging_config import setup_logging
    
    setup_logging()
    logger.info("Testing database connection...")
    
    init_pool()
    
    if test_connection():
        logger.info("Database connection successful!")
        
        # Test query
        with get_db_cursor() as cursor:
            cursor.execute("SELECT current_database(), current_user, version()")
            db, user, version = cursor.fetchone()
            logger.info(f"Database: {db}")
            logger.info(f"User: {user}")
            logger.info(f"PostgreSQL Version: {version[:80]}...")
    else:
        logger.error(" Database connection failed!")
    
    close_pool()