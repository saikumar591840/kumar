import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    tasksPerProject: {},
    tasksPerUser: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/tasks/stats');
        
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening with your tasks today.</p>
          {error && <div className="auth-error" style={{marginTop: '1rem'}}>{error}</div>}
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">{stats.total}</p>
            <div style={{ marginTop: '1rem', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--primary)' }}></div>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value" style={{ color: 'var(--success)' }}>{stats.completed}</p>
            <div style={{ marginTop: '1rem', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : '0%', height: '100%', background: 'var(--success)' }}></div>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-value" style={{ color: '#60a5fa' }}>{stats.pending}</p>
            <div style={{ marginTop: '1rem', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: stats.total ? `${(stats.pending / stats.total) * 100}%` : '0%', height: '100%', background: '#60a5fa' }}></div>
            </div>
          </div>
          
          <div className="stat-card stat-overdue">
            <h3>Overdue</h3>
            <p className="stat-value" style={{ color: 'var(--error)' }}>{stats.overdue}</p>
            <div style={{ marginTop: '1rem', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: stats.total ? `${(stats.overdue / stats.total) * 100}%` : '0%', height: '100%', background: 'var(--error)' }}></div>
            </div>
          </div>
      </div>
      
      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* Task Status Pie Chart */}
        <div className="stat-card">
          <h3>Task Status Distribution</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pie
              data={{
                labels: ['Completed', 'Pending', 'Overdue'],
                datasets: [{
                  data: [stats.completed, stats.pending, stats.overdue],
                  backgroundColor: [
                    'rgba(34, 197, 153, 0.8)',
                    'rgba(96, 165, 250, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    'rgba(34, 197, 153, 1)',
                    'rgba(96, 165, 250, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'var(--text-main)',
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Tasks per Project Bar Chart */}
        <div className="stat-card">
          <h3>Tasks per Project</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bar
              data={{
                labels: Object.keys(stats.tasksPerProject),
                datasets: [{
                  label: 'Tasks',
                  data: Object.values(stats.tasksPerProject),
                  backgroundColor: 'rgba(124, 58, 237, 0.8)',
                  borderColor: 'rgba(124, 58, 237, 1)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'var(--text-main)',
                      stepSize: 1
                    },
                    grid: {
                      color: 'var(--border)'
                    }
                  },
                  x: {
                    ticks: {
                      color: 'var(--text-main)',
                      maxRotation: 45,
                      minRotation: 45
                    },
                    grid: {
                      color: 'var(--border)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
