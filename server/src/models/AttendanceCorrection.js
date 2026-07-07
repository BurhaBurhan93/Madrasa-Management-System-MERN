const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceCorrectionSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  oldStatus: { type: String, enum: ['present','absent','late','half-day','on-leave'] },
  newStatus: { type: String, enum: ['present','absent','late','half-day','on-leave'], required: true },
  correctionReason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  correctedAt: { type: Date, default: Date.now }
}, { timestamps: true });

AttendanceCorrectionSchema.index({ employee: 1, date: -1 });

module.exports = mongoose.model('AttendanceCorrection', AttendanceCorrectionSchema);
