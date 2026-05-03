const express = require('express');
const router = express.Router({ mergeParams: true }); // Important to access projectId from parent router
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getStats,
  getMyTasks,
  getActivities
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

// Base route: /api/tasks (for individual tasks)
// Or nested under projects: /api/projects/:projectId/tasks

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/stats')
  .get(protect, getStats);

router.route('/activities')
  .get(protect, getActivities);

router.route('/my-tasks')
  .get(protect, getMyTasks);

router.route('/:id')
  .put(protect, updateTask) // Both Admin and Member can update (Member restricted in controller)
  .delete(protect, admin, deleteTask);

module.exports = router;
