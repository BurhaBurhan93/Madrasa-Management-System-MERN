const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('./authController');
const authenticateToken = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Demo login — returns a real JWT for demo credentials without hitting DB
router.post('/demo-login', (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'staff', 'teacher', 'student'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = {
    id: `demo-${role}-001`,
    name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `${role}@gmail.com`,
    role,
  };
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ success: true, token, user });
});

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
