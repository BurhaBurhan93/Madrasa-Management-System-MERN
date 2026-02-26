const User = require('../../models/User');
const Student = require('../../models/Student');
const Employee = require('../../models/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login user
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify role matches
    if (user.role !== role) {
      return res.status(403).json({ message: `Access denied. You are not registered as ${role}.` });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Get additional profile info based on role
    let profile = {};
    if (role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = {
          studentId: student.studentId,
          enrollmentDate: student.enrollmentDate,
          status: student.status
        };
      }
    } else if (role === 'teacher' || role === 'staff') {
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        profile = {
          employeeId: employee.employeeId,
          department: employee.department,
          designation: employee.designation,
          joinDate: employee.joinDate
        };
      }
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register user (for testing purposes)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Create role-specific profile
    if (role === 'student') {
      const studentCount = await Student.countDocuments();
      await Student.create({
        userId: user._id,
        studentId: `STU${2024000 + studentCount + 1}`,
        enrollmentDate: new Date(),
        status: 'active'
      });
    } else if (role === 'teacher' || role === 'staff') {
      const empCount = await Employee.countDocuments();
      await Employee.create({
        userId: user._id,
        employeeId: `EMP${2024000 + empCount + 1}`,
        department: 'General',
        designation: role === 'teacher' ? 'Teacher' : 'Staff',
        joinDate: new Date(),
        status: 'active'
      });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = { studentId: student.studentId, status: student.status };
      }
    } else if (user.role === 'teacher' || user.role === 'staff') {
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        profile = { employeeId: employee.employeeId, department: employee.department };
      }
    }

    res.json({
      user: {
        ...user.toObject(),
        ...profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  getMe
};
