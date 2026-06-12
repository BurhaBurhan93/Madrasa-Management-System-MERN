const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/communicationController');
const authenticateToken = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');

// All communication routes require authentication
router.use(authenticateToken);

// Messages
router.get('/messages', ctrl.getMessages);
router.post('/messages', ctrl.sendMessage);
router.put('/messages/:id/read', ctrl.markAsRead);

// Announcements (creation restricted to admin/staff)
router.get('/announcements', ctrl.getAnnouncements);
router.post('/announcements', authorizeRoles('admin', 'staff'), ctrl.createAnnouncement);

module.exports = router;
