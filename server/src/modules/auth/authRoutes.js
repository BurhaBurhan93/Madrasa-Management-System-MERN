const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('./authController');
const authenticateToken = require('../../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
