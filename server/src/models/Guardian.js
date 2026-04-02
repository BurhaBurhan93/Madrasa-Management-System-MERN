const mongoose = require('mongoose');
const { Schema } = mongoose;

const GuardianSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  
  // Guardian Information
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  relationship: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true 
  },
  occupation: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  idNumber: { 
    type: String, 
    trim: true 
  },
  
  // Is this the primary guardian?
  isPrimary: { 
    type: Boolean, 
    default: false 
  },
  
  // Soft delete support
  deletedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

// Indexes
GuardianSchema.index({ student: 1 });
GuardianSchema.index({ isPrimary: 1 });
GuardianSchema.index({ phone: 1 });

module.exports = mongoose.model('Guardian', GuardianSchema);
