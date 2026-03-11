import { useState, useEffect } from 'react';
import { Loader2, Search, Download, Calendar } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import Toast from '../components/Toast';
import { cn } from '../lib/utils';
import { exportToExcel, exportToCSV } from '../lib/export';

export default function AttendanceRecords() {
  const [attendance, setAttendance] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, dateFilter, attendance]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await attendanceAPI.getAll();
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      
      case 'this-week': {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { start: startOfWeek, end: endOfWeek };
      }
      
      case 'this-month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: startOfMonth, end: endOfMonth };
      }
      
      case 'last-month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: startOfLastMonth, end: endOfLastMonth };
      }
      
      case 'this-year': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear() + 1, 0, 1);
        return { start: startOfYear, end: endOfYear };
      }
      
      default:
        return null;
    }
  };

  const applyFilters = () => {
    let filtered = [...attendance];

    // Apply date filter
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range) {
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= range.start && recordDate < range.end;
        });
      }
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(record => 
        record.employee_id.toLowerCase().includes(searchLower) ||
        record.full_name.toLowerCase().includes(searchLower) ||
        record.department.toLowerCase().includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower) ||
        new Date(record.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).toLowerCase().includes(searchLower)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleExport = (format) => {
    const exportData = filteredRecords.map(record => ({
      'Employee ID': record.employee_id,
      'Name': record.full_name,
      'Department': record.department,
      'Date': new Date(record.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      'Status': record.status
    }));

    const filename = `attendance_records_${dateFilter}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      exportToExcel(exportData, filename);
    } else {
      exportToCSV(exportData, filename);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Attendance Records</h1>
          <p className="text-slate-600 mt-2">View all attendance records across all employees</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, department, status, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Date Filter and Export */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 border border-slate-300 rounded-md bg-white px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-year">This Year</option>
              </select>
            </div>

            <button
              onClick={() => handleExport('excel')}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No attendance records</h3>
            <p className="text-slate-600">Mark attendance to see records here</p>
          </div>
        ) : (
          <>
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
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.employee_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {record.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}>
                          {record.status === 'Present' ? '● Present' : '● Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p>Showing: <span className="font-semibold text-slate-900">{filteredRecords.length}</span> of <span className="font-semibold text-slate-900">{attendance.length}</span> records</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
