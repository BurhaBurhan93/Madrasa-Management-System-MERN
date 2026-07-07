const mongoose = require('mongoose');
const Student = require('../../models/Student');
const User = require('../../models/User');

// Returns req.user.id only if it is a valid MongoDB ObjectId, otherwise undefined.
const safeUserId = (req) =>
  mongoose.isValidObjectId(req.user?.id) ? req.user.id : undefined;
const Book = require('../../models/Book');
const Inventory = require('../../models/Inventory');
const BorrowedBook = require('../../models/BorrowedBook');
const Complaint = require('../../models/Complaint');
const Employee = require('../../models/Employee');
const BookCategory = require('../../models/BookCategory');
const ComplaintAction = require('../../models/ComplaintAction');
const ComplaintFeedback = require('../../models/ComplaintFeedback');
const BookPurchase = require('../../models/BookPurchase');
const BookSale = require('../../models/BookSale');

const generateCode = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
      .populate('user', 'name email')
      .select('studentCode user currentClass status');

    const formattedStudents = students.map(student => ({
      id: student._id,
      _id: student._id,
      name: student.user?.name || 'Unknown',
      email: student.user?.email || '',
      studentCode: student.studentCode || '',
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
    
    const student = await Student.findById(id).populate('user');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const borrowedBooks = await BorrowedBook.find({ 
      borrower: student._id,
      status: 'borrowed'
    }).populate('book', 'title');

    res.json({
      student: {
        id: student._id,
        name: student.user?.name || 'Unknown',
        email: student.user?.email || '',
        studentCode: student.studentCode || '',
        status: student.status
      },
      borrowedBooks: borrowedBooks.map(bb => ({
        id: bb._id,
        bookTitle: bb.book?.title || 'Unknown',
        borrowDate: bb.borrowedAt,
        dueDate: bb.returnDate
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory items
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    const mapped = items.map(item => ({
      id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      available: item.quantity,
      minLevel: item.minLevel,
      location: item.location
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create inventory item
const createInventory = async (req, res) => {
  try {
    const { name, category, quantity, minLevel, location } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const item = await Inventory.create({
      name, category: category || 'General',
      quantity: Number(quantity) || 0,
      minLevel: Number(minLevel) || 5,
      location: location || 'Main Store'
    });
    res.status(201).json({
      id: item._id, name: item.name, category: item.category,
      quantity: item.quantity, available: item.quantity,
      minLevel: item.minLevel, location: item.location
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update inventory item
const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({
      id: item._id, name: item.name, category: item.category,
      quantity: item.quantity, available: item.quantity,
      minLevel: item.minLevel, location: item.location
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete inventory item
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add stock to inventory item
const addStock = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const qty = Number(req.body.quantity) || 0;
    if (qty <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
    item.quantity = (item.quantity || 0) + qty;
    await item.save();
    res.json({
      id: item._id, name: item.name, category: item.category,
      quantity: item.quantity, available: item.quantity,
      minLevel: item.minLevel, location: item.location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove stock from inventory item
const removeStock = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const qty = Number(req.body.quantity) || 0;
    if (qty <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
    if ((item.quantity || 0) < qty) return res.status(400).json({ message: 'Insufficient stock' });
    item.quantity = (item.quantity || 0) - qty;
    await item.save();
    res.json({
      id: item._id, name: item.name, category: item.category,
      quantity: item.quantity, available: item.quantity,
      minLevel: item.minLevel, location: item.location
    });
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
      .populate('book', 'title')
      .populate({ path: 'borrower', populate: { path: 'user', select: 'name email' } });

    const activities = recentBorrows.map(borrow => ({
      id: borrow._id,
      action: borrow.status === 'borrowed' ? 'Book borrowed' : 'Book returned',
      detail: `${borrow.book?.title || 'Unknown'} - by ${borrow.borrower?.user?.name || borrow.borrower?.firstName || 'Unknown'}`,
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
      .populate('assignedTo', 'name email');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('complainant', 'name email')
      .populate('assignedTo', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaint (full edit + status changes from extra actions)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Map frontend-style status/priority to DB field names
    if (req.body.status) {
      const statusMap = { pending: 'open', 'in-progress': 'in_progress', resolved: 'closed', open: 'open', in_progress: 'in_progress', closed: 'closed' };
      updates.complaintStatus = statusMap[req.body.status] || req.body.status;
      if (req.body.status === 'resolved') updates.closedAt = new Date();
      delete updates.status;
    }
    if (req.body.priority) {
      updates.priorityLevel = req.body.priority;
      delete updates.priority;
    }

    const complaint = await Complaint.findByIdAndUpdate(id, updates, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintActions = async (req, res) => {
  try {
    const actions = await ComplaintAction.find()
      .populate('complaint', 'complaintCode subject')
      .populate('actionTakenBy', 'name')
      .sort({ actionDate: -1, createdAt: -1 });
    res.json({ success: true, data: actions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintActionById = async (req, res) => {
  try {
    const action = await ComplaintAction.findById(req.params.id)
      .populate('complaint', 'complaintCode subject')
      .populate('actionTakenBy', 'name');
    if (!action) return res.status(404).json({ message: 'Complaint action not found' });
    res.json({ success: true, data: action });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComplaintAction = async (req, res) => {
  try {
    const action = await ComplaintAction.create({
      complaint: req.body.complaint,
      actionType: req.body.actionType || 'follow_up',
      actionDescription: req.body.actionDescription,
      actionResult: req.body.actionResult,
      followUpDate: req.body.followUpDate || null,
      nextActionRequired: !!req.body.nextActionRequired,
      remarks: req.body.remarks || '',
      ...(safeUserId(req) && { actionTakenBy: safeUserId(req) })
    });

    res.status(201).json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintAction = async (req, res) => {
  try {
    const action = await ComplaintAction.findByIdAndUpdate(
      req.params.id,
      {
        complaint: req.body.complaint,
        actionType: req.body.actionType || 'follow_up',
        actionDescription: req.body.actionDescription,
        actionResult: req.body.actionResult,
        followUpDate: req.body.followUpDate || null,
        nextActionRequired: !!req.body.nextActionRequired,
        remarks: req.body.remarks || ''
      },
      { new: true }
    );

    if (!action) {
      return res.status(404).json({ message: 'Complaint action not found' });
    }

    res.json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComplaintAction = async (req, res) => {
  try {
    const action = await ComplaintAction.findByIdAndDelete(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Complaint action not found' });
    }
    res.json({ message: 'Complaint action deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintFeedbacks = async (req, res) => {
  try {
    const feedbacks = await ComplaintFeedback.find()
      .populate('complaint', 'complaintCode subject')
      .populate('feedbackBy', 'name')
      .sort({ feedbackDate: -1, createdAt: -1 });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintFeedbackById = async (req, res) => {
  try {
    const feedback = await ComplaintFeedback.findById(req.params.id)
      .populate('complaint', 'complaintCode subject')
      .populate('feedbackBy', 'name');
    if (!feedback) return res.status(404).json({ message: 'Complaint feedback not found' });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComplaintFeedback = async (req, res) => {
  try {
    const feedback = await ComplaintFeedback.create({
      complaint: req.body.complaint,
      satisfactionLevel: req.body.satisfactionLevel,
      comments: req.body.comments || '',
      feedbackDate: req.body.feedbackDate || new Date(),
      ...(safeUserId(req) && { feedbackBy: safeUserId(req) })
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintFeedback = async (req, res) => {
  try {
    const feedback = await ComplaintFeedback.findByIdAndUpdate(
      req.params.id,
      {
        complaint: req.body.complaint,
        satisfactionLevel: req.body.satisfactionLevel,
        comments: req.body.comments || '',
        feedbackDate: req.body.feedbackDate || new Date()
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Complaint feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComplaintFeedback = async (req, res) => {
  try {
    const feedback = await ComplaintFeedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Complaint feedback not found' });
    }
    res.json({ message: 'Complaint feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Library Management Functions

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    const formattedBooks = books.map(book => ({
      id: book._id,
      title: book.title,
      author: book.author || 'Unknown',
      category: book.category?._id || book.category,
      categoryName: book.category?.name || 'Uncategorized',
      stock: book.stock || 0,
      isbn: book.isbn || '',
      pages: book.pages || 0,
      publisher: book.publisher || '',
      publisherYear: book.publisherYear || '',
      purchasePrice: book.purchasePrice ?? 0,
      salePrice: book.salePrice ?? 0
    }));
    res.json(formattedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    const bookData = req.body;
    const newBook = new Book(bookData);
    await newBook.save();
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get book categories
const getBookCategories = async (req, res) => {
  try {
    const categories = await BookCategory.find({ deletedAt: null });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookCategoryById = async (req, res) => {
  try {
    const category = await BookCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBookCategory = async (req, res) => {
  try {
    const category = await BookCategory.create({
      name: req.body.name,
      description: req.body.description || ''
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `A category with the name "${req.body.name}" already exists.` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookCategory = async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description || '' },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `A category with the name "${req.body.name}" already exists.` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBookCategory = async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowedBook.find()
      .populate({ path: 'borrower', populate: { path: 'user', select: 'name email' } })
      .populate('book', 'title')
      .sort({ borrowedAt: -1 });
    res.json(
      records.map((record) => ({
        _id: record._id,
        borrower: { _id: record.borrower?._id, name: record.borrower?.user?.name || record.borrower?.firstName || 'Unknown', email: record.borrower?.user?.email || '' },
        book: { _id: record.book?._id, title: record.book?.title || 'Unknown' },
        borrowedAt: record.borrowedAt,
        returnDate: record.returnDate,
        status: record.status
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBorrowedBookById = async (req, res) => {
  try {
    const record = await BorrowedBook.findById(req.params.id)
      .populate({ path: 'borrower', populate: { path: 'user', select: 'name email' } })
      .populate('book', 'title');
    if (!record) return res.status(404).json({ success: false, message: 'Borrow record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBorrowedBook = async (req, res) => {
  try {
    const borrower = req.body.borrower || null;
    const book     = req.body.book     || null;

    if (!borrower) return res.status(400).json({ success: false, message: 'Borrower (student) is required' });
    if (!book)     return res.status(400).json({ success: false, message: 'Book is required' });

    const bookDoc = await Book.findById(book);
    if (!bookDoc) return res.status(404).json({ success: false, message: 'Book not found' });
    if (bookDoc.stock <= 0) return res.status(400).json({ success: false, message: 'Book is out of stock' });

    const record = await BorrowedBook.create({
      borrower,
      book,
      borrowedAt: req.body.borrowedAt || new Date(),
      returnDate: req.body.returnDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'borrowed'
    });

    bookDoc.stock -= 1;
    await bookDoc.save();

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBorrowedBook = async (req, res) => {
  try {
    const existing = await BorrowedBook.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    const nextStatus = req.body.status || existing.status;
    if (existing.status !== 'returned' && nextStatus === 'returned') {
      const book = await Book.findById(existing.book);
      if (book) {
        book.stock += 1;
        await book.save();
      }
    }

    existing.status = nextStatus;
    existing.returnDate = req.body.returnDate || existing.returnDate;
    await existing.save();

    res.json({ success: true, data: existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookPurchases = async (req, res) => {
  try {
    const purchases = await BookPurchase.find()
      .populate('book', 'title')
      .sort({ purchaseDate: -1, createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookPurchaseById = async (req, res) => {
  try {
    const purchase = await BookPurchase.findById(req.params.id).populate('book', 'title');
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBookPurchase = async (req, res) => {
  try {
    const purchase = await BookPurchase.create({
      purchaseCode: generateCode('PUR'),
      supplierName: req.body.supplierName,
      invoiceReference: req.body.invoiceReference,
      book: req.body.book,
      quantity: req.body.quantity,
      unitPrice: req.body.unitPrice,
      totalPrice: req.body.totalPrice,
      purchaseDate: req.body.purchaseDate || new Date(),
      ...(safeUserId(req) && { purchasedBy: safeUserId(req) })
    });

    const book = await Book.findById(req.body.book);
    if (book) {
      book.stock += Number(req.body.quantity || 0);
      await book.save();
    }

    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookPurchase = async (req, res) => {
  try {
    const purchase = await BookPurchase.findByIdAndUpdate(
      req.params.id,
      {
        supplierName: req.body.supplierName,
        invoiceReference: req.body.invoiceReference,
        book: req.body.book,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
        totalPrice: req.body.totalPrice,
        purchaseDate: req.body.purchaseDate || new Date()
      },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBookPurchase = async (req, res) => {
  try {
    const purchase = await BookPurchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookSales = async (req, res) => {
  try {
    const sales = await BookSale.find()
      .populate('book', 'title')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ saleDate: -1, createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookSaleById = async (req, res) => {
  try {
    const sale = await BookSale.findById(req.params.id)
      .populate('book', 'title')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBookSale = async (req, res) => {
  try {
    const sale = await BookSale.create({
      receiptNo: req.body.receiptNo || generateCode('SAL'),
      student: req.body.student || null,
      book: req.body.book,
      quantity: req.body.quantity,
      unitPrice: req.body.unitPrice,
      totalAmount: req.body.totalAmount,
      saleDate: req.body.saleDate || new Date(),
      ...(safeUserId(req) && { soldBy: safeUserId(req) })
    });

    const book = await Book.findById(req.body.book);
    if (book) {
      book.stock = Math.max(0, book.stock - Number(req.body.quantity || 0));
      await book.save();
    }

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookSale = async (req, res) => {
  try {
    const sale = await BookSale.findByIdAndUpdate(
      req.params.id,
      {
        receiptNo: req.body.receiptNo,
        student: req.body.student || null,
        book: req.body.book,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
        totalAmount: req.body.totalAmount,
        saleDate: req.body.saleDate || new Date()
      },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBookSale = async (req, res) => {
  try {
    const sale = await BookSale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get library statistics for reports
const getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const borrowed = await BorrowedBook.countDocuments({ status: 'borrowed' });
    const returned = await BorrowedBook.countDocuments({ status: 'returned' });
    const lowStock = await Book.countDocuments({ stock: { $lte: 5 } });

    res.json({
      totalBooks,
      borrowed,
      returned,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get complaint statistics for reports
const getComplaintStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const open = await Complaint.countDocuments({ complaintStatus: 'open' });
    const inProgress = await Complaint.countDocuments({ complaintStatus: 'in_progress' });
    const closed = await Complaint.countDocuments({ complaintStatus: 'closed' });
    const highPriority = await Complaint.countDocuments({ priorityLevel: 'high' });

    res.json({
      total,
      open,
      inProgress,
      closed,
      highPriority
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getStudentDetails,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  addStock,
  removeStock,
  getRecentActivities,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintActions,
  getComplaintActionById,
  createComplaintAction,
  updateComplaintAction,
  deleteComplaintAction,
  getComplaintFeedbacks,
  getComplaintFeedbackById,
  createComplaintFeedback,
  updateComplaintFeedback,
  deleteComplaintFeedback,
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  getBookCategoryById,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
  getBorrowedBooks,
  getBorrowedBookById,
  createBorrowedBook,
  updateBorrowedBook,
  getBookPurchases,
  getBookPurchaseById,
  createBookPurchase,
  updateBookPurchase,
  deleteBookPurchase,
  getBookSales,
  getBookSaleById,
  createBookSale,
  updateBookSale,
  deleteBookSale,
  getLibraryStats,
  getComplaintStats
};
