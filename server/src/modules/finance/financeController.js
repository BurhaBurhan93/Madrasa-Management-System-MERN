const financeService = require('./financeService');
const Account = require('../../models/Account');
const FeeStructure = require('../../models/FeeStructure');
const StudentFee = require('../../models/StudentFee');
const FeePayment = require('../../models/FeePayment');
const Expense = require('../../models/Expense');
const FinancialReport = require('../../models/FinancialReport');

const toNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const listModel = async (Model, req, res, options = {}) => {
  try {
    const page = Math.max(1, toNumber(req.query.page, 1));
    const limit = Math.min(200, Math.max(1, toNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const query = {};
    if (options.searchFields && req.query.search) {
      const safe = String(req.query.search).trim();
      if (safe.length > 0) {
        query.$or = options.searchFields.map((f) => ({ [f]: { $regex: safe, $options: 'i' } }));
      }
    }

    const [data, total] = await Promise.all([
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(query)
    ]);

    res.json({ success: true, data, total, page, limit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getById = async (Model, req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createItem = async (Model, req, res, transform) => {
  try {
    const payload = transform ? transform(req.body) : req.body;
    const item = await Model.create(payload);
    res.status(201).json({ success: true, data: item, message: 'Created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateItem = async (Model, req, res, transform) => {
  try {
    const payload = transform ? transform(req.body) : req.body;
    const item = await Model.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: item, message: 'Updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteItem = async (Model, req, res) => {
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Transactions (already in service)
exports.listTransactions = async (req, res) => {
  try {
    const result = await financeService.listTransactions(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await financeService.getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await financeService.createTransaction(req.body);
    res.status(201).json({ success: true, data: transaction, message: 'Transaction created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await financeService.updateTransaction(req.params.id, req.body);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction, message: 'Transaction updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await financeService.deleteTransaction(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Accounts
exports.listAccounts = (req, res) => listModel(Account, req, res, { searchFields: ['accountCode', 'accountName'] });
exports.getAccountById = (req, res) => getById(Account, req, res);
exports.createAccount = (req, res) => createItem(Account, req, res, (body) => {
  const openingBalance = toNumber(body.openingBalance, 0) || 0;
  const currentBalance = body.currentBalance !== undefined ? toNumber(body.currentBalance, openingBalance) : openingBalance;
  return { ...body, openingBalance, currentBalance };
});
exports.updateAccount = (req, res) => updateItem(Account, req, res, (body) => {
  if (body.openingBalance !== undefined) body.openingBalance = toNumber(body.openingBalance, 0);
  if (body.currentBalance !== undefined) body.currentBalance = toNumber(body.currentBalance, 0);
  return body;
});
exports.deleteAccount = (req, res) => deleteItem(Account, req, res);

// Fee Structures
exports.listFeeStructures = (req, res) => listModel(FeeStructure, req, res, { searchFields: ['feeCode', 'feeName'] });
exports.getFeeStructureById = (req, res) => getById(FeeStructure, req, res);
exports.createFeeStructure = (req, res) => createItem(FeeStructure, req, res);
exports.updateFeeStructure = (req, res) => updateItem(FeeStructure, req, res);
exports.deleteFeeStructure = (req, res) => deleteItem(FeeStructure, req, res);

// Student Fees
exports.listStudentFees = (req, res) => listModel(StudentFee, req, res);
exports.getStudentFeeById = (req, res) => getById(StudentFee, req, res);
exports.createStudentFee = (req, res) => createItem(StudentFee, req, res);
exports.updateStudentFee = (req, res) => updateItem(StudentFee, req, res);
exports.deleteStudentFee = (req, res) => deleteItem(StudentFee, req, res);

// Fee Payments
exports.listFeePayments = (req, res) => listModel(FeePayment, req, res, { searchFields: ['receiptNo', 'transactionReference'] });
exports.getFeePaymentById = (req, res) => getById(FeePayment, req, res);
exports.createFeePayment = (req, res) => createItem(FeePayment, req, res);
exports.updateFeePayment = (req, res) => updateItem(FeePayment, req, res);
exports.deleteFeePayment = (req, res) => deleteItem(FeePayment, req, res);

// Expenses
exports.listExpenses = (req, res) => listModel(Expense, req, res, { searchFields: ['expenseCode', 'category', 'title'] });
exports.getExpenseById = (req, res) => getById(Expense, req, res);
exports.createExpense = (req, res) => createItem(Expense, req, res);
exports.updateExpense = (req, res) => updateItem(Expense, req, res);
exports.deleteExpense = (req, res) => deleteItem(Expense, req, res);

// Financial Reports
exports.listFinancialReports = (req, res) => listModel(FinancialReport, req, res, { searchFields: ['reportType', 'reportPeriod'] });
exports.getFinancialReportById = (req, res) => getById(FinancialReport, req, res);
exports.createFinancialReport = (req, res) => createItem(FinancialReport, req, res);
exports.updateFinancialReport = (req, res) => updateItem(FinancialReport, req, res);
exports.deleteFinancialReport = (req, res) => deleteItem(FinancialReport, req, res);
