const User = require('../../models/User');
const Student = require('../../models/Student');
const Employee = require('../../models/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET || 'madrasa-dev-secret';
const DEMO_ACCOUNTS = {
  admin: { email: 'admin@gmail.com', password: 'admin1234' },
  student: { email: 'student@gmail.com', password: 'student1234' },
  teacher: { email: 'teacher@gmail.com', password: 'teacher1234' },
  staff: { email: 'staff@gmail.com', password: 'staff1234' }
};

const STAFF_MODULES_BY_EMPLOYEE_TYPE = {
  admin: ['dashboard', 'profile', 'registrar', 'students', 'inventory', 'library', 'complaints', 'finance', 'payroll', 'kitchen', 'hr', 'support'],
  'general-manager': ['dashboard', 'profile', 'registrar', 'students', 'inventory', 'library', 'complaints', 'finance', 'payroll', 'kitchen', 'hr', 'support'],
  support: ['dashboard', 'profile', 'support', 'students', 'inventory', 'complaints'],
  finance: ['dashboard', 'profile', 'finance'],
  registrar: ['dashboard', 'profile', 'registrar'],
  hr: ['dashboard', 'profile', 'hr'],
  librarian: ['dashboard', 'profile', 'library'],
  kitchen: ['dashboard', 'profile', 'kitchen'],
  payroll: ['dashboard', 'profile', 'payroll'],
  complaints: ['dashboard', 'profile', 'complaints'],
  inventory: ['dashboard', 'profile', 'inventory'],
  maintenance: ['dashboard', 'profile', 'inventory', 'complaints'],
  security: ['dashboard', 'profile', 'students', 'complaints'],
};

const getPermissionNames = (user) => {
  const permissions = [];
  for (const role of user.roles || []) {
    for (const permission of role.permissions || []) {
      if (permission?.name) permissions.push(permission.name);
    }
  }
  return [...new Set(permissions)];
};

const getStaffRoleType = (user) => {
  const roleNames = (user.roles || [])
    .map((role) => String(role?.name || '').trim().toLowerCase());

  if (roleNames.some((name) => name === 'general manager' || name === 'general-manager')) {
    return 'general-manager';
  }
  if (roleNames.some((name) => name.includes('payroll'))) return 'payroll';
  if (roleNames.some((name) => name.includes('finance'))) return 'finance';
  if (roleNames.some((name) => name.includes('registrar'))) return 'registrar';
  if (roleNames.some((name) => name.includes('support'))) return 'support';
  if (roleNames.some((name) => name.includes('library'))) return 'librarian';
  if (roleNames.some((name) => name.includes('kitchen'))) return 'kitchen';
  if (roleNames.some((name) => name.includes('inventory'))) return 'inventory';
  if (roleNames.some((name) => name.includes('complaint'))) return 'complaints';
  if (roleNames.some((name) => name === 'hr staff' || name.includes('human resources'))) return 'hr';
  return null;
};

const getStaffModules = (user, employee) => {
  if (user.role === 'admin') return STAFF_MODULES_BY_EMPLOYEE_TYPE.admin;
  if (user.role !== 'staff') return [];

  const employeeType = String(employee?.employeeType || '').trim().toLowerCase();
  const designation = String(
    employee?.designation?.designationTitle || employee?.designation || ''
  ).trim().toLowerCase();
  const accountName = String(user.name || '').trim().toLowerCase();
  const staffRoleType = getStaffRoleType(user);

  // General Manager is a full staff workspace role.  It must take precedence
  // over any leftover department permission (for example, Complaints Staff).
  if (
    employeeType === 'general-manager' ||
    employeeType === 'general manager' ||
    designation === 'general-manager' ||
    designation === 'general manager' ||
    accountName === 'general-manager' ||
    accountName === 'general manager' ||
    staffRoleType === 'general-manager'
  ) {
    return STAFF_MODULES_BY_EMPLOYEE_TYPE['general-manager'];
  }

  // Role permissions are assigned specifically to the staff account.  Prefer
  // them over an employee record so an old/mistyped employeeType cannot turn a
  // Payroll Staff account into a Finance Staff account.
  const permissionNames = getPermissionNames(user);
  const modulePermissions = permissionNames
    .filter((name) => name.startsWith('staff:'))
    .map((name) => name.split(':')[1])
    .filter(Boolean);

  if (modulePermissions.length) {
    return [...new Set(['dashboard', 'profile', ...modulePermissions])];
  }

  if (staffRoleType) return STAFF_MODULES_BY_EMPLOYEE_TYPE[staffRoleType];

  const employeeTypeModules = STAFF_MODULES_BY_EMPLOYEE_TYPE[employeeType];
  if (employeeTypeModules) {
    return employeeTypeModules;
  }

  return STAFF_MODULES_BY_EMPLOYEE_TYPE.support;
};

const buildAuthUser = (user, profile = {}, staffModules = []) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image || null,
  phone: user.phone || null,
  permissions: getPermissionNames(user),
  staffRoleNames: (user.roles || []).map((role) => role.name).filter(Boolean),
  staffModules,
  ...profile
});

const createToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const getRoleProfile = async (user) => {
  let profile = {};
  let employee = null;

  if (user.role === 'student') {
    const student = await Student.findOne({ $or: [{ user: user._id }, { userId: user._id }] });
    if (student) {
      profile = {
        studentId: student.studentCode || student.studentId,
        enrollmentDate: student.admissionDate || student.enrollmentDate,
        status: student.status
      };
    }
  } else if (user.role === 'teacher' || user.role === 'staff') {
    employee = await Employee.findOne({ $or: [{ user: user._id }, { userId: user._id }] })
      .populate('department', 'departmentName departmentCode')
      .populate('designation', 'designationTitle');
    if (employee) {
      profile = {
        employeeId: employee.employeeCode || employee.employeeId,
        employeeType: employee.employeeType,
        department: employee.department?.departmentName || employee.department,
        designation: employee.designation?.designationTitle || employee.designation,
        joinDate: employee.joiningDate || employee.joinDate,
        photo: employee.photo || null,
        phoneNumber: employee.phoneNumber || null,
        currentAddress: employee.currentAddress || null,
        fullName: employee.fullName || null
      };
    }
  }

  return { profile, employee };
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Sanitize inputs using validator
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedRole = role ? validator.trim(role) : undefined;

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail }).populate({
      path: 'roles',
      populate: { path: 'permissions', select: 'name description' }
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify role matches (only if role was provided)
    if (sanitizedRole && user.role !== sanitizedRole) {
      return res.status(403).json({ success: false, message: `Access denied. You are not registered as ${sanitizedRole}.` });
    }

    // Generate JWT token
    const token = createToken(user);

    // Set HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
    });

    const { profile, employee } = await getRoleProfile(user);
    const staffModules = getStaffModules(user, employee);

    res.json({
      success: true,
      token,
      user: buildAuthUser(user, profile, staffModules)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Demo login uses the real database demo accounts so protected APIs get a real user id.
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const demoAccount = DEMO_ACCOUNTS[role];

    if (!demoAccount) {
      return res.status(400).json({ success: false, message: 'Invalid demo role' });
    }

    const user = await User.findOne({ email: demoAccount.email }).populate({
      path: 'roles',
      populate: { path: 'permissions', select: 'name description' }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo ${role} account was not found. Run npm run seed:accounts in the server folder.`
      });
    }

    const isMatch = await bcrypt.compare(demoAccount.password, user.password);
    if (!isMatch || user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Demo ${role} account exists but its email, password, or role does not match the expected seed data.`
      });
    }

    const token = createToken(user);

    // Set HTTP-only cookie for demo login too
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
    });

    const { profile, employee } = await getRoleProfile(user);
    const staffModules = getStaffModules(user, employee);

    res.json({
      success: true,
      token,
      user: buildAuthUser(user, profile, staffModules)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout user
const logout = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// Register user (for testing purposes)
const register = async (req, res) => {
  try {
    const { name, email, password, role, employeeType } = req.body;

    // Sanitize inputs
    const sanitizedName = validator.trim(name);
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedRole = validator.trim(role);

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: sanitizedRole
    });

    await user.save();

    // Create role-specific profile
    if (sanitizedRole === 'student') {
      const studentCount = await Student.countDocuments();
      await Student.create({
        user: user._id,
        firstName: sanitizedName,
        email: sanitizedEmail,
        studentCode: `STU${2024000 + studentCount + 1}`,
        admissionDate: new Date(),
        status: 'active'
      });
    } else if (sanitizedRole === 'teacher' || sanitizedRole === 'staff') {
      const empCount = await Employee.countDocuments();
      await Employee.create({
        user: user._id,
        employeeCode: `EMP${2024000 + empCount + 1}`,
        fullName: sanitizedName,
        gender: 'male',
        phoneNumber: 'N/A',
        email: sanitizedEmail,
        employeeType: sanitizedRole === 'teacher' ? 'teacher' : (employeeType || 'support'),
        joiningDate: new Date(),
        baseSalary: 0,
        status: 'active'
      });
    }

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate({
      path: 'roles',
      populate: { path: 'permissions', select: 'name description' }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { profile, employee } = await getRoleProfile(user);

    res.json({
      user: buildAuthUser(user, profile, getStaffModules(user, employee))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  demoLogin,
  login,
  register,
  logout,
  getMe
};
