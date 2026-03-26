const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalaryPaymentSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  salaryMonth: { type: Number, min: 1, max: 12, required: true },
  salaryYear: { type: Number, required: true },
  grossSalary: { type: Number, required: true },
  totalAllowance: { type: Number, default: 0 },
  totalDeduction: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash','bank','card','other'], default: 'cash' },
  transactionReference: { type: String, trim: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'paid' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paidBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SalaryPaymentSchema.index({ employee: 1, salaryYear: 1, salaryMonth: 1 });

module.exports = mongoose.model('SalaryPayment', SalaryPaymentSchema);
