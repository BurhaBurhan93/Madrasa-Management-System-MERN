const mongoose = require('mongoose');
const { Schema } = mongoose;

const InventorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'General', trim: true },
  quantity: { type: Number, default: 0 },
  minLevel: { type: Number, default: 5 },
  location: { type: String, default: 'Main Store', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
