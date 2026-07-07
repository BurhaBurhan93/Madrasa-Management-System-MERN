const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentEducationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  previousDegree: { type: String, trim: true },
  previousInstitution: { type: String, trim: true },
  location: { type: String, trim: true },
  yearOfCompletion: { type: String, trim: true },
  grade: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true }
}, { timestamps: true });

StudentEducationSchema.index({ student: 1 });

module.exports = mongoose.model('StudentEducation', StudentEducationSchema);
