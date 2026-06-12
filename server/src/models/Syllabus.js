const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  className: { type: String, trim: true },
  subject: { type: String, trim: true },
  topic: { type: String, trim: true },
  description: { type: String },
  semester: { type: String, trim: true },
  order: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', SyllabusSchema);
