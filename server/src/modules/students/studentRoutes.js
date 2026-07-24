const express = require('express');
const router = express.Router();
const ctrl = require('./studentController');
const regCtrl = require('../../controllers/registrarController');
const authenticateToken = require('../../middleware/auth');

const STAFF_MANAGEMENT_PREFIXES = [
  '/admissions',
  '/all',
  '/guardians',
  '/education-history',
  '/reports'
];

const STUDENT_SPECIFIC_PATHS = [
  '/profile',
  '/courses',
  '/exams',
  '/attendance',
  '/assignments',
  '/results',
  '/fees',
  '/complaints',
  '/leaves',
  '/education',
  '/degrees',
  '/books',
  '/borrowed-books',
  '/purchases',
  '/final-results',
  '/library/stats',
  '/hostel'
];

const STAFF_MANAGEMENT_METHODS = new Set(['POST', 'PUT', 'DELETE']);

const isStaffManagementRoute = (reqPath, method) => {
  // Explicitly check if it's a student-specific path (regardless of method)
  const isStudentPath = STUDENT_SPECIFIC_PATHS.some(prefix => 
    reqPath === prefix || reqPath.startsWith(`${prefix}/`)
  );
  if (isStudentPath) return false;

  if (reqPath === '/' && STAFF_MANAGEMENT_METHODS.has(method)) return true;
  if (reqPath.startsWith('/students/')) {
    return (
      reqPath.includes('/transfer') ||
      reqPath.includes('/promote') ||
      reqPath.includes('/correct-data') ||
      reqPath.includes('/audit-logs')
    );
  }

  if (STAFF_MANAGEMENT_PREFIXES.some((prefix) => reqPath === prefix || reqPath.startsWith(`${prefix}/`))) {
    return true;
  }

  return STAFF_MANAGEMENT_METHODS.has(method) && /^\/[^/]+$/.test(reqPath) && reqPath !== '/profile';
};

// Middleware to check if user is staff/admin (for registrar functions)
const ensureStaffOrAdmin = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Staff/Admin only.' });
  }
  next();
};

const ensureStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next();
};

// ================= REGISTRAR/STAFF ROUTES (No student middleware) =================
// These routes are for Registrar department use
router.use((req, res, next) => {
  // First authenticate the token
  authenticateToken(req, res, () => {
    const isStaffRoute = isStaffManagementRoute(req.path, req.method);
    const isStudentPath = STUDENT_SPECIFIC_PATHS.some(prefix => 
      req.path === prefix || req.path.startsWith(`${prefix}/`)
    );
    
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      // Staff/admin - allow unless it's a purely student-only path
      if (isStudentPath && !isStaffRoute) {
        ensureStudent(req, res, next);
      } else {
        next();
      }
    } else if (req.user.role === 'student') {
      if (isStudentPath || !isStaffRoute) {
        ensureStudent(req, res, next);
      } else {
        res.status(403).json({ message: 'Access denied. Staff/Admin only.' });
      }
    } else {
      res.status(403).json({ message: 'Access denied.' });
    }
  });
});

// Registrar routes - Admissions Management
router.get('/admissions', ctrl.getAllAdmissions); // Get all admissions
router.post('/admissions', ctrl.createAdmission); // Create new admission
router.put('/admissions/:id', ctrl.updateAdmission); // Update admission
router.delete('/admissions/:id', ctrl.deleteAdmission); // Delete admission
router.post('/admissions/:id/convert', ctrl.convertToStudent); // Convert to student

// Registrar routes - All Students Management
router.get('/all', ctrl.getAllStudents); // Get all students
router.get('/all/:id', async (req, res) => { // Get single student by ID
  try {
    const Student = require('../../models/Student');
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone image')
      .populate('currentClass', 'name')
      .lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/', ctrl.createStudent); // Create new student (for registrar)
router.put('/:id', ctrl.updateStudent); // Update student
router.put('/all/:id', ctrl.updateStudent); // Update student via all endpoint
router.delete('/:id', ctrl.deleteStudent); // Delete student
router.delete('/all/:id', ctrl.deleteStudent); // Delete student via all endpoint

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
router.get('/exams', ctrl.getExams);
router.get('/exams/:id', ctrl.getExamDetails);
router.get('/exams/:id/my-submission', ctrl.getExamSubmission);
router.post('/exams/:id/submit', ctrl.submitExam);
router.get('/attendance', ctrl.getAttendanceRecords);
router.get('/assignments', ctrl.getAssignments);
router.post('/assignments/submit', ctrl.submitAssignment);
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

// Library stats route
router.get('/library/stats', async (req, res) => {
  try {
    const Book = require('../../models/Book');
    const BookCategory = require('../../models/BookCategory');
    const TOTAL_STATS = { ebooks: 0, journals: 0, audiobooks: 0, videos: 0, labs: 0 };
    const categories = await BookCategory.find({ deletedAt: null }).lean();
    const counts = await Book.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[String(c._id)] = c.count; });
    categories.forEach(cat => {
      const key = cat.name.toLowerCase().replace(/[^a-z]/g, '');
      const count = countMap[String(cat._id)] || 0;
      if (key.includes('ebook') || key.includes('digital')) TOTAL_STATS.ebooks += count;
      else if (key.includes('journal') || key.includes('research')) TOTAL_STATS.journals += count;
      else if (key.includes('audio') || key.includes('podcast')) TOTAL_STATS.audiobooks += count;
      else if (key.includes('video') || key.includes('lecture')) TOTAL_STATS.videos += count;
      else if (key.includes('lab') || key.includes('simulation')) TOTAL_STATS.labs += count;
      else TOTAL_STATS.ebooks += count;
    });
    res.json(TOTAL_STATS);
  } catch (error) {
    res.json({ ebooks: 0, journals: 0, audiobooks: 0, videos: 0, labs: 0 });
  }
});

// Purchase routes
router.get('/purchases', ctrl.getStudentPurchases);

// Documents and Results routes
router.get('/documents', ctrl.getStudentDocuments);
router.get('/final-results', ctrl.getStudentFinalResults);

// Student Hostel Routes
router.get('/hostel', async (req, res) => {
  try {
    const Student = require('../../models/Student');
    const HostelAllocation = require('../../models/HostelAllocation');
    const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email phone image');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const allocation = await HostelAllocation.findOne({
      student: student._id,
      status: 'active',
      deletedAt: null
    }).populate('room');

    const isResident = Boolean(allocation);
    res.json({
      success: true,
      data: {
        isResident,
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          studentCode: student.studentCode
        },
        room: allocation?.room || null,
        allocation: allocation || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/hostel/application', async (req, res) => {
  try {
    const Complaint = require('../../models/Complaint');
    const Student = require('../../models/Student');
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const application = await Complaint.create({
      complaintCode: `HOSTEL-${Date.now()}`,
      complainantType: 'student',
      complainant: req.user.id,
      subject: 'Hostel Application Request',
      description: [
        `Reason: ${req.body.reason || 'N/A'}`,
        `Room Preference: ${req.body.roomPreference || 'Any'}`,
        `Requested Move-in Date: ${req.body.moveInDate || 'ASAP'}`,
        req.body.notes ? `Notes: ${req.body.notes}` : ''
      ].filter(Boolean).join('\n'),
      complaintCategory: 'hostel_application',
      priorityLevel: 'medium',
      complaintStatus: 'open'
    });
    res.status(201).json({ success: true, message: 'Hostel application submitted', data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/hostel/application', async (req, res) => {
  try {
    const Complaint = require('../../models/Complaint');
    const application = await Complaint.findOne({
      complainant: req.user.id,
      complaintCategory: 'hostel_application'
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
