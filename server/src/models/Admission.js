const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdmissionSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  grandfatherName: { type: String, trim: true },
  permanentAddress: {
    province: String, district: String, village: String
  },
  currentAddress: {
    province: String, district: String, village: String
  },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  dob: { type: Date },
  bloodType: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  image: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  documents: [{
    fileId: String,
    filename: String,
    mimetype: String,
    url: String
  }],
  degree: { type: Schema.Types.ObjectId, ref: 'Degree' },
  previousDegree: { type: String, trim: true },
  previousInstitution: { type: String, trim: true },
  locationOfInstitution: { type: String, trim: true },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
AdmissionSchema.index({ status: 1 });
AdmissionSchema.index({ degree: 1 });

module.exports = mongoose.model('Admission', AdmissionSchema);
