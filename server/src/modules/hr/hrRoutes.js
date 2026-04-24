const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const hrController = require('./hrController');

router.use(auth);

router.get('/departments', hrController.getAllDepartments);
router.get('/departments/:id', hrController.getDepartmentById);
router.post('/departments', hrController.createDepartment);
router.put('/departments/:id', hrController.updateDepartment);
router.delete('/departments/:id', hrController.deleteDepartment);

router.get('/designations', hrController.getAllDesignations);
router.get('/designations/department/:departmentId', hrController.getDesignationsByDepartment);
router.get('/designations/:id', hrController.getDesignationById);
router.post('/designations', hrController.createDesignation);
router.put('/designations/:id', hrController.updateDesignation);
router.delete('/designations/:id', hrController.deleteDesignation);

router.get('/leave-types', hrController.getAllLeaveTypes);
router.get('/leave-types/:id', hrController.getLeaveTypeById);
router.post('/leave-types', hrController.createLeaveType);
router.put('/leave-types/:id', hrController.updateLeaveType);
router.delete('/leave-types/:id', hrController.deleteLeaveType);

router.get('/employees', hrController.getAllEmployees);
router.get('/employees/stats', hrController.getEmployeeStats);
router.get('/employees/:id', hrController.getEmployeeById);
router.post('/employees', hrController.createEmployee);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);

router.post('/attendance', hrController.markAttendance);
router.get('/attendance/date/:date', hrController.getAttendanceByDate);
router.get('/attendance/employee/:employeeId', hrController.getAttendanceByEmployee);
router.get('/attendance/summary', hrController.getAttendanceSummary);

router.get('/leaves', hrController.getAllLeaves);
router.get('/leaves/:id', hrController.getLeaveById);
router.post('/leaves', hrController.createLeave);
router.put('/leaves/:id/approve', hrController.approveLeave);
router.put('/leaves/:id/reject', hrController.rejectLeave);
router.delete('/leaves/:id', hrController.deleteLeave);

module.exports = router;
