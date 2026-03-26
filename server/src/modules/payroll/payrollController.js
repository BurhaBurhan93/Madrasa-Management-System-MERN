const SalaryStructure = require('../../models/SalaryStructure');
const SalaryPayment = require('../../models/SalaryPayment');
const SalaryDeduction = require('../../models/SalaryDeduction');
const SalaryAdvance = require('../../models/SalaryAdvance');
const Employee = require('../../models/Employee');

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

const createItem = async (Model, req, res) => {
  try {
    const item = await Model.create(req.body);
    res.status(201).json({ success: true, data: item, message: 'Created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateItem = async (Model, req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// Salary Structures
exports.listSalaryStructures = (req, res) => listModel(SalaryStructure, req, res, { searchFields: ['employeeType'] });
exports.getSalaryStructureById = (req, res) => getById(SalaryStructure, req, res);
exports.createSalaryStructure = (req, res) => createItem(SalaryStructure, req, res);
exports.updateSalaryStructure = (req, res) => updateItem(SalaryStructure, req, res);
exports.deleteSalaryStructure = (req, res) => deleteItem(SalaryStructure, req, res);

// Salary Payments
exports.listSalaryPayments = (req, res) => listModel(SalaryPayment, req, res);
exports.getSalaryPaymentById = (req, res) => getById(SalaryPayment, req, res);
exports.createSalaryPayment = (req, res) => createItem(SalaryPayment, req, res);
exports.updateSalaryPayment = (req, res) => updateItem(SalaryPayment, req, res);
exports.deleteSalaryPayment = (req, res) => deleteItem(SalaryPayment, req, res);

// Salary Deductions
exports.listSalaryDeductions = (req, res) => listModel(SalaryDeduction, req, res, { searchFields: ['deductionType','deductionReason'] });
exports.getSalaryDeductionById = (req, res) => getById(SalaryDeduction, req, res);
exports.createSalaryDeduction = (req, res) => createItem(SalaryDeduction, req, res);
exports.updateSalaryDeduction = (req, res) => updateItem(SalaryDeduction, req, res);
exports.deleteSalaryDeduction = (req, res) => deleteItem(SalaryDeduction, req, res);

// Salary Advances
exports.listSalaryAdvances = (req, res) => listModel(SalaryAdvance, req, res);
exports.getSalaryAdvanceById = (req, res) => getById(SalaryAdvance, req, res);
exports.createSalaryAdvance = (req, res) => createItem(SalaryAdvance, req, res);
exports.updateSalaryAdvance = (req, res) => updateItem(SalaryAdvance, req, res);
exports.deleteSalaryAdvance = (req, res) => deleteItem(SalaryAdvance, req, res);

// Employees list for relation dropdowns
exports.listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('fullName employeeCode employeeType department');
    res.json({ success: true, data: employees });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
