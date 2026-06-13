const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentLeaveSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  leaveType: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  attachments: [{
    fileId: String,
    filename: String,
    mimetype: String,
    url: String
  }],
  requestedAt: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvalStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  remarks: { type: String }
}, { timestamps: true });

StudentLeaveSchema.index({ student: 1, startDate: 1 });

module.exports = mongoose.model('StudentLeave', StudentLeaveSchema);
