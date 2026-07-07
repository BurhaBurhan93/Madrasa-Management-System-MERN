const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSaleSchema = new Schema({
  saleDate: { type: Date, default: Date.now },
  receiptNo: { type: String, unique: true, required: true, trim: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  buyerName: { type: String, trim: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  soldBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

BookSaleSchema.index({ receiptNo: 1 }, { unique: true });

module.exports = mongoose.model('BookSale', BookSaleSchema);
