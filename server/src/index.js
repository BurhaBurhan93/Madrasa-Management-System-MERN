
require('dotenv').config();
console.log('[Server] Initializing server...');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seedDatabase');
const app = express();
console.log('[Server] Express app created');
console.log('[Server] .env loaded, PORT:', process.env.PORT || '5000 (default)');
console.log('[Server] MONGODB_URI exists:', !!(process.env.MONGODB_URI || process.env.MONGO_URI));

app.use(cors());
console.log('[Server] CORS middleware applied');
app.use(express.json());
console.log('[Server] JSON parser middleware applied');

console.log('[Routes] Loading route modules...');
const authRoutes = require('./modules/auth/authRoutes');
console.log('[Routes] ✓ authRoutes loaded');
const studentRoutes = require('./modules/students/studentRoutes');
console.log('[Routes] ✓ studentRoutes loaded');
const staffRoutes = require('./modules/staff/staffRoutes');
console.log('[Routes] ✓ staffRoutes loaded');
const teacherRoutes = require('./modules/teachers/teacherRoutes');
console.log('[Routes] ✓ teacherRoutes loaded');
const financeRoutes = require('./modules/finance/financeRoutes');
console.log('[Routes] ✓ financeRoutes loaded');
const payrollRoutes = require('./modules/payroll/payrollRoutes');
console.log('[Routes] ✓ payrollRoutes loaded');
const hrRoutes = require('./modules/hr/hrRoutes');
console.log('[Routes] ✓ hrRoutes loaded');
const kitchenRoutes = require('./modules/kitchen/kitchenRoutes');
console.log('[Routes] ✓ kitchenRoutes loaded');
const examRoutes = require('./modules/teachers/examRoutes');
console.log('[Routes] ✓ examRoutes loaded');
const academicRoutes = require('./modules/academic/academicRoutes');
console.log('[Routes] ✓ academicRoutes loaded');
const libraryRoutes = require('./modules/library/libraryRoutes');
console.log('[Routes] ✓ libraryRoutes loaded');

// Load user routes with error handling
console.log('[Routes] Loading userRoutes...');
let userRoutes;
try {
  userRoutes = require('./modules/users/userRoutes');
  console.log('[Routes] ✓ userRoutes loaded successfully');
} catch (error) {
  console.error('[Routes] ✗ Error loading userRoutes:', error.message);
  console.error('[Routes] Stack:', error.stack);
}

// Use routes
console.log('[Routes] Registering routes...');
app.use('/api/auth', authRoutes);
console.log('[Routes] ✓ /api/auth registered');
app.use('/api/student', studentRoutes);
app.use('/api/students', studentRoutes);
console.log('[Routes] ✓ /api/student + /api/students registered');
app.use('/api/staff', staffRoutes);
console.log('[Routes] ✓ /api/staff registered');
app.use('/api/teacher', teacherRoutes);
console.log('[Routes] ✓ /api/teacher registered');
app.use('/api/finance', financeRoutes);
console.log('[Routes] ✓ /api/finance registered');
app.use('/api/payroll', payrollRoutes);
console.log('[Routes] ✓ /api/payroll registered');
app.use('/api/hr', hrRoutes);
console.log('[Routes] ✓ /api/hr registered');
app.use('/api/kitchen', kitchenRoutes);
console.log('[Routes] ✓ /api/kitchen registered');
app.use('/api/academic', academicRoutes);
console.log('[Routes] ✓ /api/academic registered');
app.use('/api/library', libraryRoutes);
console.log('[Routes] ✓ /api/library registered');
app.use('/api/attendance', require('./modules/attendance/attendanceRoutes'));
console.log('[Routes] ✓ /api/attendance registered');
app.use('/api', examRoutes);
console.log('[Routes] ✓ /api (examRoutes) registered');

if (userRoutes) {
  app.use('/api/users', userRoutes);
  console.log('[Routes] ✓ /api/users registered');
} else {
  console.error('[Routes] ✗ /api/users NOT registered - check errors above');
}

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB (madrasa-mis)!');
});
console.log('[Routes] ✓ / (root) route registered');

// List all registered routes
if (app._router && app._router.stack) {
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log('Route:', r.route.path);
    }
  });
}

const PORT = process.env.PORT || 5000;
console.log('[Server] PORT set to:', PORT);

// Connect to MongoDB and start server only after connection succeeds
console.log('[Server] Starting server initialization...');
const startServer = async () => {
  try {
    console.log('[Server] Calling connectDB()...');
    await connectDB();
    console.log('[Server] Database connection complete');
    
    app.listen(PORT, () => {
      console.log('[Server] ✅ Server running on port ' + PORT);
      console.log('[Server] Ready to accept requests!');
    });
  } catch (err) {
    console.error('[Server] 🛑 Failed to start server:', err.message);
    console.error('[Server] Full error:', err);
    process.exit(1);
  }
};

console.log('[Server] Calling startServer()...');
startServer();
