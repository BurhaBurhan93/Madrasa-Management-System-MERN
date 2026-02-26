const User = require('./models/User');
const Student = require('./models/Student');
const Employee = require('./models/Employee');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    const testUsers = [
      { name: 'Admin User', email: 'admin@gmail.com', password: 'admin1234', role: 'admin' },
      { name: 'Student User', email: 'student@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Teacher User', email: 'teacher@gmail.com', password: 'teacher1234', role: 'teacher' },
      { name: 'Staff User', email: 'staff@gmail.com', password: 'staff1234', role: 'staff' }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);

      // Create role-specific profile
      if (userData.role === 'student') {
        const studentCount = await Student.countDocuments();
        await Student.create({
          userId: user._id,
          studentId: `STU${2024000 + studentCount + 1}`,
          enrollmentDate: new Date(),
          status: 'active'
        });
        console.log(`  -> Created student profile`);
      } else if (userData.role === 'teacher' || userData.role === 'staff') {
        const empCount = await Employee.countDocuments();
        await Employee.create({
          userId: user._id,
          employeeId: `EMP${2024000 + empCount + 1}`,
          department: userData.role === 'teacher' ? 'Academics' : 'Administration',
          designation: userData.role === 'teacher' ? 'Teacher' : 'Staff',
          joinDate: new Date(),
          status: 'active'
        });
        console.log(`  -> Created employee profile`);
      }
    }

    console.log('\n✅ Test users seeded successfully!');
    console.log('You can now login with:');
    console.log('  Admin:    admin@gmail.com / admin1234');
    console.log('  Student:  student@gmail.com / student1234');
    console.log('  Teacher:  teacher@gmail.com / teacher1234');
    console.log('  Staff:    staff@gmail.com / staff1234');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers;
