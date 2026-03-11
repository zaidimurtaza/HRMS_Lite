"""Database queries for employees and attendance"""

import logging
from app.database.postgres import execute_query

logger = logging.getLogger(__name__)


def create_employee(full_name, email, department):
    """Create a new employee"""
    query = """
        INSERT INTO employees (full_name, email, department)
        VALUES (%s, %s, %s)
        RETURNING id, employee_id, full_name, email, department, created_at
    """
    result = execute_query(query, (full_name, email, department), fetch_one=True, commit=True)
    logger.info(f"Created employee: {result['employee_id']}")
    return result


def get_all_employees():
    """Get all employees"""
    query = """
        SELECT id, employee_id, full_name, email, department, created_at
        FROM employees
        ORDER BY id DESC
    """
    employees = execute_query(query)
    logger.info(f"Retrieved {len(employees)} employees")
    return employees


def get_employees_paginated(search=None, page=1, limit=10):
    """Get employees with search and pagination"""
    offset = (page - 1) * limit
    
    # Build WHERE clause for search
    where_clause = ""
    params = []
    if search:
        where_clause = """
            WHERE full_name ILIKE %s 
            OR email ILIKE %s 
            OR employee_id ILIKE %s
        """
        search_pattern = f"%{search}%"
        params = [search_pattern, search_pattern, search_pattern]
    
    # Get total count
    count_query = f"SELECT COUNT(*) as count FROM employees {where_clause}"
    count_result = execute_query(count_query, params if params else None, fetch_one=True)
    total = count_result['count']
    
    # Get paginated data
    data_query = f"""
        SELECT id, employee_id, full_name, email, department, created_at
        FROM employees
        {where_clause}
        ORDER BY id DESC
        LIMIT %s OFFSET %s
    """
    data_params = params + [limit, offset] if params else [limit, offset]
    employees = execute_query(data_query, data_params)
    
    logger.info(f"Retrieved {len(employees)} of {total} employees (page {page})")
    return employees, total


def get_employee_by_id(employee_id):
    """Get employee by employee_id"""
    query = """
        SELECT id, employee_id, full_name, email, department, created_at
        FROM employees
        WHERE employee_id = %s
    """
    return execute_query(query, (employee_id,), fetch_one=True)


def update_employee(employee_id, full_name=None, email=None, department=None):
    """Update employee details"""
    updates = []
    params = []
    
    if full_name is not None:
        updates.append("full_name = %s")
        params.append(full_name)
    
    if email is not None:
        updates.append("email = %s")
        params.append(email)
    
    if department is not None:
        updates.append("department = %s")
        params.append(department)
    
    if not updates:
        return None
    
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.append(employee_id)
    
    query = f"""
        UPDATE employees
        SET {', '.join(updates)}
        WHERE employee_id = %s
        RETURNING id, employee_id, full_name, email, department, created_at
    """
    
    result = execute_query(query, params, fetch_one=True, commit=True)
    logger.info(f"Updated employee: {employee_id}")
    return result


def check_email_exists(email):
    """Check if email already exists"""
    query = "SELECT COUNT(*) as count FROM employees WHERE email = %s"
    result = execute_query(query, (email,), fetch_one=True)
    return result['count'] > 0


def delete_employee(employee_id):
    """Delete employee by employee_id"""
    query = "DELETE FROM employees WHERE employee_id = %s"
    deleted_count = execute_query(query, (employee_id,), commit=True)
    
    if deleted_count > 0:
        logger.info(f"Deleted employee: {employee_id}")
    else:
        logger.warning(f"Employee not found: {employee_id}")
    
    return deleted_count > 0


def mark_attendance(employee_id, date, status):
    """Mark attendance for an employee"""
    query = """
        INSERT INTO attendance (employee_id, date, status)
        VALUES (%s, %s, %s)
        ON CONFLICT (employee_id, date)
        DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
        RETURNING id, employee_id, date, status, created_at
    """
    result = execute_query(query, (employee_id, date, status), fetch_one=True, commit=True)
    logger.info(f"Marked attendance for {employee_id} on {date}: {status}")
    return result


def get_attendance_by_date(date):
    """Get attendance records for a specific date with employee details"""
    query = """
        SELECT 
            e.employee_id,
            e.full_name,
            e.department,
            a.status,
            a.date
        FROM employees e
        LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.date = %s
        ORDER BY e.id
    """
    records = execute_query(query, (date,))
    logger.info(f"Retrieved attendance for {len(records)} employees on {date}")
    return records


def get_all_attendance():
    """Get all attendance records with employee details"""
    query = """
        SELECT 
            a.id, a.employee_id, e.full_name, e.department,
            a.date, a.status, a.created_at
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        ORDER BY a.date DESC, a.employee_id
    """
    records = execute_query(query)
    logger.info(f"Retrieved {len(records)} attendance records")
    return records


def get_attendance_by_employee(employee_id):
    """Get attendance records for a specific employee"""
    query = """
        SELECT 
            a.id, a.employee_id, e.full_name, e.department,
            a.date, a.status, a.created_at
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        WHERE a.employee_id = %s
        ORDER BY a.date DESC
    """
    records = execute_query(query, (employee_id,))
    logger.info(f"Retrieved {len(records)} attendance records for {employee_id}")
    return records


def get_attendance_summary():
    """Get attendance summary (total present days per employee)"""
    query = """
        SELECT 
            e.employee_id, e.full_name, e.department,
            COUNT(*) FILTER (WHERE a.status = 'Present') as total_present,
            COUNT(*) FILTER (WHERE a.status = 'Absent') as total_absent,
            COUNT(*) as total_days
        FROM employees e
        LEFT JOIN attendance a ON e.employee_id = a.employee_id
        GROUP BY e.employee_id, e.full_name, e.department
        ORDER BY e.employee_id
    """
    summary = execute_query(query)
    logger.info(f"Retrieved attendance summary for {len(summary)} employees")
    return summary
