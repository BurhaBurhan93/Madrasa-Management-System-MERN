const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeacherFeedbackSchema = new Schema({
  feedbackType: { type: String, enum: ['student', 'admin', 'peer', 'self'], required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  subject: { type: String, trim: true, required: true },
  category: { type: String, enum: ['academic', 'behavior', 'attendance', 'participation', 'improvement', 'general'], default: 'general' },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  comments: { type: String },
  feedbackFrom: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feedbackTo: { type: Schema.Types.ObjectId, ref: 'User' },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  subjectRef: { type: Schema.Types.ObjectId, ref: 'Subject' },
  isVisible: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

TeacherFeedbackSchema.index({ feedbackFrom: 1 });
TeacherFeedbackSchema.index({ student: 1 });
TeacherFeedbackSchema.index({ feedbackType: 1 });

module.exports = mongoose.model('TeacherFeedback', TeacherFeedbackSchema);
