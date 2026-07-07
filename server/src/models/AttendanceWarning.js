const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceWarningSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  warningType: { type: String, enum: ['low_attendance','excessive_late'], required: true },
  threshold: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'notified', 'dismissed'], default: 'active' },
  issuedAt: { type: Date, default: Date.now },
  remarks: { type: String }
}, { timestamps: true });

AttendanceWarningSchema.index({ student: 1 });

module.exports = mongoose.model('AttendanceWarning', AttendanceWarningSchema);
