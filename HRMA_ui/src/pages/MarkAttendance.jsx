import { useState, useEffect } from 'react';
import { Loader2, Save, Calendar, Search } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import Toast from '../components/Toast';
import { cn } from '../lib/utils';

export default function MarkAttendance() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [originalAttendanceMap, setOriginalAttendanceMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    filterEmployees();
  }, [search, employees]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dateRecords = await attendanceAPI.getByDate(selectedDate);
      setEmployees(dateRecords);
      
      const initialMap = {};
      dateRecords.forEach(emp => {
        initialMap[emp.employee_id] = emp.status;
      });
      setAttendanceMap(initialMap);
      setOriginalAttendanceMap(initialMap);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!search.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = employees.filter(emp => 
      emp.employee_id.toLowerCase().includes(searchLower) ||
      emp.full_name.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower)
    );
    setFilteredEmployees(filtered);
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
    const records = Object.entries(attendanceMap)
      .filter(([employee_id, status]) => {
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
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mark Attendance</h1>
            <p className="text-slate-600 mt-2">Record employee attendance for {formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={handleSubmitAll}
            disabled={submitting || !hasChanges()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Attendance
              </>
            )}
          </button>
        </div>

        {/* Date Picker and Search */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <label className="text-sm font-medium text-slate-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No employees found</h3>
            <p className="text-slate-600">Create employees first to mark attendance</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mark Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((employee) => {
                  const currentStatus = attendanceMap[employee.employee_id];
                  const hasChanged = currentStatus !== originalAttendanceMap[employee.employee_id];
                  
                  return (
                    <tr 
                      key={employee.employee_id} 
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        hasChanged && "bg-blue-50/50"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {employee.employee_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {employee.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentStatus === 'Present' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ● Present
                          </span>
                        ) : currentStatus === 'Absent' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ● Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Not marked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusChange(employee.employee_id, 'Present')}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                              currentStatus === 'Present'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(employee.employee_id, 'Absent')}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                              currentStatus === 'Absent'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {employees.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing: <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> of <span className="font-semibold text-slate-900">{employees.length}</span> employees
            </p>
            <p>
              Changes: <span className="font-semibold text-slate-900">
                {Object.entries(attendanceMap).filter(([id, status]) => 
                  status !== null && status !== originalAttendanceMap[id]
                ).length}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
