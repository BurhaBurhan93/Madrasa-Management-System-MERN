const mongoose = require('mongoose');
const { Schema } = mongoose;

const WeeklyMenuSchema = new Schema({
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  menuItems: [{ type: String }],
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

WeeklyMenuSchema.index({ weekStartDate: 1, day: 1, mealType: 1 });

module.exports = mongoose.model('WeeklyMenu', WeeklyMenuSchema);
