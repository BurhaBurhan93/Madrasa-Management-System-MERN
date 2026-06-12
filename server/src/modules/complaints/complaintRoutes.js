const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const Complaint = require('../../models/Complaint');

router.use(auth);

// Get all complaints (admin/staff see all, students see own)
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.complainant = req.user.id;
    }
    if (req.query.status) {
      const statusMap = { pending: 'open', 'in-progress': 'in_progress', resolved: 'closed', open: 'open', in_progress: 'in_progress', closed: 'closed' };
      query.complaintStatus = statusMap[req.query.status] || req.query.status;
    }
    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ submittedDate: -1 });
    // Map to frontend-friendly format
    const mapped = complaints.map(c => ({
      _id: c._id,
      complaintCode: c.complaintCode,
      subject: c.subject,
      title: c.subject,
      description: c.description,
      status: c.complaintStatus === 'open' ? 'pending' : c.complaintStatus === 'in_progress' ? 'in-progress' : 'resolved',
      priority: c.priorityLevel,
      submittedBy: { name: c.complainant?.name, id: c.complainant?._id },
      userId: { name: c.complainant?.name, id: c.complainant?._id },
      assignedTo: c.assignedTo,
      createdAt: c.submittedDate,
      updatedAt: c.updatedAt,
      resolvedAt: c.closedAt,
      category: c.complaintCategory,
    }));
    res.json(mapped);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate('complainant', 'name email')
      .populate('assignedTo', 'name email');
    if (!c) return res.status(404).json({ message: 'Complaint not found' });
    res.json(c);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create complaint (all roles)
router.post('/', async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const code = `CMP-${Date.now()}-${count + 1}`;
    const complaint = await Complaint.create({
      complaintCode: code,
      complainantType: req.body.complainantType || req.user.role || 'student',
      complainant: req.body.complainant || req.user.id,
      complaintCategory: req.body.category || req.body.complaintCategory || 'general',
      subject: req.body.subject || req.body.title || 'Untitled',
      description: req.body.description || '',
      priorityLevel: req.body.priority || req.body.priorityLevel || 'medium',
      complaintStatus: req.body.status ? (req.body.status === 'pending' ? 'open' : req.body.status === 'resolved' ? 'closed' : req.body.status) : 'open',
      assignedTo: req.body.assignedTo || null,
    });
    res.status(201).json(complaint);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Update complaint (admin/staff only)
router.put('/:id', async (req, res) => {
  try {
    if (!['admin', 'staff', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only staff/admin can update complaints' });
    }
    const updates = { ...req.body };
    if (req.body.status) {
      const statusMap = { pending: 'open', 'in-progress': 'in_progress', resolved: 'closed', open: 'open', in_progress: 'in_progress', closed: 'closed' };
      updates.complaintStatus = statusMap[req.body.status] || req.body.status;
      if (req.body.status === 'resolved') updates.closedAt = new Date();
    }
    if (req.body.priority) updates.priorityLevel = req.body.priority;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete complaint (admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete complaints' });
    }
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
