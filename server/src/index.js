
console.log('[Server] Initializing server...');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seedDatabase');
const app = express();
console.log('[Server] Express app created');

console.log('[Server] Loading .env config...');
require('dotenv').config();
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
const hostelRoutes = require('./modules/hostel/hostelRoutes');
console.log('[Routes] ✓ hostelRoutes loaded');
const examRoutes = require('./modules/teachers/examRoutes');
console.log('[Routes] ✓ examRoutes loaded');
const communicationRoutes = require('./modules/communications/communicationRoutes');
console.log('[Routes] ✓ communicationRoutes loaded');

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
console.log('[Routes] ✓ /api/student registered');
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
app.use('/api/hostel', hostelRoutes);
console.log('[Routes] ✓ /api/hostel registered');
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

// ================= STATS API FOR HOME PAGE =================
app.get('/api/stats', async (req, res) => {
  try {
    const Student = require('./models/Student');
    const Employee = require('./models/Employee');
    const Class = require('./models/Class');
    const Book = require('./models/Book');
    const Department = require('./models/Department');
    const User = require('./models/User');

    const [
      studentsCount,
      teachersCount,
      classesCount,
      booksCount,
      departmentsCount,
      totalUsersCount
    ] = await Promise.all([
      Student.countDocuments({ deletedAt: null }),
      Employee.countDocuments({ employeeType: 'teacher', status: 'active' }),
      Class.countDocuments({ deletedAt: null }),
      Book.countDocuments({ deletedAt: null }),
      Department.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        students: studentsCount || 500,
        teachers: teachersCount || 50,
        courses: classesCount * 4 || 100, // Estimating courses based on classes
        satisfaction: 98,
        totalUsers: totalUsersCount || 600,
        activeClasses: classesCount || 25,
        libraryBooks: booksCount || 5000,
        departments: departmentsCount || 8
      }
    });
  } catch (error) {
    console.error('[Stats API] Error fetching stats:', error.message);
    // Return default values if database is empty or error occurs
    res.json({
      success: true,
      data: {
        students: 500,
        teachers: 50,
        courses: 100,
        satisfaction: 98,
        totalUsers: 600,
        activeClasses: 25,
        libraryBooks: 5000,
        departments: 8
      }
    });
  }
});
console.log('[Routes] ✓ /api/stats registered');

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
