const mongoose = require('mongoose');
const { Schema } = mongoose;

const HostelMealSchema = new Schema({
  // Meal identification
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  date: { type: Date, required: true },
  
  // Menu details
  menu: {
    mainDish: { type: String, trim: true },
    sideDish: { type: String, trim: true },
    dessert: { type: String, trim: true },
    beverage: { type: String, trim: true }
  },
  
  // Dietary info
  isVegetarian: { type: Boolean, default: false },
  allergens: [{ 
    type: String,
    enum: ['dairy', 'eggs', 'nuts', 'peanuts', 'sesame', 'soy', 'gluten', 'fish', 'shellfish']
  }],
  specialNotes: { type: String, trim: true },
  
  // Attendance tracking
  totalResidents: { type: Number, default: 0 },
  attendedCount: { type: Number, default: 0 },
  
  // Audit fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Soft delete support
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Indexes
HostelMealSchema.index({ date: 1, mealType: 1 }, { unique: true });
HostelMealSchema.index({ mealType: 1 });
HostelMealSchema.index({ date: -1 });
HostelMealSchema.index({ isVegetarian: 1 });

module.exports = mongoose.model('HostelMeal', HostelMealSchema);
