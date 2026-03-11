# HRMS Lite - Backend

A lightweight Human Resource Management System backend built with FastAPI and PostgreSQL.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: Raw SQL with psycopg2
- **Validation**: Pydantic

## Features

### Employee Management
- Add new employees (auto-generated Employee ID)
- View all employees with search and pagination
- Delete employees
- Export employee data (Excel/CSV)

### Attendance Management
- Mark daily attendance (Present/Absent)
- Bulk attendance marking
- View all attendance records
- View attendance by employee
- Attendance summary with statistics
- Filter attendance by date

## Project Structure

```
HRMS_backend/
├── app/
│   ├── database/
│   │   ├── postgres.py       # Database connection pool
│   │   └── queries.py        # SQL queries
│   ├── routes/
│   │   ├── employees.py      # Employee endpoints
│   │   └── attendance.py     # Attendance endpoints
│   ├── models.py             # Pydantic models
│   └── schema.sql            # Database schema
├── main.py                   # FastAPI app
├── logging_config.py         # Logging setup
├── requirements.txt          # Dependencies
└── .env                      # Environment variables
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd HRMS_lite/HRMS_backend
```

### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=your_host
POSTGRES_PORT=5432
POSTGRES_DB=your_database
```

### 5. Setup database

Run the SQL schema from `app/schema.sql` in your PostgreSQL database.

The schema includes:
- `employees` table with auto-generated employee_id
- `attendance` table with foreign key constraints
- Triggers for auto-updating timestamps

### 6. Run the application

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Employees

- `POST /api/employees/` - Create new employee
- `GET /api/employees/` - Get all employees
- `GET /api/employees/{employee_id}` - Get employee by ID
- `DELETE /api/employees/{employee_id}` - Delete employee

### Attendance

- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/` - Get all attendance records
- `GET /api/attendance/employee/{employee_id}` - Get attendance for specific employee
- `GET /api/attendance/summary` - Get attendance summary

## Example Requests

### Create Employee

```bash
curl -X POST "http://localhost:8000/api/employees/" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering"
  }'
```

### Mark Attendance

```bash
curl -X POST "http://localhost:8000/api/attendance/" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "date": "2026-03-11",
    "status": "Present"
  }'
```

## Deployment

### Railway / Render

1. Create a new PostgreSQL database
2. Set environment variables
3. Deploy the application
4. The database schema will need to be set up manually

### Environment Variables for Production

```env
POSTGRES_USER=<db_username>
POSTGRES_PASSWORD=<db_password>
POSTGRES_HOST=<db_host>
POSTGRES_PORT=5432
POSTGRES_DB=<db_name>
```

## Validations

- **Email**: Must be valid email format and unique
- **Employee ID**: Auto-generated (EMP001, EMP002, ...)
- **Attendance**: One record per employee per day
- **Status**: Must be "Present" or "Absent"

## Error Handling

The API returns proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Assumptions & Limitations

- Single admin user (no authentication required as per assignment)
- Employee IDs are auto-generated sequentially
- Deleting an employee cascades to delete their attendance records
- Attendance can be updated for the same date (upsert behavior)

## Development

### Test the database connection

```bash
python app/database/postgres.py
```

### Run with hot reload

```bash
uvicorn main:app --reload
```

## License

This is an assignment project for evaluation purposes.
