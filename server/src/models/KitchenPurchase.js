const mongoose = require('mongoose');
const { Schema } = mongoose;

const KitchenPurchaseSchema = new Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  supplier: { type: String, trim: true },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'other'], default: 'cash' },
  status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'received' },
  remarks: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

KitchenPurchaseSchema.index({ purchaseDate: 1 });

module.exports = mongoose.model('KitchenPurchase', KitchenPurchaseSchema);
