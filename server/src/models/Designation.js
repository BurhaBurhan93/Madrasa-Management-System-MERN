const mongoose = require('mongoose');
const { Schema } = mongoose;

const DesignationSchema = new Schema({
  designationTitle: { type: String, required: true, trim: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  jobLevel: { type: String, enum: ['entry', 'mid', 'senior', 'manager'], default: 'entry' },
  minQualification: { type: String, trim: true },
  salaryRangeMin: { type: Number },
  salaryRangeMax: { type: Number },
  jobDescription: { type: String, trim: true },
  responsibilities: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

DesignationSchema.index({ department: 1 });

module.exports = mongoose.model('Designation', DesignationSchema);
