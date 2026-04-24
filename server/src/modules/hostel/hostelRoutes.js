const express = require('express');
const router = express.Router();
const hostelController = require('./hostelController');

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

module.exports = router;
