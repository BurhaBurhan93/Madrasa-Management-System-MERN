const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamSchema = new Schema({
  title: { type: String, required: true, trim: true },
  examType: { type: Schema.Types.ObjectId, ref: 'ExamType' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  academicYear: { type: String },
  duration: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'finished', 'cancelled'],
    default: 'draft'
  }
}, { timestamps: true });

ExamSchema.index({ academicYear: 1 });
ExamSchema.index({ createdBy: 1 });
ExamSchema.index({ status: 1 });

module.exports = mongoose.model('Exam', ExamSchema);
