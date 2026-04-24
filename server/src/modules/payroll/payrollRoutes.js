const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./payrollController');

router.use(auth);

// Employees list for relation dropdowns
router.get('/employees', ctrl.listEmployees);

// Salary Structures
router.get('/salary-structures', ctrl.listSalaryStructures);
router.get('/salary-structures/:id', ctrl.getSalaryStructureById);
router.post('/salary-structures', ctrl.createSalaryStructure);
router.put('/salary-structures/:id', ctrl.updateSalaryStructure);
router.delete('/salary-structures/:id', ctrl.deleteSalaryStructure);

// Salary Payments
router.get('/salary-payments', ctrl.listSalaryPayments);
router.get('/salary-payments/:id', ctrl.getSalaryPaymentById);
router.post('/salary-payments', ctrl.createSalaryPayment);
router.put('/salary-payments/:id', ctrl.updateSalaryPayment);
router.delete('/salary-payments/:id', ctrl.deleteSalaryPayment);

// Salary Deductions
router.get('/salary-deductions', ctrl.listSalaryDeductions);
router.get('/salary-deductions/:id', ctrl.getSalaryDeductionById);
router.post('/salary-deductions', ctrl.createSalaryDeduction);
router.put('/salary-deductions/:id', ctrl.updateSalaryDeduction);
router.delete('/salary-deductions/:id', ctrl.deleteSalaryDeduction);

// Salary Advances
router.get('/salary-advances', ctrl.listSalaryAdvances);
router.get('/salary-advances/:id', ctrl.getSalaryAdvanceById);
router.post('/salary-advances', ctrl.createSalaryAdvance);
router.put('/salary-advances/:id', ctrl.updateSalaryAdvance);
router.delete('/salary-advances/:id', ctrl.deleteSalaryAdvance);

module.exports = router;
