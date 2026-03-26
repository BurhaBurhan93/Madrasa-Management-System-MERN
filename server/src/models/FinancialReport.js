const mongoose = require('mongoose');
const { Schema } = mongoose;

const FinancialReportSchema = new Schema({
  reportType: { type: String, required: true, trim: true },
  reportPeriod: { type: String, required: true, trim: true },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  netBalance: { type: Number, default: 0 },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now },
  approvalStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  remarks: { type: String }
}, { timestamps: true });

FinancialReportSchema.index({ reportType: 1, reportPeriod: 1 });

module.exports = mongoose.model('FinancialReport', FinancialReportSchema);
