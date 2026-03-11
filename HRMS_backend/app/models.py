"""Pydantic models for request/response validation"""

from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    department: str


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus


class AttendanceListCreate(BaseModel):
    records: list[AttendanceCreate]


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    department: str
    date: date
    status: str
    created_at: datetime


class AttendanceSummary(BaseModel):
    employee_id: str
    full_name: str
    department: str
    total_present: int
    total_absent: int
    total_days: int


class PaginatedEmployeeResponse(BaseModel):
    data: list[EmployeeResponse]
    total: int
    page: int
    limit: int
    total_pages: int

