const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seedDatabase');

require('dotenv').config();

const app = express();

app.use(cors());        // allow frontend requests
app.use(express.json()); // parse JSON body

// Connect to MongoDB (disable auto-seeding)
connectDB().then(() => {
  console.log('✅ Database connected. Seeding disabled.');
  // Uncomment below to seed database manually
  // seedDatabase();
});

const authRoutes = require('./modules/auth/authRoutes');
const studentRoutes = require('./modules/students/studentRoutes');
const staffRoutes = require('./modules/staff/staffRoutes');
const teacherRoutes = require('./modules/teachers/teacherRoutes');
const financeRoutes = require('./modules/finance/financeRoutes');
const payrollRoutes = require('./modules/payroll/payrollRoutes');

// Load user routes with error handling
let userRoutes;
try {
  userRoutes = require('./modules/users/userRoutes');
  console.log('✅ User routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
  console.error(error.stack);
}

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/payroll', payrollRoutes);

if (userRoutes) {
  app.use('/api/users', userRoutes);
  console.log('✅ User routes registered at /api/users');
} else {
  console.error('❌ User routes not registered - check errors above');
}

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB (madrasa-mis)!');
});

// List all registered routes
if (app._router && app._router.stack) {
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log('Route:', r.route.path);
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
