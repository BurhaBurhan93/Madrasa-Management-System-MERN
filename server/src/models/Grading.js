const mongoose = require('mongoose');

const GradeBoundarySchema = new mongoose.Schema({
  grade: { type: String, required: true },
  minMarks: { type: Number },
  maxMarks: { type: Number },
  gpa: { type: Number },
  remark: { type: String }
}, { _id: false });

const GradingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  grades: [GradeBoundarySchema],
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Grading', GradingSchema);
