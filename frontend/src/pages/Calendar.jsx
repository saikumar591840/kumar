import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks/my-tasks');
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tasks');
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return <div className="loading-screen">Loading calendar...</div>;

  const days = getDaysInMonth(currentDate);
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Task Calendar</h1>
        <p>View your tasks organized by due date.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Calendar Grid */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <div>
              <button onClick={() => navigateMonth(-1)} style={{ marginRight: '0.5rem', padding: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                ‹
              </button>
              <button onClick={() => navigateMonth(1)} style={{ padding: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                ›
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {dayNames.map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', padding: '0.5rem' }}>
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const hasOverdue = dayTasks.some(task => task.status !== 'Done' && date < new Date());
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  style={{
                    minHeight: '80px',
                    padding: '0.5rem',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '0.5rem',
                    background: isToday ? 'rgba(124, 58, 237, 0.1)' : 'var(--card-bg)',
                    cursor: date ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  {date && (
                    <>
                      <div style={{ fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>
                        {date.getDate()}
                      </div>
                      {dayTasks.length > 0 && (
                        <div style={{ marginTop: '0.25rem' }}>
                          {dayTasks.slice(0, 3).map(task => (
                            <div
                              key={task._id}
                              style={{
                                fontSize: '0.7rem',
                                background: hasOverdue ? 'var(--error)' : task.status === 'Done' ? 'var(--success)' : 'var(--primary)',
                                color: 'white',
                                padding: '0.1rem 0.3rem',
                                borderRadius: '0.25rem',
                                marginBottom: '0.1rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="stat-card">
          <h3>
            {selectedDate
              ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Select a date'
            }
          </h3>
          <div style={{ marginTop: '1rem' }}>
            {selectedTasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                {selectedDate ? 'No tasks due on this date.' : 'Click on a date to view tasks.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTasks.map(task => (
                  <div
                    key={task._id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.4)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      borderLeft: `4px solid ${task.status === 'Done' ? 'var(--success)' : task.status === 'In Progress' ? 'var(--warning)' : 'var(--primary)'}`
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {task.projectId?.name} • {task.status}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;