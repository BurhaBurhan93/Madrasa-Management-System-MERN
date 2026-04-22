const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Degree = require('../../models/Degree');
const Class = require('../../models/Class');

router.use(auth);

// ── Degrees ──────────────────────────────────────────────
router.get('/degrees', async (req, res) => {
  try {
    const degrees = await Degree.find({ deletedAt: null }).sort({ name: 1 });
    res.json({ success: true, data: degrees });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/degrees/:id', async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);
    if (!degree) return res.status(404).json({ success: false, message: 'Degree not found' });
    res.json({ success: true, data: degree });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/degrees', async (req, res) => {
  try {
    const degree = await Degree.create(req.body);
    res.status(201).json({ success: true, data: degree });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/degrees/:id', async (req, res) => {
  try {
    const degree = await Degree.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!degree) return res.status(404).json({ success: false, message: 'Degree not found' });
    res.json({ success: true, data: degree });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/degrees/:id', async (req, res) => {
  try {
    await Degree.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Degree deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Classes ───────────────────────────────────────────────
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find({ deletedAt: null }).sort({ name: 1 });
    res.json({ success: true, data: classes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/classes/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/classes', async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Class deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
