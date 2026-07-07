const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const hrController = require('../hr/hrController');

router.use(auth, authorizeRoles('admin', 'staff', 'teacher'));

router.get('/warnings', hrController.getAttendanceWarnings);
router.put('/warnings/:id', hrController.dismissAttendanceWarning);
router.post('/warnings/:id/notify', hrController.notifyAttendanceWarning);
router.get('/settings', hrController.getAttendanceSettings);
router.put('/settings', hrController.updateAttendanceSettings);
router.post('/', hrController.markAttendance);
router.get('/date/:date', hrController.getAttendanceByDate);
router.get('/employee/:employeeId', hrController.getAttendanceByEmployee);
router.get('/summary', hrController.getAttendanceSummary);
router.get('/corrections', hrController.getAttendanceCorrections);
router.post('/corrections', hrController.createAttendanceCorrection);
router.put('/corrections/:id/approve', hrController.approveAttendanceCorrection);
router.put('/corrections/:id/reject', hrController.rejectAttendanceCorrection);

module.exports = router;
