const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seedDatabase');

require('dotenv').config();

const app = express();

app.use(cors());        // allow frontend requests
app.use(express.json()); // parse JSON body

// Connect to MongoDB and seed all data
connectDB().then(() => {
  // Seed all database tables after DB connection
  seedDatabase();
});

const authRoutes = require('./modules/auth/authRoutes');
const studentRoutes = require('./modules/students/studentRoutes');
const staffRoutes = require('./modules/staff/staffRoutes');
const teacherRoutes = require('./modules/teachers/teacherRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/teacher', teacherRoutes);

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB (madrasa-mis)!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
