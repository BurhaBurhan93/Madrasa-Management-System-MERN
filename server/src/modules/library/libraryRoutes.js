const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const Book = require('../../models/Book');
const BookCategory = require('../../models/BookCategory');
const BorrowedBook = require('../../models/BorrowedBook');
const BookPurchase = require('../../models/BookPurchase');
const BookSale = require('../../models/BookSale');

router.use(auth, authorizeRoles('staff', 'admin'));

// ── Categories ────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const cats = await BookCategory.find({ deletedAt: null }).sort({ name: 1 });
    res.json({ success: true, data: cats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const cat = await BookCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/categories', async (req, res) => {
  try {
    const cat = await BookCategory.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const cat = await BookCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await BookCategory.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Books ─────────────────────────────────────────────────
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find({ deletedAt: null }).populate('category', 'name').sort({ title: 1 });
    res.json({ success: true, data: books });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/books', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ success: true, message: 'Book deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Borrowed ──────────────────────────────────────────────
router.get('/borrowed', async (req, res) => {
  try {
    const records = await BorrowedBook.find()
      .populate({ path: 'borrower', populate: { path: 'userId', select: 'name email' } })
      .populate('book', 'title')
      .sort({ borrowedAt: -1 });
    res.json({ success: true, data: records });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/borrowed/:id', async (req, res) => {
  try {
    const record = await BorrowedBook.findById(req.params.id)
      .populate({ path: 'borrower', populate: { path: 'userId', select: 'name email' } })
      .populate('book', 'title');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Purchases ────────────────────────────────────────────────
router.get('/purchases', async (req, res) => {
  try {
    const purchases = await BookPurchase.find().populate('book', 'title').sort({ purchaseDate: -1 });
    res.json({ success: true, data: purchases });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/purchases', async (req, res) => {
  try {
    const purchase = await BookPurchase.create(req.body);
    res.status(201).json({ success: true, data: purchase });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/purchases/:id', async (req, res) => {
  try {
    await BookPurchase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Purchase deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Sales ────────────────────────────────────────────────────
router.get('/sales', async (req, res) => {
  try {
    const sales = await BookSale.find().populate('book', 'title').sort({ saleDate: -1 });
    res.json({ success: true, data: sales });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/sales', async (req, res) => {
  try {
    const sale = await BookSale.create(req.body);
    res.status(201).json({ success: true, data: sale });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/sales/:id', async (req, res) => {
  try {
    await BookSale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Sale deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Reports ──────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const [totalBooks, totalBorrowed, totalPurchases, totalSales] = await Promise.all([
      Book.countDocuments({ deletedAt: null }),
      BorrowedBook.countDocuments(),
      BookPurchase.countDocuments(),
      BookSale.countDocuments(),
    ]);
    res.json({
      success: true,
      data: { totalBooks, totalBorrowed, totalPurchases, totalSales }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
