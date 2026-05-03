const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member or Admin
    if (req.user.role !== 'Admin' && !project.teamMembers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for user with filters
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res, next) => {
  try {
    const { search, status, priority, sortBy, sortOrder } = req.query;
    
    let query = {};
    if (req.user.role === 'Member') {
      query.assignedTo = req.user._id;
    }

    // Search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date desc
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('projectId', 'name').sort(sort);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task (Admin only)
// @route   POST /api/projects/:projectId/tasks
// @access  Private/Admin
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate, status, priority } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      projectId: req.params.projectId,
      assignedTo,
      dueDate,
      ...(status && { status }),
      ...(priority && { priority })
    });

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'created_task',
      description: `Created task "${title}" in project "${project.name}"`,
      projectId: req.params.projectId,
      taskId: task._id
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Member can only update assigned tasks. Admin can update any.
    if (req.user.role !== 'Admin') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Log activity if status changed
    if (req.body.status && req.body.status !== task.status) {
      const action = req.body.status === 'Done' ? 'completed_task' : 'updated_task';
      await Activity.create({
        user: req.user._id,
        action,
        description: `${req.body.status === 'Done' ? 'Completed' : 'Updated'} task "${task.title}" to ${req.body.status}`,
        projectId: task.projectId,
        taskId: task._id
      });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity log
// @route   GET /api/tasks/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 activities

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    let tasks;

    if (req.user.role === 'Admin') {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({ assignedTo: req.user._id });
    }

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const pending = total - completed;
    
    const now = new Date();
    const overdue = tasks.filter(t => {
      return t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < now;
    }).length;

    // Tasks per project
    const tasksPerProject = {};
    tasks.forEach(task => {
      const projectName = task.projectId?.name || 'Unknown Project';
      tasksPerProject[projectName] = (tasksPerProject[projectName] || 0) + 1;
    });

    // Tasks per user (for admin)
    let tasksPerUser = {};
    if (req.user.role === 'Admin') {
      const allTasks = await Task.find().populate('assignedTo', 'name');
      allTasks.forEach(task => {
        const userName = task.assignedTo?.name || 'Unassigned';
        tasksPerUser[userName] = (tasksPerUser[userName] || 0) + 1;
      });
    }

    res.json({
      total,
      completed,
      pending,
      overdue,
      tasksPerProject,
      tasksPerUser
    });

  } catch (error) {
    next(error);
  }
};
