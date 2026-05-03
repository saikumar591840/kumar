const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get all projects (Members can view)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      // Admin sees all projects
      projects = await Project.find().populate('createdBy', 'name email').populate('teamMembers', 'name email');
    } else {
      // Members only see projects they are added to
      projects = await Project.find({ teamMembers: req.user._id }).populate('createdBy', 'name email').populate('teamMembers', 'name email');
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project (Admin only)
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      teamMembers: [req.user._id] // Creator is implicitly a member
    });

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'created_project',
      description: `Created project "${name}"`,
      projectId: project._id
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project (Admin only)
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project (Admin only)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project (Admin only)
// @route   POST /api/projects/:id/members
// @access  Private/Admin
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.teamMembers.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.teamMembers.push(userId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from project (Admin only)
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.teamMembers = project.teamMembers.filter(
      (memberId) => memberId.toString() !== req.params.userId
    );
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
