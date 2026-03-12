const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ permissions: 1 });

module.exports = mongoose.model('Role', RoleSchema);
