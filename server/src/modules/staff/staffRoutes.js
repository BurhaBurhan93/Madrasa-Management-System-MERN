const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  getStudentDetails,
  getInventory,
  getRecentActivities,
  getAllComplaints,
  updateComplaintStatus,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  getLibraryStats,
  getComplaintStats
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
router.get('/complaints/stats', getComplaintStats);

// Library Management
router.get('/library/books', getAllBooks);
router.post('/library/books', createBook);
router.put('/library/books/:id', updateBook);
router.delete('/library/books/:id', deleteBook);
router.get('/library/categories', getBookCategories);
router.get('/library/stats', getLibraryStats);

module.exports = router;
