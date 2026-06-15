const mongoose = require('mongoose');
const { Schema } = mongoose;

const MadrasaInfoSchema = new Schema({
  name: { type: String, required: true, trim: true },
  nameArabic: { type: String, trim: true },
  logo: { type: String, trim: true }, // URL or file path
  code: { type: String, trim: true },
  type: { type: String, enum: ['madrasa', 'school', 'institute', 'university'], default: 'madrasa' },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },
  address: {
    province: { type: String, trim: true },
    district: { type: String, trim: true },
    village: { type: String, trim: true },
    fullAddress: { type: String, trim: true }
  },
  principalName: { type: String, trim: true },
  principalPhone: { type: String, trim: true },
  establishedYear: { type: Number },
  registrationNumber: { type: String, trim: true },
  totalCapacity: { type: Number },
  description: { type: String, trim: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MadrasaInfo', MadrasaInfoSchema);
