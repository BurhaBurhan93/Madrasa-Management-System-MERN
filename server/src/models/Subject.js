const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  field: { type: String },
  image: { type: String },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

SubjectSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
