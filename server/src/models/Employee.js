const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeCode: { type: String, trim: true, unique: true },
  
  // Personal Information
  fullName: { type: String, required: true, trim: true },
  fullNameArabic: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female'], required: true },
  cnic: { type: String, trim: true },
  photo: { type: String },
  bloodGroup: { type: String, trim: true },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  
  // Contact Information
  phoneNumber: { type: String, required: true, trim: true },
  secondaryPhone: { type: String, trim: true },
  email: { type: String, trim: true },
  currentAddress: { type: String, trim: true },
  permanentAddress: { type: String, trim: true },
  emergencyContactName: { type: String, trim: true },
  emergencyContactRelation: { type: String, trim: true },
  emergencyContactPhone: { type: String, trim: true },
  
  // Employment Details
  employeeType: { type: String, enum: ['teacher','admin','support','kitchen','security'], default: 'support' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: Schema.Types.ObjectId, ref: 'Designation' },
  joiningDate: { type: Date, required: true },
  employmentType: { type: String, enum: ['permanent', 'contract', 'part-time'], default: 'permanent' },
  shiftTiming: { type: String, trim: true },
  reportingManager: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  // Qualification & Experience
  highestQualification: { type: String, trim: true },
  specialization: { type: String, trim: true },
  previousExperience: { type: Number, default: 0 },
  
  // Salary & Bank Details
  baseSalary: { type: Number, required: true },
  houseAllowance: { type: Number, default: 0 },
  transportAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  accountTitle: { type: String, trim: true },
  paymentMethod: { type: String, enum: ['cash','bank'], default: 'cash' },
  
  // Documents
  documents: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });

EmployeeSchema.index({ employeeCode: 1 }, { unique: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
