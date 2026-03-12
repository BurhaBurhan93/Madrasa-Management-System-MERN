const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassSchema = new Schema({
  code: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['boys','girls','mixed'], default: 'mixed' },
  teacher: { type: Schema.Types.ObjectId, ref: 'User' },
  maxStudents: { type: Number },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

ClassSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
