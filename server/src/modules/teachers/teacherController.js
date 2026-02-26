const Student = require('../../models/Student');
const Subject = require('../../models/Subject');
const Class = require('../../models/Class');
const Assignment = require('../../models/Assignment');
const Exam = require('../../models/Exam');
const AttendanceRecord = require('../../models/AttendanceRecord');

// Get teacher dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalSubjects = await Subject.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments();
    const pendingAssignments = await Assignment.countDocuments({ status: 'active' });

    res.json({
      totalStudents,
      totalSubjects,
      totalClasses,
      pendingAssignments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
