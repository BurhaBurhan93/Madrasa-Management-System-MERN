const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  getStudentDetails,
  getInventory,
  getRecentActivities,
  getAllComplaints,
  updateComplaintStatus
} = require('./staffController');
const authenticateToken = require('../../middleware/auth');

const ensureStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Staff only.' });
  }
  next();
};

router.use(authenticateToken);
router.use(ensureStaff);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);

// Students
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);

// Inventory
router.get('/inventory', getInventory);

// Complaints
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaintStatus);

module.exports = router;
