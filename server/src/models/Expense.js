const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  expenseCode: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  title: { type: String, trim: true },
  amount: { type: Number, required: true },
  expenseDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash','card','other'], default: 'cash' },
  referenceNo: { type: String, trim: true },
  paidTo: { type: String, trim: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvalStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  remarks: { type: String }
}, { timestamps: true });

ExpenseSchema.index({ expenseCode: 1 }, { unique: true });
ExpenseSchema.index({ expenseDate: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
