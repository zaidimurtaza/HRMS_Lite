import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, ClipboardList, Calendar, BarChart3 } from 'lucide-react';
import Employees from './pages/Employees';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceRecords from './pages/AttendanceRecords';
import AttendanceSummary from './pages/AttendanceSummary';
import { cn } from './lib/utils';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Employees',
      icon: Users,
      path: '/employees',
    },
    {
      title: 'Mark Attendance',
      icon: Calendar,
      path: '/mark-attendance',
    },
    {
      title: 'Attendance Records',
      icon: ClipboardList,
      path: '/attendance-records',
    },
    {
      title: 'Attendance Summary',
      icon: BarChart3,
      path: '/attendance-summary',
    },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">HRMS Lite</h1>
        <p className="text-slate-400 text-sm mt-1">HR Management System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-slate-400 text-sm">
        <p>© 2026 HRMS Lite</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Employees />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/mark-attendance" element={<MarkAttendance />} />
            <Route path="/attendance-records" element={<AttendanceRecords />} />
            <Route path="/attendance-summary" element={<AttendanceSummary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
