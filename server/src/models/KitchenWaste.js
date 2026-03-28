const mongoose = require('mongoose');
const { Schema } = mongoose;

const KitchenWasteSchema = new Schema({
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  wasteDate: { type: Date, default: Date.now },
  reason: { type: String, enum: ['spoiled', 'expired', 'overcooked', 'other'], default: 'spoiled' },
  remarks: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

KitchenWasteSchema.index({ wasteDate: 1 });

module.exports = mongoose.model('KitchenWaste', KitchenWasteSchema);
