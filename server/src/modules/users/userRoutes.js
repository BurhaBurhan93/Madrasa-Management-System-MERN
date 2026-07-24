const express = require('express');
const router = express.Router();
const userController = require('./userController');
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const User = require('../../models/User');

router.use(auth);

// Students list for relation dropdowns (accessible by admin, staff, teacher)
router.get('/students', authorizeRoles('admin', 'staff', 'teacher'), async (req, res) => {
  try {
    const users = await User.find({ role: 'student', deletedAt: null }).select('name email').sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'User routes working!' });
});

// Teachers can get their own profile
router.get('/me', authorizeRoles('teacher', 'admin', 'staff'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Teachers can get their own user by ID
router.get('/:id', authorizeRoles('admin', 'staff', 'teacher'), userController.getUserById);

// Teachers can update their own profile
router.put('/:id', authorizeRoles('admin', 'staff', 'teacher'), userController.updateUser);

// Admin and staff user management routes
router.use(authorizeRoles('admin', 'staff'));
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.use(authorizeRoles('admin'));
router.delete('/:id', userController.deleteUser);

module.exports = router;
