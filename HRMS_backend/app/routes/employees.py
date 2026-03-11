"""
Employee management routes
"""

from fastapi import APIRouter, HTTPException, status
from app.models import EmployeeCreate, EmployeeResponse
from app.database.queries import (
    create_employee,
    get_all_employees,
    get_employee_by_id,
    check_email_exists,
    delete_employee
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def add_employee(employee: EmployeeCreate):
    """
    Create a new employee
    
    - **full_name**: Full name of the employee
    - **email**: Valid email address (must be unique)
    - **department**: Department name
    """
    try:
        # Check if email already exists
        if check_email_exists(employee.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{employee.email}' already exists"
            )
        
        # Create employee
        new_employee = create_employee(
            full_name=employee.full_name,
            email=employee.email,
            department=employee.department
        )
        
        return new_employee
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding employee: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create employee"
        )


@router.get("/", response_model=list[EmployeeResponse])
def list_employees():
    """
    Get all employees
    
    Returns a list of all employees in the system
    """
    try:
        employees = get_all_employees()
        return employees
    except Exception as e:
        logger.error(f"Error listing employees: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve employees"
        )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str):
    """
    Get employee by ID
    
    - **employee_id**: Employee ID (e.g., EMP001)
    """
    try:
        employee = get_employee_by_id(employee_id)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        
        return employee
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting employee: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve employee"
        )


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
def remove_employee(employee_id: str):
    """
    Delete an employee
    
    - **employee_id**: Employee ID (e.g., EMP001)
    
    Note: This will also delete all attendance records for this employee
    """
    try:
        deleted = delete_employee(employee_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        
        return {"message": f"Employee '{employee_id}' deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting employee: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete employee"
        )
