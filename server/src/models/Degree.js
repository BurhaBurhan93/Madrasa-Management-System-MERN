const mongoose = require('mongoose');
const { Schema } = mongoose;

const DegreeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

DegreeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Degree', DegreeSchema);
