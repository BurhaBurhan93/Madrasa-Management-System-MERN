const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  field: { type: String },
  image: { type: String },
  credits: { type: Number, default: 0 },
  weeklyHours: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'upcoming', 'inactive'], default: 'active' },
  isActive: { type: Boolean, default: true },
  students: { type: Number, default: 0 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

SubjectSchema.index({ name: 1 }, { unique: true });
SubjectSchema.index({ code: 1 });

module.exports = mongoose.model('Subject', SubjectSchema);
