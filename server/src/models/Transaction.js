const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  transactionCode: { type: String, required: true, trim: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  transactionType: { type: String, enum: ['income','expense'], required: true },
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  referenceType: { type: String, trim: true },
  referenceId: { type: Schema.Types.ObjectId },
  balanceAfter: { type: Number },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { type: String, enum: ['pending','verified','rejected'], default: 'verified' },
  description: { type: String, trim: true }
}, { timestamps: true });

// Indexes
TransactionSchema.index({ transactionCode: 1 }, { unique: true });
TransactionSchema.index({ account: 1, transactionDate: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
