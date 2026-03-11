"""Attendance management routes"""

from fastapi import APIRouter, HTTPException, status
from app.models import AttendanceCreate, AttendanceListCreate, AttendanceResponse, AttendanceSummary
from app.database.queries import (
    mark_attendance,
    get_all_attendance,
    get_attendance_by_employee,
    get_attendance_by_date,
    get_attendance_summary,
    get_employee_by_id
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("/date/{date}")
def get_attendance_for_date(date: str):
    """Get attendance for all employees on a specific date"""
    try:
        records = get_attendance_by_date(date)
        return records
    except Exception as e:
        logger.error(f"Error getting attendance for date: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve attendance"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_attendance(data: AttendanceCreate | AttendanceListCreate):
    """Mark attendance for one or multiple employees"""
    try:
        records = data.records if isinstance(data, AttendanceListCreate) else [data]
        results = []
        errors = []
        
        for record in records:
            try:
                employee = get_employee_by_id(record.employee_id)
                if not employee:
                    errors.append(f"Employee '{record.employee_id}' not found")
                    continue
                
                result = mark_attendance(
                    employee_id=record.employee_id,
                    date=record.date,
                    status=record.status.value
                )
                results.append(result)
                
            except Exception as e:
                errors.append(f"Error for {record.employee_id}: {str(e)}")
        
        if len(records) == 1 and len(results) == 1:
            result = results[0]
            employee = get_employee_by_id(result['employee_id'])
            result['full_name'] = employee['full_name']
            result['department'] = employee['department']
            return result
        
        return {
            "success": len(results),
            "failed": len(errors),
            "errors": errors if errors else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking attendance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark attendance"
        )


@router.get("/", response_model=list[AttendanceResponse])
def list_attendance():
    """Get all attendance records"""
    try:
        records = get_all_attendance()
        return records
    except Exception as e:
        logger.error(f"Error listing attendance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve attendance records"
        )


@router.get("/employee/{employee_id}", response_model=list[AttendanceResponse])
def get_employee_attendance(employee_id: str):
    """Get attendance records for a specific employee"""
    try:
        employee = get_employee_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        
        records = get_attendance_by_employee(employee_id)
        return records
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting employee attendance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve attendance records"
        )


@router.get("/summary", response_model=list[AttendanceSummary])
def attendance_summary():
    """Get attendance summary for all employees"""
    try:
        summary = get_attendance_summary()
        return summary
    except Exception as e:
        logger.error(f"Error getting attendance summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve attendance summary"
        )
