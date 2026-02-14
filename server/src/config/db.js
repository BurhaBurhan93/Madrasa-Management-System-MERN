const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB connected: madrasa-mis database');
  } catch (err) {
    console.error('🛑 MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
