import { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import Toast from '../components/Toast';

export default function AttendanceSummary() {
  const [summary, setSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSummary();
  }, [search, summary]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await attendanceAPI.getSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSummary = () => {
    if (!search.trim()) {
      setFilteredSummary(summary);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = summary.filter(item => 
      item.employee_id.toLowerCase().includes(searchLower) ||
      item.full_name.toLowerCase().includes(searchLower) ||
      item.department.toLowerCase().includes(searchLower)
    );
    setFilteredSummary(filtered);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Attendance Summary</h1>
          <p className="text-slate-600 mt-2">Overview of attendance statistics for all employees</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : summary.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No summary data</h3>
            <p className="text-slate-600">Mark attendance to see statistics</p>
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
                    <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Present Days
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Absent Days
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Days
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSummary.map((item) => {
                    const attendanceRate = item.total_days > 0 
                      ? ((item.total_present / item.total_days) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <tr key={item.employee_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.employee_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {item.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            {item.total_present}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                            {item.total_absent}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-slate-900">{item.total_days}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{attendanceRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p>Showing: <span className="font-semibold text-slate-900">{filteredSummary.length}</span> of <span className="font-semibold text-slate-900">{summary.length}</span> employees</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
