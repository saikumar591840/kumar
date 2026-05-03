const express = require('express');
const router = express.Router();
const { signup, login, getUsers, forgotPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/users', protect, admin, getUsers);

module.exports = router;
