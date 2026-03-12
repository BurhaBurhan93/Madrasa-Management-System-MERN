const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeeStructureSchema = new Schema({
  feeCode: { type: String, required: true, trim: true },
  feeName: { type: String, required: true, trim: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  feeType: { type: String, enum: ['tuition','admission','other'], default: 'tuition' },
  amount: { type: Number, required: true, min: 0 },
  frequency: { type: String, enum: ['one-time','monthly','yearly'], default: 'one-time' },
  applicableFrom: { type: Date },
  applicableTo: { type: Date },
  isMandatory: { type: Boolean, default: true },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

FeeStructureSchema.index({ feeCode: 1 }, { unique: true });
FeeStructureSchema.index({ class: 1 });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
