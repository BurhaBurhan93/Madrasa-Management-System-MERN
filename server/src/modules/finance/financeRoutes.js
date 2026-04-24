const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./financeController');

router.use(auth);

// Transactions
router.get('/transactions', ctrl.listTransactions);
router.get('/transactions/:id', ctrl.getTransactionById);
router.post('/transactions', ctrl.createTransaction);
router.put('/transactions/:id', ctrl.updateTransaction);
router.delete('/transactions/:id', ctrl.deleteTransaction);

// Accounts
router.get('/accounts', ctrl.listAccounts);
router.get('/accounts/:id', ctrl.getAccountById);
router.post('/accounts', ctrl.createAccount);
router.put('/accounts/:id', ctrl.updateAccount);
router.delete('/accounts/:id', ctrl.deleteAccount);

// Fee Structures
router.get('/fee-structures', ctrl.listFeeStructures);
router.get('/fee-structures/:id', ctrl.getFeeStructureById);
router.post('/fee-structures', ctrl.createFeeStructure);
router.put('/fee-structures/:id', ctrl.updateFeeStructure);
router.delete('/fee-structures/:id', ctrl.deleteFeeStructure);

// Student Fees
router.get('/student-fees', ctrl.listStudentFees);
router.get('/student-fees/:id', ctrl.getStudentFeeById);
router.post('/student-fees', ctrl.createStudentFee);
router.put('/student-fees/:id', ctrl.updateStudentFee);
router.delete('/student-fees/:id', ctrl.deleteStudentFee);

// Fee Payments
router.get('/fee-payments', ctrl.listFeePayments);
router.get('/fee-payments/:id', ctrl.getFeePaymentById);
router.post('/fee-payments', ctrl.createFeePayment);
router.put('/fee-payments/:id', ctrl.updateFeePayment);
router.delete('/fee-payments/:id', ctrl.deleteFeePayment);

// Expenses
router.get('/expenses', ctrl.listExpenses);
router.get('/expenses/:id', ctrl.getExpenseById);
router.post('/expenses', ctrl.createExpense);
router.put('/expenses/:id', ctrl.updateExpense);
router.delete('/expenses/:id', ctrl.deleteExpense);

// Financial Reports
router.get('/reports', ctrl.listFinancialReports);
router.get('/reports/:id', ctrl.getFinancialReportById);
router.post('/reports', ctrl.createFinancialReport);
router.put('/reports/:id', ctrl.updateFinancialReport);
router.delete('/reports/:id', ctrl.deleteFinancialReport);

module.exports = router;
