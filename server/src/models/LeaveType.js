const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeaveTypeSchema = new Schema({
  leaveTypeName: { type: String, required: true, trim: true },
  leaveCode: { type: String, required: true, unique: true, trim: true },
  maxDaysAllowed: { type: Number, required: true },
  carryForward: { type: Boolean, default: false },
  requiresMedicalCertificate: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: true },
  genderSpecific: { type: String, enum: ['male', 'female', 'both'], default: 'both' },
  description: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

LeaveTypeSchema.index({ leaveCode: 1 });

module.exports = mongoose.model('LeaveType', LeaveTypeSchema);
