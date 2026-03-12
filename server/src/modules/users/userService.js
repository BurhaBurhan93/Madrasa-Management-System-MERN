const User = require('../../models/User');
const Student = require('../../models/Student');
const Employee = require('../../models/Employee');
const bcrypt = require('bcryptjs');

class UserService {
  async getAllUsers(filters = {}) {
    const query = { deletedAt: null };
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
    
    return await User.find(query).select('-password').sort({ createdAt: -1 });
  }

  async getUserById(id) {
    return await User.findById(id).select('-password');
  }

  async createUser(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) throw new Error('Email already exists');

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({ ...userData, password: hashedPassword });

      // Create related record based on role
      if (user.role === 'student') {
        await Student.create({
          user: user._id,
          studentCode: userData.studentCode || `STU${Date.now()}`,
          status: 'active'
        });
      } else if (user.role === 'teacher' || user.role === 'staff') {
        await Employee.create({
          user: user._id,
          employeeCode: userData.employeeCode || `EMP${Date.now()}`,
          fullName: user.name,
          employeeType: user.role === 'teacher' ? 'teacher' : 'support',
          status: 'active'
        });
      }

      return user;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
  }

  async deleteUser(id) {
    return await User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }
}

module.exports = new UserService();
