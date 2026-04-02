const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Personal Information (stored here for quick access, also in User)
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  grandfatherName: { type: String, trim: true },
  dob: { type: Date },
  bloodType: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  
  // Contact Information
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  
  // Address Information
  permanentAddress: {
    province: String,
    district: String,
    village: String
  },
  currentAddress: {
    province: String,
    district: String,
    village: String
  },
  
  // Guardian Information
  guardianName: { type: String, trim: true },
  guardianRelationship: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
  guardianEmail: { type: String, trim: true, lowercase: true },
  
  // Academic Information
  studentCode: { type: String, trim: true },
  admissionDate: { type: Date },
  currentClass: { type: Schema.Types.ObjectId, ref: 'Class' },
  currentLevel: { type: String },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  
  // Audit fields
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Soft delete support
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
StudentSchema.index({ studentCode: 1 }, { unique: true });
StudentSchema.index({ user: 1 });
StudentSchema.index({ currentClass: 1 });
StudentSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Student', StudentSchema);
