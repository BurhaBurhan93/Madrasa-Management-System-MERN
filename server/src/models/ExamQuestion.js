const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamQuestionSchema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  question: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'truefalse', 'short', 'essay'], default: 'mcq' },
  options: [{ type: String }],
  correctAnswer: { type: String },
  marks: { type: Number, default: 1 },
  answer: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ExamQuestionSchema.index({ exam: 1, subject: 1 });

module.exports = mongoose.model('ExamQuestion', ExamQuestionSchema);
