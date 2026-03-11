"""Main FastAPI application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logging_config import setup_logging
from app.database.postgres import init_pool, close_pool
from app.routes import employees, attendance

setup_logging()

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)


@app.on_event("startup")
def startup():
    """Initialize database connection pool on startup"""
    init_pool(minconn=5, maxconn=20)


@app.on_event("shutdown")
def shutdown():
    """Close database connection pool on shutdown"""
    close_pool()


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "HRMS Lite API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}
