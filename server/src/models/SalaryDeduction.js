const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalaryDeductionSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  deductionType: { type: String, required: true, trim: true },
  deductionReason: { type: String, trim: true },
  deductionAmount: { type: Number, required: true },
  deductionMonth: { type: Number, min: 1, max: 12, required: true },
  deductionYear: { type: Number, required: true },
  appliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true });

SalaryDeductionSchema.index({ employee: 1, deductionYear: 1, deductionMonth: 1 });

module.exports = mongoose.model('SalaryDeduction', SalaryDeductionSchema);
