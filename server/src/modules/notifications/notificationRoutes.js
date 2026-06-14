const express = require('express');
const router = express.Router();
const ctrl = require('./notificationController');
const auth = require('../../middleware/auth');

// All notification routes require authentication
router.use(auth);

router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/:id/read', ctrl.markAsRead);
router.put('/mark-all-read', ctrl.markAllAsRead);
router.delete('/:id', ctrl.deleteNotification);
router.delete('/', ctrl.deleteAll);

module.exports = router;
