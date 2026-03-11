import { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import Table from './Table';
import Toast from './Toast';
import './Employees.css';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeAPI.create(formData);
      setFormData({ full_name: '', email: '', department: '' });
      setShowModal(false);
      setSuccess('Employee created successfully!');
      loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!confirm(`Delete employee ${employeeId}?`)) return;
    
    try {
      await employeeAPI.delete(employeeId);
      setSuccess('Employee deleted successfully!');
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      key: 'employee_id',
      width: '120px',
      render: (value) => (
        <span className="badge badge-blue">{value}</span>
      )
    },
    {
      header: 'Full Name',
      key: 'full_name',
      render: (value) => (
        <span className="employee-name">{value}</span>
      )
    },
    {
      header: 'Email',
      key: 'email',
      render: (value) => (
        <span className="text-secondary">{value}</span>
      )
    },
    {
      header: 'Department',
      key: 'department',
    },
    {
      header: 'Joined',
      key: 'created_at',
      width: '140px',
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  ];

  return (
    <div className="page-container">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="page-subtitle">Manage your organization's workforce</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span className="btn-icon">+</span>
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={employees}
          actions={(employee) => (
            <button
              className="btn-icon-danger"
              onClick={() => handleDelete(employee.employee_id)}
              title="Delete employee"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john.doe@company.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Department <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Engineering"
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
