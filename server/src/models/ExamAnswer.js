const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamAnswerSchema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: { type: Map, of: String },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ExamAnswerSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ExamAnswer', ExamAnswerSchema);
