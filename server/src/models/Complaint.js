const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  complaintCode: { type: String, required: true, trim: true },
  complainantType: { type: String, enum: ['student','staff','other'], required: true },
  complainant: { type: Schema.Types.ObjectId, required: true },
  complaintCategory: { type: String, trim: true },
  subject: { type: String, trim: true },
  description: { type: String },
  priorityLevel: { type: String, enum: ['low','medium','high'], default: 'medium' },
  complaintStatus: { type: String, enum: ['open','in_progress','closed'], default: 'open' },
  submittedDate: { type: Date, default: Date.now },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  confidentialityLevel: { type: String, enum: ['low','medium','high'], default: 'low' },
  closedAt: { type: Date }
}, { timestamps: true });

ComplaintSchema.index({ complaintCode: 1 }, { unique: true });
ComplaintSchema.index({ complaintStatus: 1, priorityLevel: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
