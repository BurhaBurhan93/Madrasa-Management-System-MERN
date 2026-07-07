const mongoose = require('mongoose');
const { Schema } = mongoose;

const SupportTicketSchema = new Schema({
  ticketNumber: { type: String, required: true, trim: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  subject: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, enum: ['academic','discipline','facilities','other'], default: 'other' },
  priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status: { type: String, enum: ['open','in-progress','resolved','closed'], default: 'open' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
  resolution: { type: String },
  resolvedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
