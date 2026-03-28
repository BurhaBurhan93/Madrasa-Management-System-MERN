const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentSchema = new Schema({
  departmentName: { type: String, required: true, trim: true },
  departmentCode: { type: String, required: true, unique: true, trim: true },
  departmentHead: { type: Schema.Types.ObjectId, ref: 'Employee' },
  description: { type: String, trim: true },
  location: { type: String, trim: true },
  contactExtension: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

DepartmentSchema.index({ departmentCode: 1 });

module.exports = mongoose.model('Department', DepartmentSchema);
