const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentCode: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
  admissionDate: { type: Date },
  currentClass: { type: Schema.Types.ObjectId, ref: 'Class' },
  currentLevel: { type: String },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
StudentSchema.index({ studentCode: 1 }, { unique: true });
StudentSchema.index({ user: 1 });
StudentSchema.index({ currentClass: 1 });

module.exports = mongoose.model('Student', StudentSchema);
