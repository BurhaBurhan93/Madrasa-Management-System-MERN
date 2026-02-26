const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, trim: true },
  grandfatherName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  emailVerifiedAt: { type: Date, default: null },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student', 'teacher', 'staff'], required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  idNumber: { type: String, trim: true },
  permanentAddress: {
    province: String, district: String, village: String
  },
  currentAddress: {
    province: String, district: String, village: String
  },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  dob: { type: Date },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  image: { type: String },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ roles: 1 });

module.exports = mongoose.model('User', UserSchema);
