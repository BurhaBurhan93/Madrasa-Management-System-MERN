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
  getComplaintActions,
  createComplaintAction,
  updateComplaintAction,
  deleteComplaintAction,
  getComplaintFeedbacks,
  createComplaintFeedback,
  updateComplaintFeedback,
  deleteComplaintFeedback,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
  getBorrowedBooks,
  createBorrowedBook,
  updateBorrowedBook,
  getBookPurchases,
  createBookPurchase,
  updateBookPurchase,
  deleteBookPurchase,
  getBookSales,
  createBookSale,
  updateBookSale,
  deleteBookSale,
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
router.get('/complaint-actions', getComplaintActions);
router.post('/complaint-actions', createComplaintAction);
router.put('/complaint-actions/:id', updateComplaintAction);
router.delete('/complaint-actions/:id', deleteComplaintAction);
router.get('/complaint-feedbacks', getComplaintFeedbacks);
router.post('/complaint-feedbacks', createComplaintFeedback);
router.put('/complaint-feedbacks/:id', updateComplaintFeedback);
router.delete('/complaint-feedbacks/:id', deleteComplaintFeedback);

// Library Management
router.get('/library/books', getAllBooks);
router.post('/library/books', createBook);
router.put('/library/books/:id', updateBook);
router.delete('/library/books/:id', deleteBook);
router.get('/library/categories', getBookCategories);
router.post('/library/categories', createBookCategory);
router.put('/library/categories/:id', updateBookCategory);
router.delete('/library/categories/:id', deleteBookCategory);
router.get('/library/borrowed', getBorrowedBooks);
router.post('/library/borrowed', createBorrowedBook);
router.put('/library/borrowed/:id', updateBorrowedBook);
router.get('/library/purchases', getBookPurchases);
router.post('/library/purchases', createBookPurchase);
router.put('/library/purchases/:id', updateBookPurchase);
router.delete('/library/purchases/:id', deleteBookPurchase);
router.get('/library/sales', getBookSales);
router.post('/library/sales', createBookSale);
router.put('/library/sales/:id', updateBookSale);
router.delete('/library/sales/:id', deleteBookSale);
router.get('/library/stats', getLibraryStats);

module.exports = router;
