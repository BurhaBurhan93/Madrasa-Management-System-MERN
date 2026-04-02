const express = require('express');
const router = express.Router();
const ctrl = require('./studentController');
const regCtrl = require('../../controllers/registrarController');
const authenticateToken = require('../../middleware/auth');

// Middleware to check if user is staff/admin (for registrar functions)
const ensureStaffOrAdmin = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Staff/Admin only.' });
  }
  next;
};

const ensureStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next;
};

// ================= REGISTRAR/STAFF ROUTES (No student middleware) =================
// These routes are for Registrar department use
router.use((req, res, next) => {
  // Check if it's a registrar route
  if (req.path.includes('/admissions') || 
      req.path.includes('/all') || 
      req.path.includes('/guardians') ||
      req.path.includes('/education-history') ||
      req.path.includes('/documents') ||
      req.path.includes('/transfer') ||
      req.path.includes('/promote') ||
      req.path.includes('/correct-data') ||
      req.path.includes('/audit-logs') ||
      req.path.includes('/reports')) {
    authenticateToken(req, res, () => {
      ensureStaffOrAdmin(req, res, next);
    });
  } else {
    // Student routes
    authenticateToken(req, res, () => {
      ensureStudent(req, res, next);
    });
  }
});

// Registrar routes - Admissions Management
router.get('/admissions', ctrl.getAllAdmissions); // Get all admissions
router.post('/admissions', ctrl.createAdmission); // Create new admission
router.put('/admissions/:id', ctrl.updateAdmission); // Update admission
router.delete('/admissions/:id', ctrl.deleteAdmission); // Delete admission
router.post('/admissions/:id/convert', ctrl.convertToStudent); // Convert to student

// Registrar routes - All Students Management
router.get('/all', ctrl.getAllStudents); // Get all students

// ================= REGISTRAR DEPARTMENT ROUTES =================

// Guardian Management
router.get('/guardians', regCtrl.getAllGuardians);
router.post('/guardians', regCtrl.createGuardian);
router.put('/guardians/:id', regCtrl.updateGuardian);
router.delete('/guardians/:id', regCtrl.deleteGuardian);

// Education History (Registrar view)
router.get('/education-history', regCtrl.getAllEducation);
router.post('/education-history', regCtrl.createEducation);
router.put('/education-history/:id', regCtrl.updateEducation);
router.delete('/education-history/:id', regCtrl.deleteEducation);

// Documents Management (Registrar view)
router.get('/documents', regCtrl.getAllDocuments);
router.post('/documents', regCtrl.createDocument);
router.put('/documents/:id', regCtrl.updateDocument);
router.delete('/documents/:id', regCtrl.deleteDocument);

// Class Assignment & Transfer
router.put('/students/:id/transfer', regCtrl.transferStudent);
router.post('/students/:id/promote', regCtrl.promoteStudent);

// Data Correction with Audit Trail
router.post('/students/:id/correct-data', regCtrl.correctStudentData);
router.get('/:entityType/:entityId/audit-logs', regCtrl.getAuditLogs);

// Reports & Export
router.get('/reports', regCtrl.getStudentReports);

// ================= STUDENT ROUTES =================

router.get('/profile', ctrl.getStudentProfile);
router.put('/profile', ctrl.updateStudentProfile);

router.get('/courses', ctrl.getStudentCourses);
router.get('/attendance', ctrl.getAttendanceRecords);
router.get('/assignments', ctrl.getAssignments);
router.get('/results', ctrl.getExamResults);

router.get('/fees', ctrl.getFeePayments);

router.get('/complaints', ctrl.getStudentComplaints);
router.post('/complaints', ctrl.submitComplaint);

// Leave routes
router.get('/leaves', ctrl.getStudentLeaves);
router.post('/leaves', ctrl.createStudentLeave);

// Education routes
router.get('/education', ctrl.getStudentEducation);
router.post('/education', ctrl.createStudentEducation);
router.put('/education/:id', ctrl.updateStudentEducation);
router.delete('/education/:id', ctrl.deleteStudentEducation);

// Degree routes
router.get('/degrees', ctrl.getStudentDegrees);

// Library routes
router.get('/books', ctrl.getBooks);
router.get('/borrowed-books', ctrl.getBorrowedBooks);
router.post('/books/:id/borrow', ctrl.borrowBook);
router.post('/books/:id/return', ctrl.returnBook);
router.post('/books/:id/renew', ctrl.renewBook);

// Documents and Results routes
router.get('/documents', ctrl.getStudentDocuments);
router.get('/final-results', ctrl.getStudentFinalResults);

module.exports = router;
