const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const hostelController = require('./hostelController');

// Student hostel application — students only
router.post('/applications', auth, authorizeRoles('student'), hostelController.submitHostelApplication);
router.get('/applications/my', auth, authorizeRoles('student'), hostelController.getMyHostelApplication);

// All other routes — staff/admin only
router.use(auth, authorizeRoles('staff', 'admin'));

// ==================== ROOM ROUTES ====================
router.get('/rooms', hostelController.getAllRooms);
router.get('/rooms/available', hostelController.getAvailableRooms);
router.get('/rooms/:id', hostelController.getRoomById);
router.post('/rooms', hostelController.createRoom);
router.put('/rooms/:id', hostelController.updateRoom);
router.delete('/rooms/:id', hostelController.deleteRoom);

// ==================== ALLOCATION ROUTES ====================
router.get('/allocations', hostelController.getAllAllocations);
router.get('/allocations/:id', hostelController.getAllocationById);
router.post('/allocations', hostelController.createAllocation);
router.put('/allocations/:id', hostelController.updateAllocation);
router.delete('/allocations/:id', hostelController.deleteAllocation);
router.put('/allocations/:id/checkout', hostelController.checkoutAllocation);

// ==================== MEAL ROUTES ====================
router.get('/meals', hostelController.getAllMeals);
router.get('/meals/upcoming', hostelController.getUpcomingMeals);
router.get('/meals/:id', hostelController.getMealById);
router.post('/meals', hostelController.createMeal);
router.put('/meals/:id', hostelController.updateMeal);
router.delete('/meals/:id', hostelController.deleteMeal);

// ==================== MEAL ATTENDANCE ROUTES ====================
router.get('/meal-attendance', hostelController.getMealAttendance);
router.post('/meal-attendance', hostelController.markAttendance);

// ==================== STUDENT HOSTEL ROUTES ====================
router.get('/students/:userId/hostel', hostelController.getStudentHostelInfo);

// ==================== HOSTEL APPLICATION ROUTES (staff) ====================
router.get('/applications', hostelController.getAllHostelApplications);
router.put('/applications/:id/approve', hostelController.approveHostelApplication);
router.put('/applications/:id/reject', hostelController.rejectHostelApplication);

module.exports = router;
