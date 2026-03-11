import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Employees from './components/Employees';
import Attendance from './components/Attendance';
import './App.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h1>HRMS Lite</h1>
      </div>
      <div className="nav-links">
        <Link 
          to="/employees" 
          className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`}
        >
          👥 Employees
        </Link>
        <Link 
          to="/attendance" 
          className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}
        >
          📋 Attendance
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Employees />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>HRMS Lite © 2026 - Built with FastAPI & React</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
