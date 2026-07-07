const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimetableSchema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  day: { type: String, required: true },
  period: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String },
  room: { type: String },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

TimetableSchema.index({ classId: 1, day: 1, period: 1 });

module.exports = mongoose.model('Timetable', TimetableSchema);
