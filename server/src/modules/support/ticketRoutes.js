const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const SupportTicket = require('../../models/SupportTicket');

router.use(auth, authorizeRoles('admin', 'staff'));

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    const tickets = await SupportTicket.find(query)
      .populate('student', 'fullName studentCode')
      .populate('assignedTo', 'fullName employeeCode')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('student', 'fullName studentCode')
      .populate('assignedTo', 'fullName employeeCode')
      .populate('createdBy', 'name email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await SupportTicket.countDocuments();
    const ticketNumber = `ST-${Date.now()}-${count + 1}`;
    const ticket = await SupportTicket.create({
      ticketNumber,
      student: req.body.student || null,
      subject: req.body.subject || 'Untitled',
      description: req.body.description || '',
      category: req.body.category || 'other',
      priority: req.body.priority || 'medium',
      status: req.body.status || 'open',
      assignedTo: req.body.assignedTo || null,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.body.status === 'resolved' || req.body.status === 'closed') {
      updates.resolvedAt = new Date();
    }
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
