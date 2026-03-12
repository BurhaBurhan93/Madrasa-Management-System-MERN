const express = require('express');
const router = express.Router();
const userController = require('./userController');

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'User routes working!' });
});

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
