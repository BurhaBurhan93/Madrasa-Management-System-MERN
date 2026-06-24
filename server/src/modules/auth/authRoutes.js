const express = require('express');
const router = express.Router();
const { demoLogin, login, register, logout, getMe } = require('./authController');
const authenticateToken = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Public routes
router.post('/login', 
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'student', 'teacher', 'staff']).withMessage('Invalid role'),
  validate,
  login
);
router.post('/register', 
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'student', 'teacher', 'staff']).withMessage('Invalid role'),
  validate,
  register
);
router.post('/demo-login', 
  body('role').isIn(['admin', 'student', 'teacher', 'staff']).withMessage('Invalid role'),
  validate,
  demoLogin
);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', logout);

module.exports = router;
