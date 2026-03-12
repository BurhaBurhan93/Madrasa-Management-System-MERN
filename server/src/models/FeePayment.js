const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeePaymentSchema = new Schema({
  studentFee: { type: Schema.Types.ObjectId, ref: 'StudentFee', required: true },
  receiptNo: { type: String, required: true, trim: true },
  paymentDate: { type: Date, default: Date.now },
  paidAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash','card'], default: 'cash' },
  transactionReference: { type: String, trim: true },
  paymentStatus: { type: String, enum: ['completed','pending','failed'], default: 'completed' },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { type: String, enum: ['pending','verified','rejected'], default: 'verified' },
  paymentChannel: { type: String, trim: true },
  remarks: String
}, { timestamps: true });

FeePaymentSchema.index({ receiptNo: 1 }, { unique: true });

module.exports = mongoose.model('FeePayment', FeePaymentSchema);
