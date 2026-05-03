import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const ActivityLog = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks/activities');
      setActivities(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch activity log');
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'created_project': return '📁';
      case 'updated_project': return '✏️';
      case 'deleted_project': return '🗑️';
      case 'added_member': return '👥';
      case 'removed_member': return '👤';
      case 'created_task': return '✓';
      case 'updated_task': return '🔄';
      case 'completed_task': return '✅';
      case 'deleted_task': return '❌';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <div className="loading-screen">Loading activity log...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Activity Log</h1>
        <p>Track all project and task activities.</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div className="stat-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No activities yet. Start by creating a project or task!
            </p>
          ) : (
            activities.map(activity => (
              <div
                key={activity._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'rgba(15, 23, 42, 0.4)'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>
                  {getActivityIcon(activity.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {activity.description}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    by {activity.user?.name} • {formatDate(activity.createdAt)}
                    {activity.projectId && (
                      <span> • {activity.projectId.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;