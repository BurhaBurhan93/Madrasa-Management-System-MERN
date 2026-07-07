const mongoose = require('mongoose');
const { Schema } = mongoose;

const KitchenBudgetSchema = new Schema({
  month: { type: Number, min: 1, max: 12, required: true },
  year: { type: Number, required: true },
  allocatedAmount: { type: Number, default: 0 },
  approvedAmount: { type: Number, default: 0 },
  spentAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  budgetStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

KitchenBudgetSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('KitchenBudget', KitchenBudgetSchema);
