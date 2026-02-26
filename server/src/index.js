const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedUsers = require('./seedUsers');

require('dotenv').config();

const app = express();

app.use(cors());        // allow frontend requests
app.use(express.json()); // parse JSON body

// Connect to MongoDB and seed users
connectDB().then(() => {
  // Seed test users after DB connection
  seedUsers();
});

const authRoutes = require('./modules/auth/authRoutes');
const studentRoutes = require('./modules/students/studentRoutes');
const staffRoutes = require('./modules/staff/staffRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB (madrasa-mis)!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
