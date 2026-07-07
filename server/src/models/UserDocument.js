const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserDocumentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, trim: true },
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  filePath: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'archived'] },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

UserDocumentSchema.index({ student: 1 });

module.exports = mongoose.model('UserDocument', UserDocumentSchema);
