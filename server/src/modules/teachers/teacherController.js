const Student = require('../../models/Student');
const Subject = require('../../models/Subject');
const Class = require('../../models/Class');
const Assignment = require('../../models/Assignment');
const Exam = require('../../models/Exam');
const AttendanceSession = require('../../models/AttendanceSession');
const AttendanceRecord = require('../../models/AttendanceRecord');
const FinalResult = require('../../models/FinalResult');
const Complaint = require('../../models/Complaint');
const Leave = require('../../models/Leave');
const LeaveType = require('../../models/LeaveType');
const SalaryPayment = require('../../models/SalaryPayment');
const Employee = require('../../models/Employee');

// ==================== DASHBOARD ====================
exports.getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const [totalStudents, totalSubjects, totalClasses, pendingAssignments, mySessions] = await Promise.all([
      Student.countDocuments({ status: 'active', deletedAt: null }),
      Subject.countDocuments({ deletedAt: null }),
      Class.countDocuments(),
      Assignment.countDocuments({ status: 'active' }),
      AttendanceSession.countDocuments({ teacher: teacherId })
    ]);
    res.json({ success: true, data: { totalStudents, totalSubjects, totalClasses, pendingAssignments, mySessions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENTS ====================
exports.getStudents = async (req, res) => {
  try {
    const { search, classId } = req.query;
    let query = { status: 'active', deletedAt: null };
    if (classId) query.currentClass = classId;
    let students = await Student.find(query)
      .populate('user', 'name email phone')
      .populate('currentClass', 'name section');
    if (search) {
      students = students.filter(s =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentCode?.toLowerCase().includes(search.toLowerCase())
      );
    }
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUBJECTS ====================
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ deletedAt: null });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CLASSES ====================
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ATTENDANCE ====================
exports.getSessions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { date, classId } = req.query;
    let query = { teacher: teacherId };
    if (classId) query.class = classId;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.sessionDate = { $gte: start, $lte: end };
    }
    const sessions = await AttendanceSession.find(query)
      .populate('class', 'name section')
      .sort({ sessionDate: -1 });
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const session = await AttendanceSession.create({ ...req.body, teacher: req.user.id });
    res.status(201).json({ success: true, message: 'Session created', data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, records } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter: { session: sessionId, student: r.student },
        update: { $set: { ...r, session: sessionId, markedBy: req.user.id, markedAt: new Date() } },
        upsert: true
      }
    }));
    await AttendanceRecord.bulkWrite(ops);
    res.json({ success: true, message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceBySession = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ session: req.params.sessionId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, month, year } = req.query;
    const sessionQuery = { teacher: teacherId };
    if (classId) sessionQuery.class = classId;
    if (month && year) {
      sessionQuery.sessionDate = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }
    const sessions = await AttendanceSession.find(sessionQuery).select('_id');
    const sessionIds = sessions.map(s => s._id);
    const summary = await AttendanceRecord.aggregate([
      { $match: { session: { $in: sessionIds } } },
      { $group: { _id: { student: '$student', status: '$status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.student', statuses: { $push: { status: '$_id.status', count: '$count' } } } },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $lookup: { from: 'users', localField: 'student.user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.name': 1, 'student.studentCode': 1, statuses: 1 } }
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ASSIGNMENTS ====================
exports.getAssignments = async (req, res) => {
  try {
    const { status, courseId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    const assignments = await Assignment.find(query)
      .populate('courseId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, message: 'Assignment created successfully', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment updated', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXAMS ====================
exports.getExams = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const exams = await Exam.find(query).populate('examType', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MARKS / RESULTS ====================
exports.getResults = async (req, res) => {
  try {
    const { examId, classId, subjectId } = req.query;
    let query = {};
    if (examId) query.exam = examId;
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    const results = await FinalResult.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('exam', 'title')
      .populate('subject', 'name')
      .populate('class', 'name section');
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveMarks = async (req, res) => {
  try {
    const { examId, subjectId, classId, marks } = req.body;
    const ops = marks.map(m => {
      const percentage = (m.totalScore / (m.totalMarks || 100)) * 100;
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
      const status = percentage >= 50 ? 'pass' : 'fail';
      return {
        updateOne: {
          filter: { student: m.student, exam: examId, subject: subjectId },
          update: { $set: { student: m.student, exam: examId, subject: subjectId, class: classId, totalScore: m.totalScore, grade, status } },
          upsert: true
        }
      };
    });
    await FinalResult.bulkWrite(ops);
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COMPLAINTS ====================
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { complaintStatus: status, ...(status === 'closed' ? { closedAt: new Date() } : {}) },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint updated', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LEAVE ====================
exports.getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ status: 'active' });
    res.json({ success: true, data: leaveTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee record not found' });
    const leaves = await Leave.find({ employee: employee._id })
      .populate('leaveType', 'leaveTypeName leaveCode')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee record not found' });
    const leave = await Leave.create({ ...req.body, employee: employee._id });
    res.status(201).json({ success: true, message: 'Leave application submitted', data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==================== PAYSLIP ====================
exports.getMyPayslips = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee record not found' });
    const payslips = await SalaryPayment.find({ employee: employee._id })
      .sort({ salaryYear: -1, salaryMonth: -1 });
    res.json({ success: true, count: payslips.length, data: payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
