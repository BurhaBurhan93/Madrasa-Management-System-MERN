const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./examController');

router.get('/teacher/exams', auth, ctrl.getExams);
router.post('/teacher/exams', auth, ctrl.createExam);
router.get('/teacher/exams/:id', auth, ctrl.getExamById);
router.put('/teacher/exams/:id', auth, ctrl.updateExam);
router.delete('/teacher/exams/:id', auth, ctrl.deleteExam);
router.put('/teacher/exams/:id/publish', auth, ctrl.publishExam);
router.put('/teacher/exams/:id/close', auth, ctrl.closeExam);
router.get('/teacher/exams/:examId/questions', auth, ctrl.getQuestions);
router.post('/teacher/exams/:examId/questions', auth, ctrl.addQuestion);
router.put('/teacher/exams/:examId/questions/:questionId', auth, ctrl.updateQuestion);
router.delete('/teacher/exams/:examId/questions/:questionId', auth, ctrl.deleteQuestion);
router.get('/teacher/exams/:examId/submissions', auth, ctrl.getSubmissions);

router.get('/student/exams', auth, ctrl.getPublishedExams);
router.get('/student/exams/:id', auth, ctrl.getExamForAttempt);
router.post('/student/exams/:id/submit', auth, ctrl.submitExam);
router.get('/student/exams/:id/my-submission', auth, ctrl.getMySubmission);

module.exports = router;
