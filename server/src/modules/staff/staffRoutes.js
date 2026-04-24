const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllStudents, getStudentDetails, getInventory,
  getRecentActivities, getAllComplaints, updateComplaintStatus,
  getComplaintActions, getComplaintActionById, createComplaintAction, updateComplaintAction, deleteComplaintAction,
  getComplaintFeedbacks, getComplaintFeedbackById, createComplaintFeedback, updateComplaintFeedback, deleteComplaintFeedback,
  getAllBooks, getBookById, createBook, updateBook, deleteBook,
  getBookCategories, getBookCategoryById, createBookCategory, updateBookCategory, deleteBookCategory,
  getBorrowedBooks, getBorrowedBookById, createBorrowedBook, updateBorrowedBook,
  getBookPurchases, getBookPurchaseById, createBookPurchase, updateBookPurchase, deleteBookPurchase,
  getBookSales, getBookSaleById, createBookSale, updateBookSale, deleteBookSale,
  getLibraryStats, getComplaintStats
} = require('./staffController');
const auth = require('../../middleware/auth');

router.use(auth);

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
router.get('/complaint-actions/:id', getComplaintActionById);
router.post('/complaint-actions', createComplaintAction);
router.put('/complaint-actions/:id', updateComplaintAction);
router.delete('/complaint-actions/:id', deleteComplaintAction);
router.get('/complaint-feedbacks', getComplaintFeedbacks);
router.get('/complaint-feedbacks/:id', getComplaintFeedbackById);
router.post('/complaint-feedbacks', createComplaintFeedback);
router.put('/complaint-feedbacks/:id', updateComplaintFeedback);
router.delete('/complaint-feedbacks/:id', deleteComplaintFeedback);

// Library
router.get('/library/books', getAllBooks);
router.get('/library/books/:id', getBookById);
router.post('/library/books', createBook);
router.put('/library/books/:id', updateBook);
router.delete('/library/books/:id', deleteBook);
router.get('/library/categories', getBookCategories);
router.get('/library/categories/:id', getBookCategoryById);
router.post('/library/categories', createBookCategory);
router.put('/library/categories/:id', updateBookCategory);
router.delete('/library/categories/:id', deleteBookCategory);
router.get('/library/borrowed', getBorrowedBooks);
router.get('/library/borrowed/:id', getBorrowedBookById);
router.post('/library/borrowed', createBorrowedBook);
router.put('/library/borrowed/:id', updateBorrowedBook);
router.get('/library/purchases', getBookPurchases);
router.get('/library/purchases/:id', getBookPurchaseById);
router.post('/library/purchases', createBookPurchase);
router.put('/library/purchases/:id', updateBookPurchase);
router.delete('/library/purchases/:id', deleteBookPurchase);
router.get('/library/sales', getBookSales);
router.get('/library/sales/:id', getBookSaleById);
router.post('/library/sales', createBookSale);
router.put('/library/sales/:id', updateBookSale);
router.delete('/library/sales/:id', deleteBookSale);
router.get('/library/stats', getLibraryStats);

module.exports = router;
