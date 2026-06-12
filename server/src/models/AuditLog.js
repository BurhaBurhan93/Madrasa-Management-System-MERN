const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  // What entity was changed
  entityType: { 
    type: String, 
    required: true, 
    enum: ['Student', 'Admission', 'Guardian', 'Education', 'Document', 'User'] 
  },
  entityId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  
  // What field was changed
  field: { 
    type: String, 
    required: true 
  },
  
  // Old and new values
  oldValue: { 
    type: mongoose.Mixed, 
    required: true 
  },
  newValue: { 
    type: mongoose.Mixed, 
    required: true 
  },
  
  // Who made the change
  changedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Why the change was made
  reason: { 
    type: String, 
    required: true 
  },
  
  // Metadata
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'correct'], 
    default: 'update' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  
  // Additional context
  metadata: {
    type: Map,
    of: mongoose.Mixed
  }
}, { timestamps: true });

// Indexes for efficient querying
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ changedBy: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
