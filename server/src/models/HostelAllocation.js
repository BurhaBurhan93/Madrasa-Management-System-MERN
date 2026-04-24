const mongoose = require('mongoose');
const { Schema } = mongoose;

const HostelAllocationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  bedNumber: { type: Number, default: 1 },
  
  // Allocation dates
  checkInDate: { type: Date, required: true },
  expectedCheckOutDate: { type: Date },
  actualCheckOutDate: { type: Date },
  
  // Status
  status: { type: String, enum: ['active', 'pending', 'checked-out', 'suspended'], default: 'active' },
  
  // Payment info
  monthlyRent: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, default: 0, min: 0 },
  
  // Fee structure reference
  feeStructure: { type: Schema.Types.ObjectId, ref: 'FeeStructure' },
  
  // Guardian/Parent contact for hostel residents
  emergencyContact: {
    name: { type: String, trim: true, required: true },
    relationship: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true }
  },
  
  // Notes
  notes: { type: String, trim: true },
  
  // Audit fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Soft delete support
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
HostelAllocationSchema.index({ student: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
HostelAllocationSchema.index({ room: 1 });
HostelAllocationSchema.index({ status: 1 });
HostelAllocationSchema.index({ checkInDate: -1 });
HostelAllocationSchema.index({ createdBy: 1 });

module.exports = mongoose.model('HostelAllocation', HostelAllocationSchema);
