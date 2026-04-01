const Department = require('../../models/Department');
const Designation = require('../../models/Designation');
const LeaveType = require('../../models/LeaveType');
const Leave = require('../../models/Leave');
const Employee = require('../../models/Employee');
const EmployeeAttendance = require('../../models/EmployeeAttendance');
const User = require('../../models/User');

// ==================== DEPARTMENT CONTROLLERS ====================

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('departmentHead', 'fullName employeeCode')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

// Get single department
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('departmentHead', 'fullName employeeCode phoneNumber email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.departmentHead) delete data.departmentHead;
    const department = await Department.create(data);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.departmentHead) delete data.departmentHead;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

// ==================== DESIGNATION CONTROLLERS ====================

// Get all designations
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find()
      .populate('department', 'departmentName departmentCode')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: designations.length,
      data: designations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching designations',
      error: error.message
    });
  }
};

// Get designations by department
exports.getDesignationsByDepartment = async (req, res) => {
  try {
    const designations = await Designation.find({ department: req.params.departmentId })
      .populate('department', 'departmentName');
    
    res.status(200).json({
      success: true,
      count: designations.length,
      data: designations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching designations',
      error: error.message
    });
  }
};

// Get single designation
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id)
      .populate('department', 'departmentName departmentCode');
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: designation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching designation',
      error: error.message
    });
  }
};

// Create designation
exports.createDesignation = async (req, res) => {
  try {
    const designation = await Designation.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Designation created successfully',
      data: designation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating designation',
      error: error.message
    });
  }
};

// Update designation
exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Designation updated successfully',
      data: designation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating designation',
      error: error.message
    });
  }
};

// Delete designation
exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Designation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting designation',
      error: error.message
    });
  }
};

// ==================== LEAVE TYPE CONTROLLERS ====================

// Get all leave types
exports.getAllLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: leaveTypes.length,
      data: leaveTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave types',
      error: error.message
    });
  }
};

// Get single leave type
exports.getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: leaveType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave type',
      error: error.message
    });
  }
};

// Create leave type
exports.createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      data: leaveType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating leave type',
      error: error.message
    });
  }
};

// Update leave type
exports.updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave type updated successfully',
      data: leaveType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating leave type',
      error: error.message
    });
  }
};

// Delete leave type
exports.deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting leave type',
      error: error.message
    });
  }
};

// ==================== EMPLOYEE CONTROLLERS ====================

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { status, department, employeeType, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (employeeType) query.employeeType = employeeType;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const employees = await Employee.find(query)
      .populate('department', 'departmentName')
      .populate('designation', 'designationTitle')
      .populate('reportingManager', 'fullName employeeCode')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'username email role')
      .populate('department', 'departmentName departmentCode')
      .populate('designation', 'designationTitle jobLevel')
      .populate('reportingManager', 'fullName employeeCode phoneNumber');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    // Generate employee code if not provided
    if (!req.body.employeeCode) {
      const count = await Employee.countDocuments();
      req.body.employeeCode = `EMP${String(count + 1).padStart(5, '0')}`;
    }
    const data = { ...req.body };
    if (!data.department) delete data.department;
    if (!data.designation) delete data.designation;
    if (!data.reportingManager) delete data.reportingManager;
    if (!data.dateOfBirth) delete data.dateOfBirth;
    
    const employee = await Employee.create(data);
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};

// ==================== LEAVE CONTROLLERS ====================

exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employee } = req.query;
    let query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;
    const leaves = await Leave.find(query)
      .populate('employee', 'fullName employeeCode')
      .populate('leaveType', 'leaveTypeName leaveCode')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaves', error: error.message });
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'fullName employeeCode')
      .populate('leaveType', 'leaveTypeName leaveCode')
      .populate('approvedBy', 'fullName');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leave', error: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json({ success: true, message: 'Leave request created successfully', data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating leave', error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.body.approvedBy },
      { new: true }
    ).populate('employee', 'fullName').populate('leaveType', 'leaveTypeName');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, message: 'Leave approved successfully', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving leave', error: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: req.body.rejectionReason },
      { new: true }
    ).populate('employee', 'fullName').populate('leaveType', 'leaveTypeName');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, message: 'Leave rejected', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting leave', error: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting leave', error: error.message });
  }
};

// ==================== EMPLOYEE ATTENDANCE CONTROLLERS ====================

exports.markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const markedBy = req.user?.id;
    const ops = records.map(r => ({
      updateOne: {
        filter: { employee: r.employee, date: new Date(date) },
        update: { $set: { ...r, date: new Date(date), markedBy } },
        upsert: true
      }
    }));
    await EmployeeAttendance.bulkWrite(ops);
    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking attendance', error: error.message });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    const records = await EmployeeAttendance.find({ date: { $gte: start, $lte: end } })
      .populate('employee', 'fullName employeeCode department')
      .populate('markedBy', 'name');
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching attendance', error: error.message });
  }
};

exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    let query = { employee: employeeId };
    if (month && year) {
      query.date = { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0, 23, 59, 59) };
    }
    const records = await EmployeeAttendance.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching attendance', error: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const summary = await EmployeeAttendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: { employee: '$employee', status: '$status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.employee', statuses: { $push: { status: '$_id.status', count: '$count' } } } },
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
      { $unwind: '$employee' },
      { $project: { 'employee.fullName': 1, 'employee.employeeCode': 1, statuses: 1 } }
    ]);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching summary', error: error.message });
  }
};

// Get employee statistics
exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });
    
    const employeesByType = await Employee.aggregate([
      { $group: { _id: '$employeeType', count: { $sum: 1 } } }
    ]);
    
    const employeesByDepartment = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { departmentName: '$dept.departmentName', count: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByType,
        employeesByDepartment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee statistics',
      error: error.message
    });
  }
};
