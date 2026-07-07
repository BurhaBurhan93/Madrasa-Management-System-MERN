const Department = require("../../models/Department");
const Designation = require("../../models/Designation");
const LeaveType = require("../../models/LeaveType");
const Leave = require("../../models/Leave");
const Employee = require("../../models/Employee");
const EmployeeAttendance = require("../../models/EmployeeAttendance");
const AttendanceSetting = require("../../models/AttendanceSetting");
const AttendanceWarning = require("../../models/AttendanceWarning");
const AttendanceCorrection = require("../../models/AttendanceCorrection");
const User = require("../../models/User");
const notificationService = require("../notifications/notificationService");
const { getDateRangeFromQuery } = require("../../utils/reportDateRange");

// ==================== DEPARTMENT CONTROLLERS ====================

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { departmentName: regex },
        { departmentCode: regex },
        { headOfDepartment: regex },
        { description: regex },
      ];
    }

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate("departmentHead", "fullName employeeCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Department.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: departments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: error.message,
    });
  }
};

// Get single department
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "departmentHead",
      "fullName employeeCode phoneNumber email",
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching department",
      error: error.message,
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
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating department",
      error: error.message,
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.departmentHead) delete data.departmentHead;
    const department = await Department.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating department",
      error: error.message,
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
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting department",
      error: error.message,
    });
  }
};

// ==================== DESIGNATION CONTROLLERS ====================

// Get all designations
exports.getAllDesignations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { designationTitle: regex },
        { jobLevel: regex },
        { minQualification: regex },
      ];
    }

    const [designations, total] = await Promise.all([
      Designation.find(filter)
        .populate("department", "departmentName departmentCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Designation.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: designations.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: designations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching designations",
      error: error.message,
    });
  }
};

// Get designations by department
exports.getDesignationsByDepartment = async (req, res) => {
  try {
    const designations = await Designation.find({
      department: req.params.departmentId,
    }).populate("department", "departmentName");

    res.status(200).json({
      success: true,
      count: designations.length,
      data: designations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching designations",
      error: error.message,
    });
  }
};

// Get single designation
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id).populate(
      "department",
      "departmentName departmentCode",
    );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching designation",
      error: error.message,
    });
  }
};

// Create designation
exports.createDesignation = async (req, res) => {
  try {
    const designation = await Designation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating designation",
      error: error.message,
    });
  }
};

// Update designation
exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: designation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating designation",
      error: error.message,
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
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting designation",
      error: error.message,
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
      data: leaveTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave types",
      error: error.message,
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
        message: "Leave type not found",
      });
    }

    res.status(200).json({
      success: true,
      data: leaveType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave type",
      error: error.message,
    });
  }
};

// Create leave type
exports.createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create(req.body);

    res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: leaveType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating leave type",
      error: error.message,
    });
  }
};

// Update leave type
exports.updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave type updated successfully",
      data: leaveType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating leave type",
      error: error.message,
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
        message: "Leave type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting leave type",
      error: error.message,
    });
  }
};

// ==================== EMPLOYEE CONTROLLERS ====================

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { status, department, employeeType, employmentType, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (employeeType) filter.employeeType = employeeType;
    if (employmentType) filter.employmentType = employmentType;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { fullName: regex },
        { employeeCode: regex },
        { email: regex },
      ];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate("department", "departmentName")
        .populate("designation", "designationTitle")
        .populate("reportingManager", "fullName employeeCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("user", "username email role")
      .populate("department", "departmentName departmentCode")
      .populate("designation", "designationTitle jobLevel")
      .populate("reportingManager", "fullName employeeCode phoneNumber");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    // Generate employee code if not provided
    if (!req.body.employeeCode) {
      const count = await Employee.countDocuments();
      req.body.employeeCode = `EMP${String(count + 1).padStart(5, "0")}`;
    }
    const data = { ...req.body };
    data.user = req.user.id;
    if (!data.department) delete data.department;
    if (!data.designation) delete data.designation;
    if (!data.reportingManager) delete data.reportingManager;
    if (!data.dateOfBirth) delete data.dateOfBirth;

    // Ensure required fields have defaults
    if (!data.gender) data.gender = "male";
    if (!data.phoneNumber) data.phoneNumber = data.phone || "N/A";
    if (!data.joiningDate) data.joiningDate = new Date();
    if (
      data.baseSalary === undefined ||
      data.baseSalary === null ||
      data.baseSalary === ""
    )
      data.baseSalary = 0;

    const employee = await Employee.create(data);

    // Fire notification asynchronously
    notificationService.onEmployeeRegistered(employee).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
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
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};

// ==================== LEAVE CONTROLLERS ====================

exports.getAllLeaves = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { status, employee, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (employee) filter.employee = employee;
    if (search) {
      filter.$or = [{ leaveReason: { $regex: search, $options: "i" } }];
    }

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate("employee", "fullName employeeCode")
        .populate("leaveType", "leaveTypeName leaveCode")
        .populate("approvedBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, count: leaves.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: leaves });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching leaves",
        error: error.message,
      });
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employee", "fullName employeeCode")
      .populate("leaveType", "leaveTypeName leaveCode")
      .populate("approvedBy", "fullName");
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching leave",
        error: error.message,
      });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: "Leave request created successfully",
        data: leave,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Error creating leave",
        error: error.message,
      });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.body.approvedBy },
      { new: true },
    )
      .populate("employee", "fullName")
      .populate("leaveType", "leaveTypeName");
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Leave approved successfully",
        data: leave,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error approving leave",
        error: error.message,
      });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: req.body.rejectionReason },
      { new: true },
    )
      .populate("employee", "fullName")
      .populate("leaveType", "leaveTypeName");
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    res
      .status(200)
      .json({ success: true, message: "Leave rejected", data: leave });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error rejecting leave",
        error: error.message,
      });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("employee", "fullName employeeCode")
      .populate("leaveType", "leaveTypeName leaveCode");
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Leave updated successfully",
        data: leave,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Error updating leave",
        error: error.message,
      });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    res
      .status(200)
      .json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting leave",
      error: error.message,
    });
  }
};

// ==================== ATTENDANCE WARNING CONTROLLERS ====================

exports.getAttendanceWarnings = async (req, res) => {
  try {
    const warnings = await AttendanceWarning.find()
      .populate({ path: 'student', select: 'firstName lastName studentCode currentClass', populate: { path: 'currentClass', select: 'className' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: warnings.length, data: warnings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching warnings", error: error.message });
  }
};

exports.dismissAttendanceWarning = async (req, res) => {
  try {
    const warning = await AttendanceWarning.findByIdAndUpdate(
      req.params.id,
      { status: 'dismissed' },
      { new: true },
    );
    if (!warning) return res.status(404).json({ success: false, message: "Warning not found" });
    res.status(200).json({ success: true, message: "Warning dismissed", data: warning });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error dismissing warning", error: error.message });
  }
};

exports.notifyAttendanceWarning = async (req, res) => {
  try {
    const warning = await AttendanceWarning.findByIdAndUpdate(
      req.params.id,
      { status: 'notified' },
      { new: true },
    );
    if (!warning) return res.status(404).json({ success: false, message: "Warning not found" });
    res.status(200).json({ success: true, message: "Warning notice sent", data: warning });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error notifying warning", error: error.message });
  }
};

// ==================== ATTENDANCE SETTINGS CONTROLLERS ====================

exports.getAttendanceSettings = async (req, res) => {
  try {
    let settings = await AttendanceSetting.findOne({ key: 'default' });
    if (!settings) {
      settings = await AttendanceSetting.create({ key: 'default' });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attendance settings", error: error.message });
  }
};

exports.updateAttendanceSettings = async (req, res) => {
  try {
    const allowed = [
      'workingDays', 'schoolStartTime', 'schoolEndTime',
      'lateThreshold', 'absenceThreshold', 'autoNotification',
      'notificationEmail', 'hrEmail', 'adminEmails',
      'periodDuration', 'breakDuration', 'allowManualOverride', 'requireApproval',
    ];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const settings = await AttendanceSetting.findOneAndUpdate(
      { key: 'default' },
      { $set: update },
      { new: true, upsert: true, runValidators: true },
    );
    res.status(200).json({ success: true, message: "Attendance settings saved", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving attendance settings", error: error.message });
  }
};

// ==================== EMPLOYEE ATTENDANCE CONTROLLERS ====================

exports.markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const markedBy = req.user?.id;
    const ops = records.map((r) => ({
      updateOne: {
        filter: { employee: r.employee, date: new Date(date) },
        update: { $set: { ...r, date: new Date(date), markedBy } },
        upsert: true,
      },
    }));
    await EmployeeAttendance.bulkWrite(ops);
    res
      .status(200)
      .json({ success: true, message: "Attendance marked successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error marking attendance",
        error: error.message,
      });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { startDate, endDate, status, employee } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    if (employee) filter.employee = employee;
    const [records, total] = await Promise.all([
      EmployeeAttendance.find(filter)
        .populate("employee", "fullName employeeCode department")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      EmployeeAttendance.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, count: records.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attendance", error: error.message });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const records = await EmployeeAttendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate("employee", "fullName employeeCode department")
      .populate("markedBy", "name");
    res
      .status(200)
      .json({ success: true, count: records.length, data: records });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching attendance",
        error: error.message,
      });
  }
};

exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    let query = { employee: employeeId };
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    }
    const records = await EmployeeAttendance.find(query).sort({ date: -1 });
    res
      .status(200)
      .json({ success: true, count: records.length, data: records });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching attendance",
        error: error.message,
      });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { start, end } = getDateRangeFromQuery(req.query, {
      defaultPeriod: "monthly",
    });
    const summary = await EmployeeAttendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { employee: "$employee", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.employee",
          statuses: { $push: { status: "$_id.status", count: "$count" } },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $project: {
          "employee.fullName": 1,
          "employee.employeeCode": 1,
          statuses: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching summary",
        error: error.message,
      });
  }
};

// Get employee statistics
exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "active" });
    const inactiveEmployees = await Employee.countDocuments({
      status: "inactive",
    });

    const employeesByType = await Employee.aggregate([
      { $group: { _id: "$employeeType", count: { $sum: 1 } } },
    ]);

    const employeesByDepartment = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "dept",
        },
      },
      { $unwind: "$dept" },
      { $project: { departmentName: "$dept.departmentName", count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByType,
        employeesByDepartment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee statistics",
      error: error.message,
    });
  }
};

// ==================== ATTENDANCE CORRECTIONS CONTROLLERS ====================

exports.getAttendanceCorrections = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;

    const corrections = await AttendanceCorrection.find(filter)
      .populate({ path: 'employee', select: 'fullName employeeCode department designation', populate: [
        { path: 'department', select: 'departmentName' },
        { path: 'designation', select: 'designationTitle' },
      ]})
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: corrections.length, data: corrections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching corrections", error: error.message });
  }
};

exports.createAttendanceCorrection = async (req, res) => {
  try {
    const { employee, date, newStatus, correctionReason } = req.body;
    if (!employee || !date || !newStatus || !correctionReason) {
      return res.status(400).json({ success: false, message: "employee, date, newStatus, and correctionReason are required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }
    const record = await EmployeeAttendance.findOne({ employee, date: parsedDate });
    const oldStatus = record ? record.status : undefined;

    const correctionData = { employee, date, oldStatus, newStatus, correctionReason };
    if (req.user && req.user.id) correctionData.correctedBy = req.user.id;
    const correction = await AttendanceCorrection.create(correctionData);

    const populated = await correction.populate({ path: 'employee', select: 'fullName employeeCode department designation', populate: [
      { path: 'department', select: 'departmentName' },
      { path: 'designation', select: 'designationTitle' },
    ]});

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Create correction error:", error);
    res.status(500).json({ success: false, message: "Error creating correction", error: error.message, stack: error.stack });
  }
};

exports.approveAttendanceCorrection = async (req, res) => {
  try {
    const correction = await AttendanceCorrection.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true },
    );
    if (!correction) return res.status(404).json({ success: false, message: "Correction not found" });

    if (correction.newStatus) {
      await EmployeeAttendance.findOneAndUpdate(
        { employee: correction.employee, date: correction.date },
        { status: correction.newStatus },
      );
    }

    res.status(200).json({ success: true, message: "Correction approved", data: correction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving correction", error: error.message });
  }
};

exports.rejectAttendanceCorrection = async (req, res) => {
  try {
    const correction = await AttendanceCorrection.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true },
    );
    if (!correction) return res.status(404).json({ success: false, message: "Correction not found" });
    res.status(200).json({ success: true, message: "Correction rejected", data: correction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting correction", error: error.message });
  }
};
