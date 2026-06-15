const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/auth');
const User = require('../../models/User');
const Student = require('../../models/Student');
const Employee = require('../../models/Employee');
const Class = require('../../models/Class');
const Subject = require('../../models/Subject');
const MadrasaInfo = require('../../models/MadrasaInfo');

const ensureAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

router.use(authenticateToken);
router.use(ensureAdmin);

// Admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await Employee.countDocuments({ type: 'teacher', status: 'active' });
    const totalStaff = await Employee.countDocuments({ type: 'staff', status: 'active' });
    const totalClasses = await Class.countDocuments();
    const totalSubjects = await Subject.countDocuments({ isActive: true });

    res.json({
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      totalSubjects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Madrasa info
router.get('/madrasa-info', async (req, res) => {
  try {
    const info = await MadrasaInfo.findOne().populate('updatedBy', 'name');
    res.json(info || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save (upsert) Madrasa info
router.put('/madrasa-info', async (req, res) => {
  try {
    const existing = await MadrasaInfo.findOne();
    const data = { ...req.body, updatedBy: req.user._id || req.user.id };
    let info;
    if (existing) {
      info = await MadrasaInfo.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
    } else {
      info = await MadrasaInfo.create(data);
    }
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
