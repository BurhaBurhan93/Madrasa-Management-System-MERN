const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const Degree = require('../../models/Degree');
const Class = require('../../models/Class');
const Syllabus = require('../../models/Syllabus');
const Grading = require('../../models/Grading');

router.use(auth, authorizeRoles('admin', 'staff', 'teacher'));

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

// ── Syllabus ──────────────────────────────────────────────
router.get('/syllabus', async (req, res) => {
  try {
    const items = await Syllabus.find({ deletedAt: null }).sort({ className: 1, order: 1 });
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/syllabus', async (req, res) => {
  try {
    const item = await Syllabus.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/syllabus/:id', async (req, res) => {
  try {
    const item = await Syllabus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/syllabus/:id', async (req, res) => {
  try {
    await Syllabus.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Syllabus deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Grading ───────────────────────────────────────────────
router.get('/grading', async (req, res) => {
  try {
    const schemes = await Grading.find({ deletedAt: null }).sort({ name: 1 });
    res.json({ success: true, data: schemes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/grading', async (req, res) => {
  try {
    const scheme = await Grading.create(req.body);
    res.status(201).json({ success: true, data: scheme });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/grading/:id', async (req, res) => {
  try {
    const scheme = await Grading.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: scheme });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/grading/:id', async (req, res) => {
  try {
    await Grading.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Grading scheme deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Subjects ─────────────────────────────────────────────
const Subject = require('../../models/Subject');

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ deletedAt: null }).sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/subjects', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Exams (basic CRUD) ──────────────────────────────────────
const Exam = require('../../models/Exam');

router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/exams', async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/exams/:id', async (req, res) => {
  try {
    await Exam.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
