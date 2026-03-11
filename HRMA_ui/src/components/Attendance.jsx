import { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import Table from './Table';
import Toast from './Toast';
import './Attendance.css';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [originalAttendanceMap, setOriginalAttendanceMap] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'mark') {
        const dateRecords = await attendanceAPI.getByDate(selectedDate);
        setEmployees(dateRecords);
        
        const initialMap = {};
        dateRecords.forEach(emp => {
          initialMap[emp.employee_id] = emp.status;
        });
        setAttendanceMap(initialMap);
        setOriginalAttendanceMap(initialMap); // Save original state
      } else if (activeTab === 'records') {
        const attData = await attendanceAPI.getAll();
        setAttendance(attData);
      } else if (activeTab === 'summary') {
        const sumData = await attendanceAPI.getSummary();
        setSummary(sumData);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (employeeId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  const hasChanges = () => {
    return Object.entries(attendanceMap).some(([employee_id, status]) => {
      return status !== null && status !== originalAttendanceMap[employee_id];
    });
  };

  const handleSubmitAll = async () => {
    // Only include records that changed or are newly marked
    const records = Object.entries(attendanceMap)
      .filter(([employee_id, status]) => {
        // Include if status is not null AND it's different from original
        return status !== null && status !== originalAttendanceMap[employee_id];
      })
      .map(([employee_id, status]) => ({
        employee_id,
        date: selectedDate,
        status
      }));

    if (records.length === 0) {
      setError('No changes to save');
      return;
    }

    setSubmitting(true);
    try {
      await attendanceAPI.mark(records);
      setSuccess(`Attendance updated for ${records.length} employee(s)`);
      
      // Reload data to show updated attendance
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const recordColumns = [
    {
      header: 'Employee ID',
      key: 'employee_id',
      width: '120px',
      render: (value) => <span className="badge badge-blue">{value}</span>
    },
    {
      header: 'Employee Name',
      key: 'full_name',
      render: (value) => <span className="employee-name">{value}</span>
    },
    {
      header: 'Department',
      key: 'department',
    },
    {
      header: 'Date',
      key: 'date',
      width: '140px',
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },
    {
      header: 'Status',
      key: 'status',
      width: '100px',
      render: (value) => (
        <span className={`status-badge status-${value.toLowerCase()}`}>
          {value}
        </span>
      )
    }
  ];

  const summaryColumns = [
    {
      header: 'Employee ID',
      key: 'employee_id',
      width: '120px',
      render: (value) => <span className="badge badge-blue">{value}</span>
    },
    {
      header: 'Employee Name',
      key: 'full_name',
      render: (value) => <span className="employee-name">{value}</span>
    },
    {
      header: 'Department',
      key: 'department',
    },
    {
      header: 'Present',
      key: 'total_present',
      width: '100px',
      render: (value) => (
        <span className="stat-value stat-present">{value}</span>
      )
    },
    {
      header: 'Absent',
      key: 'total_absent',
      width: '100px',
      render: (value) => (
        <span className="stat-value stat-absent">{value}</span>
      )
    },
    {
      header: 'Total Days',
      key: 'total_days',
      width: '100px',
      render: (value) => (
        <span className="stat-value">{value}</span>
      )
    }
  ];

  return (
    <div className="page-container">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p className="page-subtitle">Track and manage employee attendance records</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'mark' ? 'active' : ''}`}
          onClick={() => setActiveTab('mark')}
        >
          Mark Attendance
        </button>
        <button 
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Records
        </button>
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
      </div>

      {activeTab === 'mark' && (
        loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-message">
            <div className="empty-icon">👥</div>
            <h3>No Employees Found</h3>
            <p>Add employees first before marking attendance</p>
          </div>
        ) : (
          <div className="attendance-mark-container">
            <div className="date-selector">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>

            <div className="attendance-list">
              {employees.map((employee) => (
                <div key={employee.employee_id} className="attendance-row">
                  <div className="employee-info">
                    <span className="badge badge-blue">{employee.employee_id}</span>
                    <div className="employee-details">
                      <span className="employee-name">{employee.full_name}</span>
                      <span className="employee-dept">{employee.department}</span>
                    </div>
                  </div>
                  <div className="attendance-controls">
                    <button
                      className={`status-btn ${attendanceMap[employee.employee_id] === 'Present' ? 'active present' : ''}`}
                      onClick={() => handleStatusChange(employee.employee_id, 'Present')}
                    >
                      ✓ Present
                    </button>
                    <button
                      className={`status-btn ${attendanceMap[employee.employee_id] === 'Absent' ? 'active absent' : ''}`}
                      onClick={() => handleStatusChange(employee.employee_id, 'Absent')}
                    >
                      ✕ Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="submit-container">
              <button
                className="btn btn-primary btn-large"
                onClick={handleSubmitAll}
                disabled={submitting || !hasChanges()}
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )
      )}

      {activeTab === 'records' && (
        loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : (
          <Table columns={recordColumns} data={attendance} />
        )
      )}

      {activeTab === 'summary' && (
        loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading summary...</p>
          </div>
        ) : (
          <Table columns={summaryColumns} data={summary} />
        )
      )}
    </div>
  );
}
