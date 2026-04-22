const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./studentController');
const regCtrl = require('../../controllers/registrarController');

router.use(auth);

// Registrar / Staff routes
router.get('/admissions', ctrl.getAllAdmissions);
router.get('/admissions/:id', ctrl.getAdmissionById);
router.post('/admissions', ctrl.createAdmission);
router.put('/admissions/:id', ctrl.updateAdmission);
router.delete('/admissions/:id', ctrl.deleteAdmission);
router.post('/admissions/:id/convert', ctrl.convertToStudent);
router.get('/all', ctrl.getAllStudents);
router.get('/all/:id', ctrl.getStudentById);

router.get('/guardians', regCtrl.getAllGuardians);
router.get('/guardians/:id', regCtrl.getGuardianById);
router.post('/guardians', regCtrl.createGuardian);
router.put('/guardians/:id', regCtrl.updateGuardian);
router.delete('/guardians/:id', regCtrl.deleteGuardian);

router.get('/education-history', regCtrl.getAllEducation);
router.get('/education-history/:id', regCtrl.getEducationById);
router.get('/education', regCtrl.getAllEducation);
router.post('/education-history', regCtrl.createEducation);
router.put('/education-history/:id', regCtrl.updateEducation);
router.delete('/education-history/:id', regCtrl.deleteEducation);

router.get('/documents', regCtrl.getAllDocuments);
router.get('/documents/:id', regCtrl.getDocumentById);
router.post('/documents', regCtrl.createDocument);
router.put('/documents/:id', regCtrl.updateDocument);
router.delete('/documents/:id', regCtrl.deleteDocument);

router.put('/:id/transfer', regCtrl.transferStudent);
router.post('/:id/promote', regCtrl.promoteStudent);
router.post('/:id/correct-data', regCtrl.correctStudentData);
router.get('/:entityType/:entityId/audit-logs', regCtrl.getAuditLogs);
router.get('/reports', regCtrl.getStudentReports);

// Student self-service routes
router.get('/profile', ctrl.getStudentProfile);
router.put('/profile', ctrl.updateStudentProfile);
router.get('/courses', ctrl.getStudentCourses);
router.get('/attendance', ctrl.getAttendanceRecords);
router.get('/assignments', ctrl.getAssignments);
router.get('/results', ctrl.getExamResults);
router.get('/fees', ctrl.getFeePayments);
router.get('/complaints', ctrl.getStudentComplaints);
router.post('/complaints', ctrl.submitComplaint);
router.get('/leaves', ctrl.getStudentLeaves);
router.post('/leaves', ctrl.createStudentLeave);
router.get('/education', ctrl.getStudentEducation);
router.post('/education', ctrl.createStudentEducation);
router.put('/education/:id', ctrl.updateStudentEducation);
router.delete('/education/:id', ctrl.deleteStudentEducation);
router.get('/degrees', ctrl.getStudentDegrees);
router.get('/books', ctrl.getBooks);
router.get('/borrowed-books', ctrl.getBorrowedBooks);
router.post('/books/:id/borrow', ctrl.borrowBook);
router.post('/books/:id/return', ctrl.returnBook);
router.post('/books/:id/renew', ctrl.renewBook);
router.get('/final-results', ctrl.getStudentFinalResults);

module.exports = router;
