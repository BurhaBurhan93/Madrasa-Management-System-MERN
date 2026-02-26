const Student = require('../../models/Student');
const User = require('../../models/User');
const Book = require('../../models/Book');
const BorrowedBook = require('../../models/BorrowedBook');
const Complaint = require('../../models/Complaint');
const Employee = require('../../models/Employee');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const borrowedBooks = await BorrowedBook.countDocuments({ status: 'borrowed' });
    const totalStudents = await Student.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });

    res.json({
      totalBooks,
      borrowedBooks,
      totalStudents,
      pendingComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email')
      .select('studentId userId class status');

    const formattedStudents = students.map(student => ({
      id: student._id,
      name: student.userId?.name || 'Unknown',
      email: student.userId?.email || '',
      studentId: student.studentId,
      class: student.class || 'N/A',
      status: student.status
    }));

    res.json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student details with borrowed books
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const borrowedBooks = await BorrowedBook.find({ 
      studentId: student.userId._id,
      status: 'borrowed'
    }).populate('bookId');

    res.json({
      student: {
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        studentId: student.studentId,
        class: student.class,
        status: student.status
      },
      borrowedBooks: borrowedBooks.map(bb => ({
        id: bb._id,
        bookTitle: bb.bookId.title,
        borrowDate: bb.borrowDate,
        dueDate: bb.dueDate
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory items
const getInventory = async (req, res) => {
  try {
    // For now, return books as inventory items
    const books = await Book.find();
    
    const inventory = books.map(book => ({
      id: book._id,
      name: book.title,
      category: book.category || 'Books',
      quantity: book.quantity || 0,
      available: book.availableQuantity || 0,
      location: book.location || 'Library'
    }));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    // Get recent borrowed books
    const recentBorrows = await BorrowedBook.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('bookId studentId');

    const activities = recentBorrows.map(borrow => ({
      id: borrow._id,
      action: borrow.status === 'borrowed' ? 'Book borrowed' : 'Book returned',
      detail: `${borrow.bookId?.title} - by ${borrow.studentId?.name || 'Unknown'}`,
      time: borrow.createdAt,
      type: borrow.status === 'borrowed' ? 'borrow' : 'return'
    }));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('studentId', 'name');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, action, resolvedAt: status === 'resolved' ? new Date() : null },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getStudentDetails,
  getInventory,
  getRecentActivities,
  getAllComplaints,
  updateComplaintStatus
};
