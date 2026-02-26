const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠️  MONGODB_URI not set; starting server without DB connection');
      return;
    }
    await mongoose.connect(uri);
    console.log('📦 MongoDB connected: madrasa-mis database');
    return mongoose.connection;
  } catch (err) {
    console.error('🛑 MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
