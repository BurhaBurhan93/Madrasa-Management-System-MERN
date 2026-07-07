const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/eventController');
const authenticateToken = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/', ctrl.getEvents);
router.post('/', ctrl.createEvent);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
