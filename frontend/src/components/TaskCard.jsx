import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const TaskCard = ({ task, columnStatus, onUpdateStatus, onDelete }) => {
  const { user } = useContext(AuthContext);
  
  const canEdit = user?.role === 'Admin' || task.assignedTo?._id === user?._id;
  const isOverdue = task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();

  return (
    <div className={`task-card modern-card status-border-${columnStatus.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="task-card-header">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="project-badge">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
          <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
            {task.priority || 'Medium'}
          </span>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => onDelete(task._id)} 
            className="delete-btn"
            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            &times;
          </button>
        )}
      </div>
      
      <h4 className="task-title">{task.title}</h4>
      <p className="task-desc">{task.description}</p>
      
      <div className="task-footer">
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'text-error' : ''}`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        
        {canEdit ? (
          <select 
            value={task.status} 
            onChange={(e) => onUpdateStatus(task._id, e.target.value)}
            className={`status-dropdown status-select-${columnStatus.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        ) : (
          <span className={`status-${columnStatus.replace(/\s+/g, '-').toLowerCase()}`} style={{ fontSize: '0.875rem' }}>
            {task.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
