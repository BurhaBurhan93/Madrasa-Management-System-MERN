const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalaryAdvanceSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  advanceAmount: { type: Number, required: true },
  requestDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  repaymentStartMonth: { type: Number, min: 1, max: 12 },
  monthlyDeductionAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  advanceStatus: { type: String, enum: ['pending','approved','rejected','closed'], default: 'pending' }
}, { timestamps: true });

SalaryAdvanceSchema.index({ employee: 1, advanceStatus: 1 });

module.exports = mongoose.model('SalaryAdvance', SalaryAdvanceSchema);
