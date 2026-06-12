const mongoose = require('mongoose');
const { Schema } = mongoose;

const HostelRoomSchema = new Schema({
  roomNumber: { type: String, required: true, trim: true },
  building: { type: String, required: true, trim: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 2 },
  roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'], default: 'double' },
  amenities: [{ 
    type: String,
    enum: ['wifi', 'ac', 'fan', 'study_table', 'chair', 'wardrobe', 'attached_bathroom', 'tv', 'refrigerator']
  }],
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'maintenance', 'reserved'], 
    default: 'available' 
  },
  monthlyRent: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Additional info
  description: { type: String, trim: true },
  notes: { type: String, trim: true },
  
  // Audit fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Soft delete support
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
HostelRoomSchema.index({ roomNumber: 1, building: 1 }, { unique: true });
HostelRoomSchema.index({ status: 1 });
HostelRoomSchema.index({ building: 1 });
HostelRoomSchema.index({ floor: 1 });
HostelRoomSchema.index({ roomType: 1 });

module.exports = mongoose.model('HostelRoom', HostelRoomSchema);
