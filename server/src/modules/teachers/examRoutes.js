const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./examController');

const ensureTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Teachers only' });
  }
  next();
};

const ensureStudent = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Students only' });
  }
  next();
};

// ===== TEACHER ROUTES =====
router.get('/teacher/exams', auth, ensureTeacher, ctrl.getExams);
router.post('/teacher/exams', auth, ensureTeacher, ctrl.createExam);
router.get('/teacher/exams/:id', auth, ensureTeacher, ctrl.getExamById);
router.put('/teacher/exams/:id', auth, ensureTeacher, ctrl.updateExam);
router.delete('/teacher/exams/:id', auth, ensureTeacher, ctrl.deleteExam);
router.put('/teacher/exams/:id/publish', auth, ensureTeacher, ctrl.publishExam);
router.put('/teacher/exams/:id/close', auth, ensureTeacher, ctrl.closeExam);

// Questions
router.get('/teacher/exams/:examId/questions', auth, ensureTeacher, ctrl.getQuestions);
router.post('/teacher/exams/:examId/questions', auth, ensureTeacher, ctrl.addQuestion);
router.put('/teacher/exams/:examId/questions/:questionId', auth, ensureTeacher, ctrl.updateQuestion);
router.delete('/teacher/exams/:examId/questions/:questionId', auth, ensureTeacher, ctrl.deleteQuestion);

// Submissions
router.get('/teacher/exams/:examId/submissions', auth, ensureTeacher, ctrl.getSubmissions);

// ===== STUDENT ROUTES =====
router.get('/student/exams', auth, ensureStudent, ctrl.getPublishedExams);
router.get('/student/exams/:id', auth, ensureStudent, ctrl.getExamForAttempt);
router.post('/student/exams/:id/submit', auth, ensureStudent, ctrl.submitExam);
router.get('/student/exams/:id/my-submission', auth, ensureStudent, ctrl.getMySubmission);

module.exports = router;
