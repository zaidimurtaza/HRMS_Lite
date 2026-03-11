const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    
    // Handle FastAPI validation errors
    if (Array.isArray(error.detail)) {
      const messages = error.detail.map(err => {
        const field = err.loc[err.loc.length - 1];
        return `${field}: ${err.msg}`;
      });
      throw new Error(messages.join(', '));
    }
    
    // Handle string detail
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const employeeAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/employees/?${searchParams}`);
    return handleResponse(response);
  },

  create: async (employee) => {
    const response = await fetch(`${API_URL}/api/employees/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    return handleResponse(response);
  },

  delete: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/employees/${employeeId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

export const attendanceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/attendance/`);
    return handleResponse(response);
  },

  getByDate: async (date) => {
    const response = await fetch(`${API_URL}/api/attendance/date/${date}`);
    return handleResponse(response);
  },

  getByEmployee: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/attendance/employee/${employeeId}`);
    return handleResponse(response);
  },

  mark: async (attendance) => {
    const response = await fetch(`${API_URL}/api/attendance/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(attendance) ? { records: attendance } : attendance)
    });
    return handleResponse(response);
  },

  getSummary: async () => {
    const response = await fetch(`${API_URL}/api/attendance/summary`);
    return handleResponse(response);
  }
};
