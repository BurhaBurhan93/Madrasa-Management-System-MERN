const mongoose = require('mongoose');
const { Schema } = mongoose;

const HostelMealAttendanceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  meal: { type: Schema.Types.ObjectId, ref: 'HostelMeal', required: true },
  
  // Attendance status
  status: { type: String, enum: ['present', 'absent', 'excused'], default: 'absent' },
  
  // Timing
  markedAt: { type: Date, default: Date.now },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Notes
  notes: { type: String, trim: true }
}, { timestamps: true });

// Indexes
HostelMealAttendanceSchema.index({ student: 1, meal: 1 }, { unique: true });
HostelMealAttendanceSchema.index({ meal: 1 });
HostelMealAttendanceSchema.index({ status: 1 });

module.exports = mongoose.model('HostelMealAttendance', HostelMealAttendanceSchema);
