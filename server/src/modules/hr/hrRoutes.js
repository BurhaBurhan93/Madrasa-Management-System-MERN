const express = require('express');
const router = express.Router();
const hrController = require('./hrController');
const { protect } = require('../../middleware/auth');

// Department Routes
router.get('/departments', protect, hrController.getAllDepartments);
router.get('/departments/:id', protect, hrController.getDepartmentById);
router.post('/departments', protect, hrController.createDepartment);
router.put('/departments/:id', protect, hrController.updateDepartment);
router.delete('/departments/:id', protect, hrController.deleteDepartment);

// Designation Routes
router.get('/designations', protect, hrController.getAllDesignations);
router.get('/designations/department/:departmentId', protect, hrController.getDesignationsByDepartment);
router.get('/designations/:id', protect, hrController.getDesignationById);
router.post('/designations', protect, hrController.createDesignation);
router.put('/designations/:id', protect, hrController.updateDesignation);
router.delete('/designations/:id', protect, hrController.deleteDesignation);

// Leave Type Routes
router.get('/leave-types', protect, hrController.getAllLeaveTypes);
router.get('/leave-types/:id', protect, hrController.getLeaveTypeById);
router.post('/leave-types', protect, hrController.createLeaveType);
router.put('/leave-types/:id', protect, hrController.updateLeaveType);
router.delete('/leave-types/:id', protect, hrController.deleteLeaveType);

// Employee Routes
router.get('/employees', protect, hrController.getAllEmployees);
router.get('/employees/stats', protect, hrController.getEmployeeStats);
router.get('/employees/:id', protect, hrController.getEmployeeById);
router.post('/employees', protect, hrController.createEmployee);
router.put('/employees/:id', protect, hrController.updateEmployee);
router.delete('/employees/:id', protect, hrController.deleteEmployee);

// Employee Attendance Routes
router.post('/attendance', protect, hrController.markAttendance);
router.get('/attendance/date/:date', protect, hrController.getAttendanceByDate);
router.get('/attendance/employee/:employeeId', protect, hrController.getAttendanceByEmployee);
router.get('/attendance/summary', protect, hrController.getAttendanceSummary);

// Leave Routes
router.get('/leaves', protect, hrController.getAllLeaves);
router.get('/leaves/:id', protect, hrController.getLeaveById);
router.post('/leaves', protect, hrController.createLeave);
router.put('/leaves/:id/approve', protect, hrController.approveLeave);
router.put('/leaves/:id/reject', protect, hrController.rejectLeave);
router.delete('/leaves/:id', protect, hrController.deleteLeave);

module.exports = router;
