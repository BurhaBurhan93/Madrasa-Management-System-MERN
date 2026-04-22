const express = require('express');
const router = express.Router();
const userController = require('./userController');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

router.use(auth);

// Students list for relation dropdowns
router.get('/students', async (req, res) => {
  try {
    const users = await User.find({ role: 'student', deletedAt: null }).select('name email').sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'User routes working!' });
});

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
