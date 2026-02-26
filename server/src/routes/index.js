const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('../modules/auth/authRoutes');
const studentRoutes = require('../modules/students/studentRoutes');
const teacherRoutes = require('../modules/teachers/teacherRoutes');
const staffRoutes = require('../modules/staff/staffRoutes');
const academicRoutes = require('../modules/academic/academicRoutes');
const attendanceRoutes = require('../modules/attendance/attendanceRoutes');
const financeRoutes = require('../modules/finance/financeRoutes');
const libraryRoutes = require('../modules/library/libraryRoutes');
const complaintRoutes = require('../modules/complaints/complaintRoutes');
const hrRoutes = require('../modules/hr/hrRoutes');
const kitchenRoutes = require('../modules/kitchen/kitchenRoutes');
const userRoutes = require('../modules/users/userRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/staff', staffRoutes);
router.use('/academic', academicRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/finance', financeRoutes);
router.use('/library', libraryRoutes);
router.use('/complaints', complaintRoutes);
router.use('/hr', hrRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/users', userRoutes);

module.exports = router;
