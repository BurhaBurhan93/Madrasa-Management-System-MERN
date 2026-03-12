const mongoose = require('mongoose');
const { Schema } = mongoose;

const PermissionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Index for name
PermissionSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Permission', PermissionSchema);