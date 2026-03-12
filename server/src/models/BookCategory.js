const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookCategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

BookCategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('BookCategory', BookCategorySchema);
