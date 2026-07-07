const mongoose = require('mongoose');
const { Schema } = mongoose;

const DegreeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  duration: { type: String, trim: true },
  level: { type: String, trim: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  description: { type: String, trim: true },
  image: { type: String },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

DegreeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Degree', DegreeSchema);
