const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Subject'); // Assuming subjects are courses for students
const AttendanceRecord = require('../models/AttendanceRecord');
const Exam = require('../models/Exam');
const ExamAnswer = require('../models/ExamAnswer');
const FeePayment = require('../models/FeePayment');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');
const StudentLeave = require('../models/StudentLeave');
const StudentEducation = require('../models/StudentEducation');
const Admission = require('../models/Admission');

const jwt = require('jsonwebtoken');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      studentId: student.studentId,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      courseId: student.courseId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const { phone, address, dateOfBirth } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      { phone, address, dateOfBirth },
      { new: true }
    ).populate('userId');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      studentId: student.studentId,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      enrollmentDate: student.enrollmentDate,
      status: student.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student courses
const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Assuming courseId refers to Subject model
    const courses = await Course.find({ _id: { $in: student.courseId } });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ 
      studentId: req.user.id 
    }).populate('courseId');
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student assignments
const getAssignments = async (req, res) => {
  try {
    // Find student to get their enrolled courses
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get assignments for the student's courses
    const assignments = await Assignment.find({
      courseId: { $in: student.courseId }
    }).populate('courseId');
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student exam results
const getExamResults = async (req, res) => {
  try {
    const results = await ExamAnswer.find({ 
      studentId: req.user.id 
    })
      .populate('examId', 'title subject examType academicYear')
      .populate({ path: 'examId', populate: { path: 'createdBy', select: 'name' } })
      .lean();
    
    // Enrich results with teacher name from exam's createdBy
    const enrichedResults = results.map(result => ({
      ...result,
      teacherName: result.examId?.createdBy?.name || 'N/A',
      subjectName: result.examId?.subject?.name || 'N/A',
      examTitle: result.examId?.title || 'Exam',
      examType: result.examId?.examType?.name || 'General',
      academicYear: result.examId?.academicYear || new Date().getFullYear().toString()
    }));
    
    res.json(enrichedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student fee payments
const getFeePayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({ 
      studentId: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit complaint
const submitComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = new Complaint({
      complaintCode: `CMP-${Date.now()}`,
      complainantType: 'student',
      complainant: req.user.id,
      subject: title,
      description,
      complaintCategory: category,
      priorityLevel: priority || 'medium',
      complaintStatus: 'open'
    });

    await complaint.save();

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student complaints
const getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      complainant: req.user.id,
      complainantType: 'student'
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student leave records
const getStudentLeaves = async (req, res) => {
  try {
    const leaves = await StudentLeave.find({ student: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ requestedAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('[StudentController] Error fetching leaves:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create student leave request
const createStudentLeave = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const { leaveType, startDate, endDate, reason } = req.body;
    
    const leave = new StudentLeave({
      student: student._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      approvalStatus: 'pending'
    });
    
    await leave.save();
    console.log('[StudentController] Leave created:', leave._id);
    res.status(201).json(leave);
  } catch (error) {
    console.error('[StudentController] Error creating leave:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student education records
const getStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const education = await StudentEducation.find({ student: student._id })
      .sort({ createdAt: -1 });
    res.json(education);
  } catch (error) {
    console.error('[StudentController] Error fetching education:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create student education record
const createStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const { previousDegree, previousInstitution, location } = req.body;
    
    const education = new StudentEducation({
      student: student._id,
      previousDegree,
      previousInstitution,
      location
    });
    
    await education.save();
    console.log('[StudentController] Education record created:', education._id);
    res.status(201).json(education);
  } catch (error) {
    console.error('[StudentController] Error creating education:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update student education record
const updateStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const { previousDegree, previousInstitution, location } = req.body;
    
    const education = await StudentEducation.findOneAndUpdate(
      { _id: req.params.id, student: student._id },
      { previousDegree, previousInstitution, location },
      { new: true }
    );
    
    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }
    
    console.log('[StudentController] Education record updated:', education._id);
    res.json(education);
  } catch (error) {
    console.error('[StudentController] Error updating education:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete student education record
const deleteStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const education = await StudentEducation.findOneAndDelete({
      _id: req.params.id,
      student: student._id
    });
    
    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }
    
    console.log('[StudentController] Education record deleted:', req.params.id);
    res.json({ message: 'Education record deleted successfully' });
  } catch (error) {
    console.error('[StudentController] Error deleting education:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student degree records
const getStudentDegrees = async (req, res) => {
  try {
    const StudentDegree = require('../models/StudentDegree');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const degrees = await StudentDegree.find({ student: student._id })
      .populate('degree')
      .sort({ createdAt: -1 });
    
    console.log('[StudentController] Degrees fetched:', degrees.length);
    res.json(degrees);
  } catch (error) {
    console.error('[StudentController] Error fetching degrees:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all books for library
const getBooks = async (req, res) => {
  try {
    const Book = require('../models/Book');
    const books = await Book.find({ deletedAt: null })
      .populate('category', 'name')
      .sort({ title: 1 });
    
    console.log('[StudentController] Books fetched:', books.length);
    res.json(
      books.map((book) => ({
        _id: book._id,
        title: book.title,
        author: book.author || 'Unknown',
        isbn: book.isbn || '',
        category: book.category?.name || 'Uncategorized',
        status: book.stock > 0 ? 'available' : 'borrowed',
        stock: book.stock || 0,
        image: book.coverImage || 'https://via.placeholder.com/120x160/e5e7eb/6b7280?text=BOOK'
      }))
    );
  } catch (error) {
    console.error('[StudentController] Error fetching books:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's borrowed books
const getBorrowedBooks = async (req, res) => {
  try {
    const BorrowedBook = require('../models/BorrowedBook');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const borrowedBooks = await BorrowedBook.find({ 
      borrower: student._id,
      status: 'borrowed'
    })
      .populate('book')
      .sort({ borrowedAt: -1 });
    
    console.log('[StudentController] Borrowed books fetched:', borrowedBooks.length);
    res.json(
      borrowedBooks.map((record) => ({
        _id: record._id,
        id: record.book?._id || record._id,
        title: record.book?.title || 'Unknown book',
        author: record.book?.author || 'Unknown',
        isbn: record.book?.isbn || '',
        category: record.book?.category?.name || 'Uncategorized',
        borrowDate: record.borrowedAt,
        dueDate: record.returnDate,
        renewals: 0,
        status: record.returnDate && new Date(record.returnDate) < new Date() ? 'due_soon' : 'borrowed',
        image: record.book?.coverImage || 'https://via.placeholder.com/120x160/e5e7eb/6b7280?text=BOOK'
      }))
    );
  } catch (error) {
    console.error('[StudentController] Error fetching borrowed books:', error);
    res.status(500).json({ message: error.message });
  }
};

// Borrow a book
const borrowBook = async (req, res) => {
  try {
    const BorrowedBook = require('../models/BorrowedBook');
    const Book = require('../models/Book');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (book.stock <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }
    
    // Check if already borrowed
    const existingBorrow = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: 'borrowed'
    });
    
    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }
    
    // Create borrow record
    const borrowedBook = new BorrowedBook({
      book: bookId,
      borrower: student._id,
      borrowedAt: new Date(),
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'borrowed'
    });
    
    await borrowedBook.save();
    
    // Update book stock
    book.stock -= 1;
    await book.save();
    
    console.log('[StudentController] Book borrowed:', bookId);
    res.json({ message: 'Book borrowed successfully', borrowedBook });
  } catch (error) {
    console.error('[StudentController] Error borrowing book:', error);
    res.status(500).json({ message: error.message });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const BorrowedBook = require('../models/BorrowedBook');
    const Book = require('../models/Book');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const bookId = req.params.id;
    
    // Find the borrow record
    const borrowedBook = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: 'borrowed'
    });
    
    if (!borrowedBook) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    
    // Update borrow record
    borrowedBook.status = 'returned';
    borrowedBook.returnDate = new Date();
    await borrowedBook.save();
    
    // Update book stock
    const book = await Book.findById(bookId);
    if (book) {
      book.stock += 1;
      await book.save();
    }
    
    console.log('[StudentController] Book returned:', bookId);
    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    console.error('[StudentController] Error returning book:', error);
    res.status(500).json({ message: error.message });
  }
};

// Renew a book
const renewBook = async (req, res) => {
  try {
    const BorrowedBook = require('../models/BorrowedBook');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const bookId = req.params.id;
    
    // Find the borrow record
    const borrowedBook = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: 'borrowed'
    });
    
    if (!borrowedBook) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    
    // Extend return date by 7 days
    const currentReturnDate = new Date(borrowedBook.returnDate);
    borrowedBook.returnDate = new Date(currentReturnDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    await borrowedBook.save();
    
    console.log('[StudentController] Book renewed:', bookId);
    res.json({ message: 'Book renewed successfully', returnDate: borrowedBook.returnDate });
  } catch (error) {
    console.error('[StudentController] Error renewing book:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student documents
const getStudentDocuments = async (req, res) => {
  try {
    const UserDocument = require('../models/UserDocument');
    
    const documents = await UserDocument.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log('[StudentController] Documents fetched:', documents.length);
    res.json(documents);
  } catch (error) {
    console.error('[StudentController] Error fetching documents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student final results
const getStudentFinalResults = async (req, res) => {
  try {
    const FinalResult = require('../models/FinalResult');
    const Student = require('../models/Student');
    
    // Find the student record for this user
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    const results = await FinalResult.find({ student: student._id })
      .populate('exam')
      .populate('class')
      .sort({ createdAt: -1 });
    
    console.log('[StudentController] Final results fetched:', results.length);
    res.json(results);
  } catch (error) {
    console.error('[StudentController] Error fetching final results:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all students (for Registrar/Staff)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ deletedAt: null })
      .populate('user', 'name email phone')
      .populate('currentClass', 'className')
      .lean();
    
    // Merge student data with user data
    const enrichedStudents = students.map(student => ({
      ...student,
      firstName: student.user?.name?.split(' ')[0],
      lastName: student.user?.name?.split(' ')[1] || '',
      name: student.user?.name,
      email: student.user?.email,
      phone: student.user?.phone
    }));
    
    res.json({
      success: true,
      data: enrichedStudents
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all admissions (for Registrar/Staff)
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ deletedAt: null })
      .populate('degree', 'degreeName name')
      .lean();
    
    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create new admission
const createAdmission = async (req, res) => {
  try {
    const admissionData = req.body;
    
    // Handle nested address objects
    const admission = new Admission({
      ...admissionData,
      permanentAddress: {
        province: admissionData.permanentAddress_province,
        district: admissionData.permanentAddress_district,
        village: admissionData.permanentAddress_village
      },
      currentAddress: {
        province: admissionData.currentAddress_province,
        district: admissionData.currentAddress_district,
        village: admissionData.currentAddress_village
      }
    });
    
    await admission.save();
    
    res.status(201).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update admission
const updateAdmission = async (req, res) => {
  try {
    const admissionData = req.body;
    
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      admissionData,
      { new: true, runValidators: true }
    );
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }
    
    res.json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete admission (soft delete)
const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Admission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Convert admission to student
const convertToStudent = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate('degree');
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }
    
    // Create user account first
    const user = new User({
      name: `${admission.firstName} ${admission.lastName}`,
      email: admission.email || `${admission.firstName.toLowerCase()}@example.com`,
      password: 'defaultPassword123', // Should be changed by user
      role: 'student',
      phone: admission.phone,
      status: 'active'
    });
    await user.save();
    
    // Create student record
    const student = new Student({
      user: user._id,
      studentCode: `STU-${Date.now()}`,
      currentClass: admission.degree?._id,
      currentLevel: admission.degree?.degreeName || 'Level 1',
      admissionDate: new Date(),
      status: 'active'
    });
    await student.save();
    
    // Update admission status
    admission.status = 'accepted';
    await admission.save();
    
    res.json({
      success: true,
      message: 'Admission converted to student successfully',
      data: { user, student }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  // Student routes
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getAttendanceRecords,
  getAssignments,
  getExamResults,
  getFeePayments,
  submitComplaint,
  getStudentComplaints,
  getStudentLeaves,
  createStudentLeave,
  getStudentEducation,
  createStudentEducation,
  updateStudentEducation,
  deleteStudentEducation,
  getStudentDegrees,
  getBooks,
  getBorrowedBooks,
  borrowBook,
  returnBook,
  renewBook,
  getStudentDocuments,
  getStudentFinalResults,
  
  // Registrar/Staff routes
  getAllStudents,
  getAllAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  convertToStudent
};
