const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeaveSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  leaveReason: { type: String },
  rejectionReason: { type: String },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  leaveDays: { type: Number },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' }
}, { timestamps: true });

// Index for employee leave requests
LeaveSchema.index({ employee: 1, status: 1 });

module.exports = mongoose.model('Leave', LeaveSchema);
