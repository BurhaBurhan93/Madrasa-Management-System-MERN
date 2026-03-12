const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// User routes
const userRoutes = require('./modules/users/userRoutes');
app.use('/api/users', userRoutes);

console.log('✅ User routes registered');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Test server running on port ${PORT}`));
