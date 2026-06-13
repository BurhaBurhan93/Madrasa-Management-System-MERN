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

// Admin and staff user management routes
router.use(authorizeRoles('admin', 'staff'));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.use(authorizeRoles('admin'));
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
