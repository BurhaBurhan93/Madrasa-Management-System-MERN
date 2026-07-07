const Student = require("../models/Student");
const User = require("../models/User");
const Course = require("../models/Subject"); // Assuming subjects are courses for students
const AttendanceRecord = require("../models/AttendanceRecord");
const Exam = require("../models/Exam");
const ExamQuestion = require("../models/ExamQuestion");
const ExamAnswer = require("../models/ExamAnswer");
const FeePayment = require("../models/FeePayment");
const Complaint = require("../models/Complaint");
const Assignment = require("../models/Assignment");
const StudentLeave = require("../models/StudentLeave");
const StudentEducation = require("../models/StudentEducation");
const Admission = require("../models/Admission");
const BorrowedBook = require("../models/BorrowedBook");
const Book = require("../models/Book");
const BookSale = require("../models/BookSale");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const notificationService = require("../modules/notifications/notificationService");

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate("user", "-password")
      .populate("currentClass", "name");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const u = student.user || {};
    res.json({
      id: student._id,
      userId: u._id,
      role: u.role || "student",
      name:
        u.name || `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      email: u.email || student.email,
      phone: student.phone || u.phone,
      whatsapp: student.whatsapp || u.whatsapp,
      image: u.image || student.image || null,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      fatherName: student.fatherName || u.fatherName,
      grandfatherName: student.grandfatherName || u.grandfatherName,
      dob: student.dob || u.dob,
      bloodType: student.bloodType || u.bloodType,
      gender: student.gender,
      currentClass: student.currentClass?.name || student.currentClass,
      currentLevel: student.currentLevel,
      admissionDate: student.admissionDate,
      status: student.status,
      guardianName: student.guardianName,
      guardianRelationship: student.guardianRelationship,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      permanentAddress: student.permanentAddress || u.permanentAddress,
      currentAddress: student.currentAddress || u.currentAddress,
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
      { user: req.user.id },
      { phone, permanentAddress: address, dob: dateOfBirth },
      { new: true },
    ).populate("user");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      id: student._id,
      name: student.user?.name || student.firstName + " " + student.lastName,
      email: student.user?.email || student.email,
      studentId: student.studentCode,
      phone: student.phone,
      dateOfBirth: student.dob,
      address: student.permanentAddress,
      enrollmentDate: student.admissionDate,
      status: student.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student courses
const getStudentCourses = async (req, res) => {
  try {
    const DegreeSubject = require('../models/DegreeSubject');
    const StudentDegree = require('../models/StudentDegree');
    const Subject = require('../models/Subject');

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's enrolled degrees
    const enrollments = await StudentDegree.find({ student: student._id, status: 'active' });
    const degreeIds = enrollments.map(e => e._id);

    // Try to get subjects from DegreeSubject first
    let degreeSubjects = [];
    if (degreeIds.length > 0) {
      degreeSubjects = await DegreeSubject.find({
        degree: { $in: degreeIds },
        status: 'active',
        deletedAt: null
      })
        .populate('subject', 'name field')
        .populate('teacher', 'name')
        .populate('degree', 'name');
    }

    // Fallback: if no DegreeSubject found, try to get subjects from currentClass
    if (degreeSubjects.length === 0 && student.currentClass) {
      degreeSubjects = await Subject.find({
        classId: student.currentClass,
        deletedAt: null
      }).lean();
    }

    // If still no subjects, return empty array
    if (degreeSubjects.length === 0) {
      return res.json([]);
    }

    // Map DegreeSubject results
    if (degreeSubjects.length > 0 && degreeSubjects[0].subject) {
      res.json(degreeSubjects.map(ds => ({
        _id: ds._id,
        name: ds.subject?.name || 'Subject',
        field: ds.subject?.field || '',
        courseCode: ds.degree?.name || '',
        teacher: { name: ds.teacher?.name || '' },
        status: 'active',
        progress: 0,
        studyDaysPerWeek: ds.studyDaysPerWeek,
        startTime: ds.startTime,
        endTime: ds.endTime,
        academicYear: ds.academicYear
      })));
    } else {
      // Map Subject results (fallback)
      res.json(degreeSubjects.map(s => ({
        _id: s._id,
        name: s.name || 'Subject',
        field: s.field || '',
        courseCode: '',
        teacher: { name: '' },
        status: 'active',
        progress: 0,
        studyDaysPerWeek: 0,
        startTime: '',
        endTime: '',
        academicYear: ''
      })));
    }
  } catch (error) {
    console.error('[getStudentCourses] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    // Find student record first
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const records = await AttendanceRecord.find(
      {
        student: student._id,
      },
      null,
      { strictPopulate: false },
    ).populate({
      path: 'session',
      select: 'sessionDate sessionType class',
      populate: { path: 'class', select: 'name' }
    });

    res.json(records.map(r => ({
      _id: r._id,
      status: r.status,
      date: r.session?.sessionDate || r.createdAt,
      course: { name: r.session?.class?.name || 'General Session' },
      sessionType: r.session?.sessionType || 'lecture',
      remarks: r.remarks
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student assignments
const getAssignments = async (req, res) => {
  try {
    // Find student to get their enrolled courses
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get assignments for the student's class
    const assignments = await Assignment.find(
      {
        classId: student.currentClass,
      },
      null,
      { strictPopulate: false },
    ).populate('courseId', 'name');

    res.json(assignments.map(a => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      subject: { name: a.courseId?.name || 'General' },
      status: a.status === 'active' ? 'pending' : a.status,
      dueDate: a.dueDate,
      maxPoints: a.maxPoints,
      assignedDate: a.assignedDate,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all published exams for student
const getExams = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find exams for the student's class
    const exams = await Exam.find({
      status: "published",
      class: student.currentClass,
    }).populate("subject", "name");

    res.json(
      exams.map((exam) => ({
        id: exam._id,
        title: exam.title,
        course: exam.subject?.name,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        publishDate: exam.startDate,
        status: exam.status,
        description: exam.description,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exam details with questions
const getExamDetails = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("subject", "name");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Get questions for this exam
    const questions = await ExamQuestion.find({ exam: exam._id }).select(
      "-correctAnswer",
    );

    res.json({
      id: exam._id,
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      description: exam.description,
      questions: questions.map((q) => ({
        id: q._id,
        question: q.question,
        type: q.questionType,
        options: q.options,
        marks: q.marks,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's submission for an exam
const getExamSubmission = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const submission = await ExamAnswer.findOne({
      exam: req.params.id,
      student: student?._id,
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit exam answers
const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const examId = req.params.id;
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if already submitted
    const existingSubmission = await ExamAnswer.findOne({
      exam: examId,
      student: student._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "Exam already submitted" });
    }

    // Calculate score
    const questions = await ExamQuestion.find({ exam: examId });
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      totalMarks += q.marks;
      if (answers[q._id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const submission = new ExamAnswer({
      exam: examId,
      student: student._id,
      answers,
      score,
      totalMarks,
      submittedAt: new Date(),
    });

    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student exam results
const getExamResults = async (req, res) => {
  try {
    // Find student record first
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const results = await ExamAnswer.find({
      student: student._id,
    })
      .populate({
        path: 'exam',
        select: 'title subject totalMarks academicYear examType createdBy',
        populate: [
          { path: 'subject', select: 'name' },
          { path: 'createdBy', select: 'name' },
          { path: 'examType', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student fee payments
const getFeePayments = async (req, res) => {
  try {
    // Find student record first
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find StudentFee records for this student
    const StudentFee = require("../models/StudentFee");
    const studentFees = await StudentFee.find({ student: student._id });

    // Get payments for these student fees
    const studentFeeIds = studentFees.map((sf) => sf._id);
    const payments = await FeePayment.find({
      studentFee: { $in: studentFeeIds },
    })
      .populate("studentFee")
      .sort({ createdAt: -1 });

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
      complainantType: "student",
      complainant: req.user.id,
      subject: title,
      description,
      complaintCategory: category,
      priorityLevel: priority || "medium",
      complaintStatus: "open",
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
      complainantType: "student",
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student leave records
const getStudentLeaves = async (req, res) => {
  try {
    // Find student record first
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const leaves = await StudentLeave.find({ student: student._id })
      .populate("approvedBy", "name")
      .populate("leaveType")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error("[StudentController] Error fetching leaves:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create student leave request
const createStudentLeave = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = new StudentLeave({
      student: student._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      approvalStatus: "pending",
    });

    await leave.save();
    console.log("[StudentController] Leave created:", leave._id);
    res.status(201).json(leave);
  } catch (error) {
    console.error("[StudentController] Error creating leave:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get student education records
const getStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const education = await StudentEducation.find({
      student: student._id,
    }).sort({ createdAt: -1 });
    res.json(education);
  } catch (error) {
    console.error("[StudentController] Error fetching education:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create student education record
const createStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const { previousDegree, previousInstitution, location } = req.body;

    const education = new StudentEducation({
      student: student._id,
      previousDegree,
      previousInstitution,
      location,
    });

    await education.save();
    console.log("[StudentController] Education record created:", education._id);
    res.status(201).json(education);
  } catch (error) {
    console.error("[StudentController] Error creating education:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update student education record
const updateStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const { previousDegree, previousInstitution, location } = req.body;

    const education = await StudentEducation.findOneAndUpdate(
      { _id: req.params.id, student: student._id },
      { previousDegree, previousInstitution, location },
      { new: true },
    );

    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    console.log("[StudentController] Education record updated:", education._id);
    res.json(education);
  } catch (error) {
    console.error("[StudentController] Error updating education:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete student education record
const deleteStudentEducation = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const education = await StudentEducation.findOneAndDelete({
      _id: req.params.id,
      student: student._id,
    });

    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    console.log("[StudentController] Education record deleted:", req.params.id);
    res.json({ message: "Education record deleted successfully" });
  } catch (error) {
    console.error("[StudentController] Error deleting education:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get student degree records
const getStudentDegrees = async (req, res) => {
  try {
    const StudentDegree = require("../models/StudentDegree");
    const Student = require("../models/Student");

    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const degrees = await StudentDegree.find({ student: student._id })
      .populate('degree', 'name image')
      .sort({ createdAt: -1 });

    console.log('[StudentController] Degrees fetched:', degrees.length);
    res.json(degrees.map(d => ({
      _id: d._id,
      degree: {
        name: d.degree?.name || 'Degree Program',
        code: '',
        duration: '',
        credits: 0
      },
      academicYear: d.academicYear || '',
      status: d.status || 'active',
      enrollmentDate: d.createdAt,
      progress: 0,
      completedCourses: 0,
      totalCourses: 0
    })));
  } catch (error) {
    console.error("[StudentController] Error fetching degrees:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all books for library
const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ deletedAt: null })
      .populate("category", "name")
      .sort({ title: 1 });

    console.log("[StudentController] Books fetched:", books.length);
    res.json(
      books.map((book) => ({
        _id: book._id,
        title: book.title,
        author: book.author || "Unknown",
        isbn: book.isbn || "",
        category: book.category?.name || "Uncategorized",
        status: book.stock > 0 ? "available" : "borrowed",
        stock: book.stock || 0,
        image:
          book.coverImage ||
          "https://via.placeholder.com/120x160/e5e7eb/6b7280?text=BOOK",
      })),
    );
  } catch (error) {
    console.error("[StudentController] Error fetching books:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's borrowed books
const getBorrowedBooks = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const borrowedBooks = await BorrowedBook.find({
      borrower: student._id,
      status: "borrowed",
    })
      .populate("book")
      .sort({ borrowedAt: -1 });

    console.log(
      "[StudentController] Borrowed books fetched:",
      borrowedBooks.length,
    );
    res.json(
      borrowedBooks.map((record) => ({
        _id: record._id,
        id: record.book?._id || record._id,
        title: record.book?.title || "Unknown book",
        author: record.book?.author || "Unknown",
        isbn: record.book?.isbn || "",
        category: record.book?.category?.name || "Uncategorized",
        borrowDate: record.borrowedAt,
        dueDate: record.returnDate,
        renewals: 0,
        status:
          record.returnDate && new Date(record.returnDate) < new Date()
            ? "overdue"
            : "borrowed",
        image:
          record.book?.coverImage ||
          "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" fill="%23e5e7eb"><rect width="120" height="160"/><text x="60" y="85" text-anchor="middle" fill="%236b7280" font-size="14" font-weight="bold">BOOK</text></svg>'),
      })),
    );
  } catch (error) {
    console.error("[StudentController] Error fetching borrowed books:", error);
    res.status(500).json({ message: error.message });
  }
};

// Borrow a book
const borrowBook = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ message: "Book is not available" });
    }

    // Check if already borrowed
    const existingBorrow = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: "borrowed",
    });

    if (existingBorrow) {
      return res
        .status(400)
        .json({ message: "You have already borrowed this book" });
    }

    // Create borrow record
    const borrowedBook = new BorrowedBook({
      book: bookId,
      borrower: student._id,
      borrowedAt: new Date(),
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: "borrowed",
    });

    await borrowedBook.save();

    // Update book stock
    book.stock -= 1;
    await book.save();

    console.log("[StudentController] Book borrowed:", bookId);
    res.json({ message: "Book borrowed successfully", borrowedBook });
  } catch (error) {
    console.error("[StudentController] Error borrowing book:", error);
    res.status(500).json({ message: error.message });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const bookId = req.params.id;

    // Find the borrow record
    const borrowedBook = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: "borrowed",
    });

    if (!borrowedBook) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    // Update borrow record
    borrowedBook.status = "returned";
    borrowedBook.returnDate = new Date();
    await borrowedBook.save();

    // Update book stock
    const book = await Book.findById(bookId);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    console.log("[StudentController] Book returned:", bookId);
    res.json({ message: "Book returned successfully" });
  } catch (error) {
    console.error("[StudentController] Error returning book:", error);
    res.status(500).json({ message: error.message });
  }
};

// Renew a book
const renewBook = async (req, res) => {
  try {
    const Student = require("../models/Student");

    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const bookId = req.params.id;

    // Find the borrow record
    const borrowedBook = await BorrowedBook.findOne({
      book: bookId,
      borrower: student._id,
      status: "borrowed",
    });

    if (!borrowedBook) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    // Extend return date by 7 days
    const currentReturnDate = new Date(borrowedBook.returnDate);
    borrowedBook.returnDate = new Date(
      currentReturnDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    await borrowedBook.save();

    console.log("[StudentController] Book renewed:", bookId);
    res.json({
      message: "Book renewed successfully",
      returnDate: borrowedBook.returnDate,
    });
  } catch (error) {
    console.error("[StudentController] Error renewing book:", error);
    res.status(500).json({ message: error.message     });
  }
};

// Get student purchase history (from BookSale)
const getStudentPurchases = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const purchases = await BookSale.find({ student: student._id })
      .populate("book", "title author")
      .sort({ saleDate: -1 });

    res.json(
      purchases.map((record) => ({
        _id: record._id,
        id: record._id,
        purchaseCode: record.receiptNo || record._id,
        purchaseDate: record.saleDate,
        bookTitle: record.book?.title || "Unknown item",
        author: record.book?.author || "Unknown",
        category: "Library Purchase",
        status: "completed",
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        totalPrice: record.totalAmount,
      })),
    );
  } catch (error) {
    console.error("[StudentController] Error fetching purchases:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get student documents
const getStudentDocuments = async (req, res) => {
  try {
    const UserDocument = require("../models/UserDocument");

    const documents = await UserDocument.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    console.log("[StudentController] Documents fetched:", documents.length);
    res.json(documents);
  } catch (error) {
    console.error("[StudentController] Error fetching documents:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get student final results
const getStudentFinalResults = async (req, res) => {
  try {
    const FinalResult = require("../models/FinalResult");
    const Student = require("../models/Student");

    // Find the student record for this user
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const results = await FinalResult.find({ student: student._id })
      .populate('exam', 'title academicYear')
      .populate('class', 'name')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    console.log('[StudentController] Final results fetched:', results.length);
    res.json(results.map(r => ({
      _id: r._id,
      exam: r.exam,
      subject: r.subject,
      class: r.class,
      totalScore: r.totalScore,
      percentage: r.totalScore || 0,
      score: r.totalScore || 0,
      grade: r.grade,
      status: r.status,
      createdAt: r.createdAt
    })));
  } catch (error) {
    console.error("[StudentController] Error fetching final results:", error);
    res.status(500).json({ message: error.message });
  }
};

// Submit homework/assignment by student
const submitAssignment = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { title, description, course, dueDate, assignmentId } = req.body;

    // If an assignmentId was provided, mark it submitted
    if (assignmentId) {
      const updated = await Assignment.findByIdAndUpdate(
        assignmentId,
        {
          $addToSet: {
            submissions: {
              student: student._id,
              submittedAt: new Date(),
              note: description,
            },
          },
        },
        { new: true },
      );
      if (!updated)
        return res.status(404).json({ message: "Assignment not found" });
      return res.json({
        success: true,
        message: "Assignment submitted successfully",
      });
    }

    if (!title || !course) {
      return res.status(400).json({ message: "Title and course are required" });
    }

    // Otherwise create a submission record directly
    const submission = await Assignment.create({
      title,
      description: description || "",
      courseId: course,
      dueDate: dueDate || new Date(),
      status: "completed",
      createdBy: req.user.id,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Homework submitted successfully",
        data: submission,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ deletedAt: null })
      .populate("user", "name email phone image")
      .populate("currentClass", "name")
      .lean();

    // Merge student data with user data
    const enrichedStudents = students.map((student) => ({
      ...student,
      firstName: student.user?.name?.split(" ")[0],
      lastName: student.user?.name?.split(" ")[1] || "",
      name: student.user?.name,
      email: student.user?.email,
      phone: student.user?.phone,
    }));

    res.json({
      success: true,
      data: enrichedStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all admissions (for Registrar/Staff)
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ deletedAt: null })
      .populate("degree", "degreeName name")
      .populate("user", "name email")
      .lean();

    res.json({
      success: true,
      data: admissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new admission
const createAdmission = async (req, res) => {
  try {
    const admissionData = { ...req.body };
    // Remove empty ObjectId fields to prevent CastError
    ['user', 'degree', 'currentClass'].forEach(f => { if (!admissionData[f]) delete admissionData[f]; });

    // Handle nested address objects
    const admission = new Admission({
      ...admissionData,
      permanentAddress: {
        province: admissionData.permanentAddress_province,
        district: admissionData.permanentAddress_district,
        village: admissionData.permanentAddress_village,
      },
      currentAddress: {
        province: admissionData.currentAddress_province,
        district: admissionData.currentAddress_district,
        village: admissionData.currentAddress_village,
      },
    });

    await admission.save();

    res.status(201).json({
      success: true,
      data: admission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update admission
const updateAdmission = async (req, res) => {
  try {
    const admissionData = { ...req.body };
    // Remove empty ObjectId fields to prevent CastError
    ['user', 'degree', 'currentClass'].forEach(f => { if (!admissionData[f]) delete admissionData[f]; });

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      admissionData,
      { new: true, runValidators: true },
    );

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      data: admission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete admission (soft delete)
const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      message: "Admission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Convert admission to student
const convertToStudent = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate(
      "degree",
    );
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    // Create user account first
    const userPayload = {
      name: `${admission.firstName} ${admission.lastName}`,
      email:
        admission.email || `${admission.firstName.toLowerCase()}@example.com`,
      password: await bcrypt.hash("defaultPassword123", 10),
      role: "student",
      phone: admission.phone,
      status: "active",
    };
    const user = new User(userPayload);
    await user.save();

    // Create student record
    const student = new Student({
      user: user._id,
      studentCode: `STU-${Date.now()}`,
      currentLevel: admission.degree?.degreeName || "Level 1",
      admissionDate: new Date(),
      status: "active",
    });
    await student.save();

    // Update admission status
    admission.status = "accepted";
    await admission.save();

    res.json({
      success: true,
      message: "Admission converted to student successfully",
      data: { user, student },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new student directly (for registrar)
const createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    const hashedPassword = await bcrypt.hash(
      studentData.accountPassword ||
        studentData.password ||
        "defaultPassword123",
      10,
    );

    // Build user object, stripping empty enum fields to avoid Mongoose validation errors
    const userPayload = {
      name: `${studentData.firstName} ${studentData.lastName || ""}`.trim(),
      email:
        studentData.email ||
        `${studentData.firstName.toLowerCase()}.${Date.now()}@example.com`,
      password: hashedPassword,
      role: "student",
      phone: studentData.phone,
      status: "active",
    };
    if (studentData.whatsapp) userPayload.whatsapp = studentData.whatsapp;
    if (studentData.fatherName) userPayload.fatherName = studentData.fatherName;
    if (studentData.grandfatherName)
      userPayload.grandfatherName = studentData.grandfatherName;
    if (studentData.dob) userPayload.dob = studentData.dob;
    if (studentData.bloodType) userPayload.bloodType = studentData.bloodType;
    if (studentData.permanentAddress)
      userPayload.permanentAddress = studentData.permanentAddress;
    if (studentData.currentAddress)
      userPayload.currentAddress = studentData.currentAddress;
    if (studentData.image) userPayload.image = studentData.image;

    const user = new User(userPayload);
    await user.save();

    // Build student record, only including non-empty fields
    const studentPayload = {
      user: user._id,
      studentCode: studentData.studentCode || `STU-${Date.now()}`,
      admissionDate: studentData.admissionDate || new Date(),
      status: studentData.status || "active",
    };
    if (studentData.firstName) studentPayload.firstName = studentData.firstName;
    if (studentData.lastName) studentPayload.lastName = studentData.lastName;
    if (studentData.fatherName)
      studentPayload.fatherName = studentData.fatherName;
    if (studentData.grandfatherName)
      studentPayload.grandfatherName = studentData.grandfatherName;
    if (studentData.dob) studentPayload.dob = studentData.dob;
    if (studentData.phone) studentPayload.phone = studentData.phone;
    if (studentData.whatsapp) studentPayload.whatsapp = studentData.whatsapp;
    if (studentData.email) studentPayload.email = studentData.email;
    if (studentData.bloodType) studentPayload.bloodType = studentData.bloodType;
    if (studentData.permanentAddress)
      studentPayload.permanentAddress = studentData.permanentAddress;
    if (studentData.currentAddress)
      studentPayload.currentAddress = studentData.currentAddress;
    if (studentData.guardianName)
      studentPayload.guardianName = studentData.guardianName;
    if (studentData.guardianRelationship)
      studentPayload.guardianRelationship = studentData.guardianRelationship;
    if (studentData.guardianPhone)
      studentPayload.guardianPhone = studentData.guardianPhone;
    if (studentData.guardianEmail)
      studentPayload.guardianEmail = studentData.guardianEmail;
    if (studentData.currentLevel)
      studentPayload.currentLevel = studentData.currentLevel;
    if (studentData.currentClass)
      studentPayload.currentClass = studentData.currentClass;
    if (studentData.image) studentPayload.image = studentData.image;

    const student = new Student(studentPayload);
    await student.save();

    // Fire notification asynchronously
    notificationService.onStudentRegistered(student).catch(() => {});

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const studentData = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update user fields if provided
    const userUpdateData = {};
    // Handle name from firstName + lastName if available
    if (studentData.firstName || studentData.lastName) {
      const fullName =
        `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim();
      if (fullName) userUpdateData.name = fullName;
    } else if (studentData.name) {
      userUpdateData.name = studentData.name;
    }
    if (studentData.email) userUpdateData.email = studentData.email;
    if (studentData.phone) userUpdateData.phone = studentData.phone;
    if (studentData.image) userUpdateData.image = studentData.image;
    if (studentData.fatherName)
      userUpdateData.fatherName = studentData.fatherName;
    if (studentData.grandfatherName)
      userUpdateData.grandfatherName = studentData.grandfatherName;
    if (studentData.dob) userUpdateData.dob = studentData.dob;
    if (studentData.bloodType) userUpdateData.bloodType = studentData.bloodType;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(student.user, userUpdateData, {
        new: true,
        runValidators: true,
      });
    }

    // Filter out fields with empty string values to avoid cast errors
    const filteredUpdateData = Object.fromEntries(
      Object.entries(studentData).filter(([_, value]) => value !== ""),
    );

    // Update student record
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      filteredUpdateData,
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete student (soft delete)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  // Student routes
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getExams,
  getExamDetails,
  getExamSubmission,
  submitExam,
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
  getStudentPurchases,
  getStudentFinalResults,

  submitAssignment,
  // Registrar/Staff routes
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  convertToStudent,
};
