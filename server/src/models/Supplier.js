const mongoose = require('mongoose');
const { Schema } = mongoose;

const SupplierSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  itemsSupplied: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String }
}, { timestamps: true });

SupplierSchema.index({ name: 1 });

module.exports = mongoose.model('Supplier', SupplierSchema);
