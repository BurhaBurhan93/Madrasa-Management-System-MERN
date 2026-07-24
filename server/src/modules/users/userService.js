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
      const { skipProfile, ...userDataForUser } = userData;

      // Strip empty enum fields that would cause Mongoose validation errors
      if (!userDataForUser.bloodType) delete userDataForUser.bloodType;
      if (!userDataForUser.idNumber) delete userDataForUser.idNumber;

      const existingUser = await User.findOne({ email: userDataForUser.email });
      if (existingUser) throw new Error('Email already exists');

      const hashedPassword = await bcrypt.hash(userDataForUser.password, 10);
      const user = await User.create({ ...userDataForUser, password: hashedPassword });

      if (skipProfile) return user;

      // Create related record based on role
      if (user.role === 'student') {
        await Student.create({
          user: user._id,
          studentCode: userData.studentCode || `STU${Date.now()}`,
          firstName: user.name?.split(' ')[0] || user.name,
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone,
          status: 'active'
        });
      } else if (user.role === 'teacher' || user.role === 'staff') {
        await Employee.create({
          user: user._id,
          employeeCode: userData.employeeCode || `EMP${Date.now()}`,
          fullName: user.name,
          gender: userData.gender || 'male',
          phoneNumber: user.phone || 'N/A',
          email: user.email,
          employeeType: user.role === 'teacher' ? 'teacher' : (userData.employeeType || 'support'),
          joiningDate: userData.joiningDate || new Date(),
          baseSalary: userData.baseSalary || 0,
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
