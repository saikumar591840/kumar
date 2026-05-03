import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Task Manager</h2>
      </div>
      
      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/projects" className={`nav-item ${isActive('/projects') ? 'active' : ''}`}>
          <span className="icon">📁</span>
          <span>Projects</span>
        </Link>
        <Link to="/tasks" className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}>
          <span className="icon">✓</span>
          <span>My Tasks</span>
        </Link>
        <Link to="/calendar" className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}>
          <span className="icon">📅</span>
          <span>Calendar</span>
        </Link>
        <Link to="/activity" className={`nav-item ${isActive('/activity') ? 'active' : ''}`}>
          <span className="icon">📋</span>
          <span>Activity Log</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          <span className="icon">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
        <button onClick={handleLogout} className="logout-btn">
          <span className="icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
