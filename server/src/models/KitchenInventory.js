const mongoose = require('mongoose');
const { Schema } = mongoose;

const KitchenInventorySchema = new Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  minimumStock: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'low', 'out'], default: 'available' },
  remarks: { type: String }
}, { timestamps: true });

KitchenInventorySchema.index({ itemName: 1 }, { unique: true });

module.exports = mongoose.model('KitchenInventory', KitchenInventorySchema);
