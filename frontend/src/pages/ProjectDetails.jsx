import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import TaskCard from '../components/TaskCard';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Task Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      
      const { data: allProjects } = await api.get('/api/projects');
      const currentProject = allProjects.find(p => p._id === id);
      
      if (!currentProject) {
        setError('Project not found or you do not have access.');
        setLoading(false);
        return;
      }
      
      setProject(currentProject);

      const { data: taskData } = await api.get(`/api/projects/${id}/tasks`);
      setTasks(taskData);
      
      if (user?.role === 'Admin') {
        const { data: userData } = await api.get('/api/auth/users');
        setUsers(userData);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setActionError('Task title is required');
      setTimeout(() => setActionError(''), 3000);
      return;
    }

    try {
      await api.post(`/api/projects/${id}/tasks`, { 
        title, 
        description, 
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        status,
        priority
      });
      
      addToast('Task created successfully!', 'success');
      if (assignedTo) {
        addToast('Task assigned to team member.', 'success');
      }

      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      setStatus('Todo');
      setPriority('Medium');
      setShowTaskForm(false);
      fetchProjectAndTasks();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create task');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      addToast('Task status updated', 'success');
      fetchProjectAndTasks();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      addToast('Task deleted', 'success');
      fetchProjectAndTasks();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete task');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/api/projects/${id}/members`, { userId: selectedUserId });
      addToast('Team member added successfully', 'success');
      setSelectedUserId('');
      fetchProjectAndTasks();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add member');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/api/projects/${id}/members/${userId}`);
      addToast('Team member removed', 'success');
      fetchProjectAndTasks();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  if (loading) return <div className="loading-screen">Loading project details...</div>;
  if (error) return <div className="auth-error" style={{ margin: '2rem' }}>{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/projects" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Projects</Link>
          <h1>{project?.name}</h1>
          <p>{project?.description}</p>
        </div>
        {user?.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => setShowTeamForm(!showTeamForm)} style={{ marginTop: 0 }}>
              {showTeamForm ? 'Hide Team' : 'Manage Team'}
            </button>
            <button className="btn-primary" onClick={() => setShowTaskForm(!showTaskForm)} style={{ marginTop: 0 }}>
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>
        )}
      </div>

      {actionError && <div className="auth-error" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.2)', marginBottom: '2rem' }}>{actionError}</div>}

      {showTeamForm && user?.role === 'Admin' && (
        <div className="auth-card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
          <h3>Manage Team Members</h3>
          <form onSubmit={handleAddMember} className="auth-form" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Select User to Add</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', width: '100%' }}>
                <option value="">-- Choose User --</option>
                {users.filter(u => !project.teamMembers.find(m => m._id === u._id)).map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={!selectedUserId} style={{ padding: '0.75rem 1.5rem', marginBottom: 0 }}>Add to Project</button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <h4>Current Team Members</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {project?.teamMembers.map(member => (
                <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>{member.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({member.email})</span>
                  </div>
                  {project.createdBy !== member._id && (
                    <button onClick={() => handleRemoveMember(member._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                  {project.createdBy === member._id && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Creator</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTaskForm && (
        <div className="auth-card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask} className="auth-form" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white' }}>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To (Member ID)</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white' }}>
                  <option value="">Unassigned</option>
                  {project.teamMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>Create Task</button>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search tasks by title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', color: 'white', flex: 1, minWidth: '200px' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', color: 'white' }}
        >
          <option value="All">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', color: 'white' }}
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select 
          value={assignedToFilter} 
          onChange={(e) => setAssignedToFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', color: 'white' }}
        >
          <option value="All">All Members</option>
          <option value="Unassigned">Unassigned</option>
          {project?.teamMembers?.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {['Todo', 'In Progress', 'Done'].map(columnStatus => {
          // Apply filters
          const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
            
            let matchesAssignee = true;
            if (assignedToFilter === 'Unassigned') {
              matchesAssignee = !task.assignedTo;
            } else if (assignedToFilter !== 'All') {
              matchesAssignee = task.assignedTo?._id === assignedToFilter || task.assignedTo === assignedToFilter;
            }
            
            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
          });

          return (
            <div key={columnStatus} className="task-column">
              <h3 className={`column-header status-${columnStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                {columnStatus} <span className="task-count">{filteredTasks.filter(t => t.status === columnStatus).length}</span>
              </h3>
              <div className="task-list">
                {filteredTasks.filter(t => t.status === columnStatus).map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    columnStatus={columnStatus} 
                    onUpdateStatus={handleUpdateTaskStatus} 
                    onDelete={handleDeleteTask} 
                  />
                ))}
                {filteredTasks.filter(t => t.status === columnStatus).length === 0 && (
                  <p className="empty-state">No tasks here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetails;
