const Guardian = require('../models/Guardian');
const StudentEducation = require('../models/StudentEducation');
const UserDocument = require('../models/UserDocument');
const AuditLog = require('../models/AuditLog');
const Student = require('../models/Student');
const Class = require('../models/Class');

// ================= GUARDIAN MANAGEMENT =================

// Get all guardians
const getAllGuardians = async (req, res) => {
  try {
    const guardians = await Guardian.find({ deletedAt: null })
      .populate('student', 'firstName lastName studentCode')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: guardians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create guardian
const createGuardian = async (req, res) => {
  try {
    const guardianData = { ...req.body, isPrimary: req.body.isPrimary === 'true' };
    const guardian = new Guardian(guardianData);
    await guardian.save();
    
    res.status(201).json({ success: true, data: guardian });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update guardian
const updateGuardian = async (req, res) => {
  try {
    const guardianData = { ...req.body, isPrimary: req.body.isPrimary === 'true' };
    const guardian = await Guardian.findByIdAndUpdate(
      req.params.id,
      guardianData,
      { new: true, runValidators: true }
    );
    
    if (!guardian) {
      return res.status(404).json({ success: false, message: 'Guardian not found' });
    }
    
    res.json({ success: true, data: guardian });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete guardian (soft delete)
const deleteGuardian = async (req, res) => {
  try {
    const guardian = await Guardian.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!guardian) {
      return res.status(404).json({ success: false, message: 'Guardian not found' });
    }
    
    res.json({ success: true, message: 'Guardian deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= EDUCATION HISTORY =================

// Get all education records
const getAllEducation = async (req, res) => {
  try {
    const education = await StudentEducation.find({ deletedAt: null })
      .populate('student', 'firstName lastName studentCode')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create education record
const createEducation = async (req, res) => {
  try {
    const education = new StudentEducation(req.body);
    await education.save();
    
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update education record
const updateEducation = async (req, res) => {
  try {
    const education = await StudentEducation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education record not found' });
    }
    
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete education record
const deleteEducation = async (req, res) => {
  try {
    const education = await StudentEducation.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education record not found' });
    }
    
    res.json({ success: true, message: 'Education record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DOCUMENTS MANAGEMENT =================

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await UserDocument.find({ deletedAt: null })
      .populate('student', 'firstName lastName studentCode')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create document (with file upload handling)
const createDocument = async (req, res) => {
  try {
    // Note: File upload should be handled by multer middleware
    const documentData = {
      ...req.body,
      filePath: req.file?.path || req.body.filePath
    };
    
    const document = new UserDocument(documentData);
    await document.save();
    
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const document = await UserDocument.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete document (soft delete)
const deleteDocument = async (req, res) => {
  try {
    const document = await UserDocument.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CLASS ASSIGNMENT & TRANSFER =================

// Transfer student to new class
const transferStudent = async (req, res) => {
  try {
    const { newClass } = req.body;
    
    if (!newClass) {
      return res.status(400).json({ success: false, message: 'New class is required' });
    }
    
    // Verify class exists
    const classExists = await Class.findById(newClass);
    if (!classExists) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const oldClass = student.currentClass;
    
    // Update student's class
    student.currentClass = newClass;
    student.updatedBy = req.user.id;
    await student.save();
    
    // Log the change in audit log
    await AuditLog.create({
      entityType: 'Student',
      entityId: student._id,
      field: 'currentClass',
      oldValue: oldClass,
      newValue: newClass,
      changedBy: req.user.id,
      reason: 'Class transfer',
      action: 'update'
    });
    
    res.json({ 
      success: true, 
      message: 'Student transferred successfully',
      data: student 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Promote student to next level/class
const promoteStudent = async (req, res) => {
  try {
    const { newClass } = req.body;
    
    if (!newClass) {
      return res.status(400).json({ success: false, message: 'New class is required' });
    }
    
    const classExists = await Class.findById(newClass);
    if (!classExists) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const oldLevel = student.currentLevel;
    
    // Update student's class and level
    student.currentClass = newClass;
    student.currentLevel = getNextLevel(student.currentLevel);
    student.updatedBy = req.user.id;
    await student.save();
    
    // Log the promotion
    await AuditLog.create({
      entityType: 'Student',
      entityId: student._id,
      field: 'promotion',
      oldValue: { class: student.currentClass, level: oldLevel },
      newValue: { class: newClass, level: student.currentLevel },
      changedBy: req.user.id,
      reason: 'Academic promotion',
      action: 'update'
    });
    
    res.json({ 
      success: true, 
      message: 'Student promoted successfully',
      data: student 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to get next level
const getNextLevel = (currentLevel) => {
  const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex >= 0 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return currentLevel; // Return same if already at highest or not found
};

// ================= DATA CORRECTION WITH AUDIT TRAIL =================

// Submit data correction with audit trail
const correctStudentData = async (req, res) => {
  try {
    const { field, oldValue, newValue, reason } = req.body;
    
    if (!field || !newValue || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field, new value, and reason are required' 
      });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Update the field
    student[field] = newValue;
    student.updatedBy = req.user.id;
    await student.save();
    
    // Create audit log entry
    const auditLog = await AuditLog.create({
      entityType: 'Student',
      entityId: student._id,
      field: field,
      oldValue: oldValue,
      newValue: newValue,
      changedBy: req.user.id,
      reason: reason,
      action: 'correct'
    });
    
    res.json({ 
      success: true, 
      message: 'Data corrected successfully',
      data: { student, auditLog } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs for a specific entity
const getAuditLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const logs = await AuditLog.find({ entityType, entityId })
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= REPORTS =================

// Generate student statistics report
const getStudentReports = async (req, res) => {
  try {
    const { status, class: classId, startDate, endDate } = req.query;
    
    let query = { deletedAt: null };
    
    if (status) query.status = status;
    if (classId) query.currentClass = classId;
    if (startDate || endDate) {
      query.admissionDate = {};
      if (startDate) query.admissionDate.$gte = new Date(startDate);
      if (endDate) query.admissionDate.$lte = new Date(endDate);
    }
    
    const students = await Student.find(query);
    
    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      inactiveStudents: students.filter(s => s.status === 'inactive').length,
      byClass: {},
      byGender: {} // If gender field exists
    };
    
    // Group by class
    students.forEach(student => {
      const className = student.currentClass?.className || 'Not Assigned';
      stats.byClass[className] = (stats.byClass[className] || 0) + 1;
    });
    
    res.json({ success: true, data: { students, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Guardian
  getAllGuardians,
  createGuardian,
  updateGuardian,
  deleteGuardian,
  
  // Education
  getAllEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  
  // Documents
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  
  // Class Assignment
  transferStudent,
  promoteStudent,
  
  // Data Correction
  correctStudentData,
  getAuditLogs,
  
  // Reports
  getStudentReports
};
