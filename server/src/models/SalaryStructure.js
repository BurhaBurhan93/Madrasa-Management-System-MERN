const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalaryStructureSchema = new Schema({
  employeeType: { type: String, enum: ['teacher','staff','admin','support'], required: true },
  basicSalary: { type: Number, required: true },
  allowanceAmount: { type: Number, default: 0 },
  housingAllowance: { type: Number, default: 0 },
  foodAllowance: { type: Number, default: 0 },
  transportAllowance: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 0 },
  deductionType: { type: String, trim: true },
  taxPercentage: { type: Number, default: 0 },
  effectiveFrom: { type: Date, required: true },
  status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });

SalaryStructureSchema.index({ employeeType: 1, effectiveFrom: -1 });

module.exports = mongoose.model('SalaryStructure', SalaryStructureSchema);
