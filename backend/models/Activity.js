const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: ['created_project', 'updated_project', 'deleted_project', 'added_member', 'removed_member', 'created_task', 'updated_task', 'deleted_task', 'completed_task']
  },
  description: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);