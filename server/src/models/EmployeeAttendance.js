const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeAttendanceSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  lateMinutes: { type: Number, default: 0 },
  remarks: { type: String },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

EmployeeAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeAttendance', EmployeeAttendanceSchema);
