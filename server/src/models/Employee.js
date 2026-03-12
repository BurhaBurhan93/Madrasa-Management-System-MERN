const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeCode: { type: String, trim: true },
  fullName: { type: String, required: true, trim: true },
  employeeType: { type: String, enum: ['teacher','admin','support'], default: 'support' },
  designation: { type: String, trim: true },
  department: { type: String, trim: true },
  joiningDate: { type: Date },
  baseSalary: { type: Number },
  paymentMethod: { type: String, enum: ['cash','bank'], default: 'cash' },
  status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });

EmployeeSchema.index({ employeeCode: 1 }, { unique: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
