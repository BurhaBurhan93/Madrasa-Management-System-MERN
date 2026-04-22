const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const hrController = require('../hr/hrController');

router.use(auth);

router.post('/', hrController.markAttendance);
router.get('/date/:date', hrController.getAttendanceByDate);
router.get('/employee/:employeeId', hrController.getAttendanceByEmployee);
router.get('/summary', hrController.getAttendanceSummary);

module.exports = router;
