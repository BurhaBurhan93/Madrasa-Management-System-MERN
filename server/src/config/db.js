const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️  MONGODB_URI not set; starting server without DB connection');
      return;
    }
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('📦 MongoDB Connected');
    return mongoose.connection;
  } catch (err) {
    console.error('🛑 MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
