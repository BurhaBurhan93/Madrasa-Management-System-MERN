const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('[DB] Starting connection...');
    console.log('[DB] Raw URI exists:', !!uri);
    
    // Fix malformed URI that has MONGODB_URI= prefix
    if (uri && uri.startsWith('MONGODB_URI=')) {
      console.log('[DB] Detected malformed URI, extracting actual value...');
      uri = uri.replace('MONGODB_URI=', '');
    }
    
    console.log('[DB] URI starts with:', uri ? uri.substring(0, 40) + '...' : 'N/A');
    
    if (!uri) {
      console.warn('[DB] ⚠️  MONGODB_URI not set; starting server without DB connection');
      return;
    }
    
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      bufferCommands: false,
      maxPoolSize: 10
    });
    console.log('[DB] ✅ MongoDB Connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('[DB] 🛑 MongoDB connection error:', err.message);
    console.error('[DB] Full error:', err);
    throw err;
  }
};

module.exports = connectDB;
