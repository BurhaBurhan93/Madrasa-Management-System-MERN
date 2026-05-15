require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Account = require('./models/Account');
const Admission = require('./models/Admission');
const Announcement = require('./models/Announcement');
const Assignment = require('./models/Assignment');
const AttendanceCalendar = require('./models/AttendanceCalendar');
const AttendanceCorrection = require('./models/AttendanceCorrection');
const AttendanceRecord = require('./models/AttendanceRecord');
const AttendanceSession = require('./models/AttendanceSession');
const AttendanceSummary = require('./models/AttendanceSummary');
const AttendanceWarning = require('./models/AttendanceWarning');
const AuditLog = require('./models/AuditLog');
const Book = require('./models/Book');
const BookCategory = require('./models/BookCategory');
const BookPurchase = require('./models/BookPurchase');
const BookSale = require('./models/BookSale');
const BorrowedBook = require('./models/BorrowedBook');
const ClassModel = require('./models/Class');
const Complaint = require('./models/Complaint');
const ComplaintAction = require('./models/ComplaintAction');
const ComplaintEscalation = require('./models/ComplaintEscalation');
const ComplaintFeedback = require('./models/ComplaintFeedback');
const DailyFoodConsumption = require('./models/DailyFoodConsumption');
const Degree = require('./models/Degree');
const DegreeSubject = require('./models/DegreeSubject');
const Department = require('./models/Department');
const Designation = require('./models/Designation');
const Employee = require('./models/Employee');
const EmployeeAttendance = require('./models/EmployeeAttendance');
const Exam = require('./models/Exam');
const ExamAnswer = require('./models/ExamAnswer');
const ExamQuestion = require('./models/ExamQuestion');
const ExamType = require('./models/ExamType');
const Expense = require('./models/Expense');
const FeePayment = require('./models/FeePayment');
const FeeStructure = require('./models/FeeStructure');
const FinalResult = require('./models/FinalResult');
const FinancialReport = require('./models/FinancialReport');
const Guardian = require('./models/Guardian');
const Guarantor = require('./models/Guarantor');
const HostelAllocation = require('./models/HostelAllocation');
const HostelMeal = require('./models/HostelMeal');
const HostelMealAttendance = require('./models/HostelMealAttendance');
const HostelRoom = require('./models/HostelRoom');
const KitchenBudget = require('./models/KitchenBudget');
const KitchenExpense = require('./models/KitchenExpense');
const KitchenInventory = require('./models/KitchenInventory');
const KitchenPurchase = require('./models/KitchenPurchase');
const KitchenWaste = require('./models/KitchenWaste');
const Leave = require('./models/Leave');
const LeaveType = require('./models/LeaveType');
const Message = require('./models/Message');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const SalaryAdvance = require('./models/SalaryAdvance');
const SalaryDeduction = require('./models/SalaryDeduction');
const SalaryPayment = require('./models/SalaryPayment');
const SalaryStructure = require('./models/SalaryStructure');
const Student = require('./models/Student');
const StudentDegree = require('./models/StudentDegree');
const StudentEducation = require('./models/StudentEducation');
const StudentFee = require('./models/StudentFee');
const StudentLeave = require('./models/StudentLeave');
const Subject = require('./models/Subject');
const Supplier = require('./models/Supplier');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const UserDocument = require('./models/UserDocument');
const WeeklyMenu = require('./models/WeeklyMenu');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const SAMPLE_PASSWORD = 'sample1234';
const N = 5;

const day = (i) => new Date(Date.UTC(2026, 0, i + 1, 8, 0, 0));
const monthDate = (i) => new Date(Date.UTC(2026, i, 1, 8, 0, 0));

const upsert = (Model, filter, doc) => (
  Model.findOneAndUpdate(filter, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true })
);

const seedMany = async (label, Model, filterFor, docFor) => {
  const rows = [];
  for (let i = 1; i <= N; i += 1) {
    rows.push(await upsert(Model, filterFor(i), docFor(i)));
  }
  console.log(`[seedSampleData] ${label}: ${rows.length} rows ready`);
  return rows;
};

const connect = async () => {
  if (!MONGO_URI) throw new Error('Missing MONGODB_URI or MONGO_URI in server/.env');
  await mongoose.connect(MONGO_URI);
  console.log('[seedSampleData] Connected to MongoDB');
};

const run = async () => {
  await connect();

  const hashedPassword = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  const permissions = await seedMany(
    'Permission',
    Permission,
    (i) => ({ name: `sample:permission:${i}` }),
    (i) => ({ name: `sample:permission:${i}`, description: `Sample permission ${i}`, deletedAt: null })
  );

  const roles = await seedMany(
    'Role',
    Role,
    (i) => ({ name: `Sample Role ${i}` }),
    (i) => ({
      name: `Sample Role ${i}`,
      description: `Sample role ${i}`,
      permissions: permissions.slice(0, i).map((permission) => permission._id),
      deletedAt: null
    })
  );

  const sampleUsers = await seedMany(
    'User',
    User,
    (i) => ({ email: `sample.user${i}@madrasa.test` }),
    (i) => ({
      name: `Sample User ${i}`,
      email: `sample.user${i}@madrasa.test`,
      password: hashedPassword,
      role: i === 1 ? 'admin' : i === 2 ? 'teacher' : i === 3 ? 'staff' : 'student',
      roles: [roles[(i - 1) % roles.length]._id],
      phone: `07000000${i}`,
      status: 'active',
      deletedAt: null
    })
  );

  const studentUsers = await seedMany(
    'Student User',
    User,
    (i) => ({ email: `sample.student${i}@madrasa.test` }),
    (i) => ({
      name: `Sample Student ${i}`,
      email: `sample.student${i}@madrasa.test`,
      password: hashedPassword,
      role: 'student',
      status: 'active',
      deletedAt: null
    })
  );

  const employeeUsers = await seedMany(
    'Employee User',
    User,
    (i) => ({ email: `sample.employee${i}@madrasa.test` }),
    (i) => ({
      name: `Sample Employee ${i}`,
      email: `sample.employee${i}@madrasa.test`,
      password: hashedPassword,
      role: i === 1 ? 'teacher' : 'staff',
      status: 'active',
      deletedAt: null
    })
  );

  const adminUser = sampleUsers[0];
  const teacherUser = employeeUsers[0];

  const departments = await seedMany(
    'Department',
    Department,
    (i) => ({ departmentCode: `SAMPLE-DEPT-${i}` }),
    (i) => ({
      departmentName: `Sample Department ${i}`,
      departmentCode: `SAMPLE-DEPT-${i}`,
      description: `Sample department ${i}`,
      location: `Block ${i}`,
      contactExtension: `10${i}`,
      status: 'active'
    })
  );

  const designations = await seedMany(
    'Designation',
    Designation,
    (i) => ({ designationTitle: `Sample Designation ${i}`, department: departments[(i - 1) % departments.length]._id }),
    (i) => ({
      designationTitle: `Sample Designation ${i}`,
      department: departments[(i - 1) % departments.length]._id,
      jobLevel: ['entry', 'mid', 'senior', 'manager', 'entry'][i - 1],
      minQualification: 'Bachelor',
      salaryRangeMin: 20000 + i * 1000,
      salaryRangeMax: 40000 + i * 1000,
      status: 'active'
    })
  );

  const employees = await seedMany(
    'Employee',
    Employee,
    (i) => ({ employeeCode: `SAMPLE-EMP-${i}` }),
    (i) => ({
      user: employeeUsers[(i - 1) % employeeUsers.length]._id,
      employeeCode: `SAMPLE-EMP-${i}`,
      fullName: `Sample Employee ${i}`,
      gender: i % 2 ? 'male' : 'female',
      phoneNumber: `07100000${i}`,
      email: `sample.employee${i}@madrasa.test`,
      employeeType: ['teacher', 'finance', 'registrar', 'hr', 'support'][i - 1],
      department: departments[(i - 1) % departments.length]._id,
      designation: designations[(i - 1) % designations.length]._id,
      joiningDate: day(i),
      baseSalary: 30000 + i * 2500,
      status: 'active'
    })
  );

  const classes = await seedMany(
    'Class',
    ClassModel,
    (i) => ({ code: `SAMPLE-CLS-${i}` }),
    (i) => ({ code: `SAMPLE-CLS-${i}`, name: `Sample Class ${i}`, type: 'mixed', teacher: teacherUser._id, maxStudents: 30 + i, status: 'active', deletedAt: null })
  );

  const subjects = await seedMany(
    'Subject',
    Subject,
    (i) => ({ name: `Sample Subject ${i}` }),
    (i) => ({ name: `Sample Subject ${i}`, field: i % 2 ? 'Islamic Studies' : 'Science', deletedAt: null })
  );

  const degrees = await seedMany(
    'Degree',
    Degree,
    (i) => ({ name: `Sample Degree ${i}` }),
    (i) => ({ name: `Sample Degree ${i}`, deletedAt: null })
  );

  const students = await seedMany(
    'Student',
    Student,
    (i) => ({ studentCode: `SAMPLE-STU-${i}` }),
    (i) => ({
      user: studentUsers[(i - 1) % studentUsers.length]._id,
      firstName: `Sample Student ${i}`,
      lastName: 'Learner',
      email: `sample.student${i}@madrasa.test`,
      studentCode: `SAMPLE-STU-${i}`,
      guardianName: `Sample Guardian ${i}`,
      guardianRelationship: 'Father',
      guardianPhone: `07200000${i}`,
      admissionDate: day(i),
      currentClass: classes[(i - 1) % classes.length]._id,
      currentLevel: `Level ${i}`,
      isHostelResident: true,
      status: 'active',
      deletedAt: null
    })
  );

  const accounts = await seedMany(
    'Account',
    Account,
    (i) => ({ accountCode: `SAMPLE-ACC-${i}` }),
    (i) => ({
      accountCode: `SAMPLE-ACC-${i}`,
      accountName: `Sample Account ${i}`,
      accountType: i % 2 ? 'cash' : 'petty_cash',
      openingBalance: i * 1000,
      currentBalance: i * 1500,
      currency: 'USD',
      status: 'active',
      createdBy: adminUser._id
    })
  );

  const admissions = await seedMany(
    'Admission',
    Admission,
    (i) => ({ phone: `07300000${i}` }),
    (i) => ({
      firstName: `Sample Admission ${i}`,
      lastName: 'Applicant',
      fatherName: `Sample Father ${i}`,
      phone: `07300000${i}`,
      whatsapp: `07300000${i}`,
      degree: degrees[(i - 1) % degrees.length]._id,
      previousDegree: 'High School',
      previousInstitution: `Sample School ${i}`,
      status: ['pending', 'accepted', 'rejected', 'pending', 'accepted'][i - 1],
      deletedAt: null
    })
  );

  await seedMany('Announcement', Announcement, (i) => ({ title: `Sample Announcement ${i}` }), (i) => ({
    title: `Sample Announcement ${i}`,
    content: `Sample announcement content ${i}`,
    priority: ['low', 'medium', 'high', 'medium', 'low'][i - 1],
    createdBy: adminUser._id,
    expiresAt: day(i + 30),
    targetRoles: ['student', 'teacher', 'staff'],
    isActive: true
  }));

  await seedMany('Assignment', Assignment, (i) => ({ title: `Sample Assignment ${i}` }), (i) => ({
    title: `Sample Assignment ${i}`,
    description: `Sample assignment description ${i}`,
    courseId: subjects[(i - 1) % subjects.length]._id,
    dueDate: day(i + 10),
    maxPoints: 100,
    status: 'active'
  }));

  await seedMany('AttendanceCalendar', AttendanceCalendar, (i) => ({ date: day(i) }), (i) => ({
    date: day(i),
    dayType: i === 5 ? 'holiday' : 'class',
    description: `Sample calendar day ${i}`
  }));

  const attendanceSessions = await seedMany('AttendanceSession', AttendanceSession, (i) => ({ class: classes[(i - 1) % classes.length]._id, sessionDate: day(i), period: i }), (i) => ({
    class: classes[(i - 1) % classes.length]._id,
    teacher: teacherUser._id,
    sessionDate: day(i),
    sessionType: 'lecture',
    period: i,
    location: `Room ${i}`
  }));

  const attendanceRecords = await seedMany('AttendanceRecord', AttendanceRecord, (i) => ({ session: attendanceSessions[(i - 1) % attendanceSessions.length]._id, student: students[(i - 1) % students.length]._id }), (i) => ({
    session: attendanceSessions[(i - 1) % attendanceSessions.length]._id,
    student: students[(i - 1) % students.length]._id,
    status: ['present', 'absent', 'late', 'excused', 'present'][i - 1],
    lateMinutes: i === 3 ? 12 : 0,
    markedBy: adminUser._id,
    markedAt: day(i)
  }));

  await seedMany('AttendanceCorrection', AttendanceCorrection, (i) => ({ record: attendanceRecords[(i - 1) % attendanceRecords.length]._id }), (i) => ({
    record: attendanceRecords[(i - 1) % attendanceRecords.length]._id,
    oldStatus: 'absent',
    newStatus: 'present',
    correctionReason: `Sample correction ${i}`,
    correctedBy: adminUser._id,
    correctedAt: day(i)
  }));

  await seedMany('AttendanceSummary', AttendanceSummary, (i) => ({ student: students[(i - 1) % students.length]._id, month: i, year: 2026 }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    month: i,
    year: 2026,
    totalSessions: 20,
    presentCount: 16 + i,
    absentCount: 2,
    lateCount: 1,
    attendancePercentage: 80 + i
  }));

  await seedMany('AttendanceWarning', AttendanceWarning, (i) => ({ student: students[(i - 1) % students.length]._id, warningType: i % 2 ? 'low_attendance' : 'excessive_late' }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    warningType: i % 2 ? 'low_attendance' : 'excessive_late',
    threshold: i % 2 ? 75 : 5,
    currentValue: i % 2 ? 70 : 7,
    remarks: `Sample attendance warning ${i}`
  }));

  await seedMany('AuditLog', AuditLog, (i) => ({ entityId: students[(i - 1) % students.length]._id, field: `sampleField${i}` }), (i) => ({
    entityType: 'Student',
    entityId: students[(i - 1) % students.length]._id,
    field: `sampleField${i}`,
    oldValue: `Old ${i}`,
    newValue: `New ${i}`,
    changedBy: adminUser._id,
    reason: `Sample audit reason ${i}`,
    action: 'update'
  }));

  const bookCategories = await seedMany('BookCategory', BookCategory, (i) => ({ name: `Sample Book Category ${i}` }), (i) => ({
    name: `Sample Book Category ${i}`,
    description: `Sample category ${i}`,
    deletedAt: null
  }));

  const books = await seedMany('Book', Book, (i) => ({ title: `Sample Book ${i}` }), (i) => ({
    title: `Sample Book ${i}`,
    category: bookCategories[(i - 1) % bookCategories.length]._id,
    pages: 100 + i,
    publisher: 'Sample Publisher',
    publisherYear: 2026,
    stock: 10 + i,
    purchasePrice: 5 + i,
    salePrice: 8 + i,
    addedBy: adminUser._id,
    deletedAt: null
  }));

  await seedMany('BookPurchase', BookPurchase, (i) => ({ purchaseCode: `SAMPLE-BP-${i}` }), (i) => ({
    purchaseCode: `SAMPLE-BP-${i}`,
    supplierName: `Sample Supplier ${i}`,
    invoiceReference: `SAMPLE-INV-${i}`,
    book: books[(i - 1) % books.length]._id,
    quantity: 5 + i,
    unitPrice: 6 + i,
    totalPrice: (5 + i) * (6 + i),
    purchasedBy: adminUser._id,
    approvedBy: adminUser._id
  }));

  await seedMany('BookSale', BookSale, (i) => ({ receiptNo: `SAMPLE-BS-${i}` }), (i) => ({
    receiptNo: `SAMPLE-BS-${i}`,
    student: students[(i - 1) % students.length]._id,
    book: books[(i - 1) % books.length]._id,
    quantity: 1,
    unitPrice: 10 + i,
    totalAmount: 10 + i,
    soldBy: adminUser._id
  }));

  await seedMany('BorrowedBook', BorrowedBook, (i) => ({ book: books[(i - 1) % books.length]._id, borrower: students[(i - 1) % students.length]._id }), (i) => ({
    book: books[(i - 1) % books.length]._id,
    borrower: students[(i - 1) % students.length]._id,
    borrowedAt: day(i),
    returnDate: day(i + 7),
    status: i % 2 ? 'borrowed' : 'returned'
  }));

  const complaints = await seedMany('Complaint', Complaint, (i) => ({ complaintCode: `SAMPLE-CMP-${i}` }), (i) => ({
    complaintCode: `SAMPLE-CMP-${i}`,
    complainantType: 'student',
    complainant: students[(i - 1) % students.length]._id,
    complaintCategory: 'Sample',
    subject: `Sample complaint ${i}`,
    description: `Sample complaint description ${i}`,
    priorityLevel: ['low', 'medium', 'high', 'medium', 'low'][i - 1],
    complaintStatus: ['open', 'in_progress', 'closed', 'open', 'in_progress'][i - 1],
    assignedTo: adminUser._id
  }));

  await seedMany('ComplaintAction', ComplaintAction, (i) => ({ complaint: complaints[(i - 1) % complaints.length]._id, actionType: `Sample Action ${i}` }), (i) => ({
    complaint: complaints[(i - 1) % complaints.length]._id,
    actionType: `Sample Action ${i}`,
    actionDescription: `Sample action description ${i}`,
    actionTakenBy: adminUser._id,
    actionResult: 'Recorded',
    visibilityScope: 'public'
  }));

  await seedMany('ComplaintEscalation', ComplaintEscalation, (i) => ({ complaint: complaints[(i - 1) % complaints.length]._id, escalationLevel: i }), (i) => ({
    complaint: complaints[(i - 1) % complaints.length]._id,
    escalatedFrom: adminUser._id,
    escalatedTo: sampleUsers[(i - 1) % sampleUsers.length]._id,
    escalationReason: `Sample escalation ${i}`,
    escalationLevel: i,
    resolutionDeadline: day(i + 3),
    escalationStatus: 'pending'
  }));

  await seedMany('ComplaintFeedback', ComplaintFeedback, (i) => ({ complaint: complaints[(i - 1) % complaints.length]._id, feedbackBy: studentUsers[(i - 1) % studentUsers.length]._id }), (i) => ({
    complaint: complaints[(i - 1) % complaints.length]._id,
    feedbackBy: studentUsers[(i - 1) % studentUsers.length]._id,
    satisfactionLevel: i,
    comments: `Sample feedback ${i}`,
    resolutionTime: i * 2
  }));

  await seedMany('DailyFoodConsumption', DailyFoodConsumption, (i) => ({ consumptionDate: day(i), mealType: ['breakfast', 'lunch', 'dinner', 'breakfast', 'lunch'][i - 1] }), (i) => ({
    consumptionDate: day(i),
    mealType: ['breakfast', 'lunch', 'dinner', 'breakfast', 'lunch'][i - 1],
    numberOfStudents: 50 + i,
    numberOfStaff: 5 + i,
    itemName: `Sample Food ${i}`,
    quantityUsed: 10 + i,
    unit: 'kg',
    preparedBy: `Cook ${i}`,
    supervisedBy: `Supervisor ${i}`
  }));

  await seedMany('DegreeSubject', DegreeSubject, (i) => ({ teacher: teacherUser._id, degree: degrees[(i - 1) % degrees.length]._id, subject: subjects[(i - 1) % subjects.length]._id }), (i) => ({
    teacher: teacherUser._id,
    degree: degrees[(i - 1) % degrees.length]._id,
    subject: subjects[(i - 1) % subjects.length]._id,
    period: i,
    studyDaysPerWeek: 5,
    academicYear: '2026-2027',
    status: 'active',
    deletedAt: null
  }));

  await seedMany('EmployeeAttendance', EmployeeAttendance, (i) => ({ employee: employees[(i - 1) % employees.length]._id, date: day(i) }), (i) => ({
    employee: employees[(i - 1) % employees.length]._id,
    date: day(i),
    status: ['present', 'absent', 'late', 'half-day', 'on-leave'][i - 1],
    checkIn: '08:00',
    checkOut: '16:00',
    lateMinutes: i === 3 ? 15 : 0,
    markedBy: adminUser._id
  }));

  const examTypes = await seedMany('ExamType', ExamType, (i) => ({ name: `Sample Exam Type ${i}` }), (i) => ({
    name: `Sample Exam Type ${i}`,
    deletedAt: null
  }));

  const exams = await seedMany('Exam', Exam, (i) => ({ title: `Sample Exam ${i}` }), (i) => ({
    title: `Sample Exam ${i}`,
    examType: examTypes[(i - 1) % examTypes.length]._id,
    subject: subjects[(i - 1) % subjects.length]._id,
    class: classes[(i - 1) % classes.length]._id,
    createdBy: teacherUser._id,
    academicYear: '2026-2027',
    duration: 60,
    totalMarks: 100,
    startDate: day(i + 20),
    endDate: day(i + 21),
    status: 'published'
  }));

  await seedMany('ExamQuestion', ExamQuestion, (i) => ({ exam: exams[(i - 1) % exams.length]._id, question: `Sample question ${i}?` }), (i) => ({
    exam: exams[(i - 1) % exams.length]._id,
    class: classes[(i - 1) % classes.length]._id,
    subject: subjects[(i - 1) % subjects.length]._id,
    question: `Sample question ${i}?`,
    questionType: 'mcq',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    marks: 5,
    createdBy: teacherUser._id
  }));

  await seedMany('ExamAnswer', ExamAnswer, (i) => ({ exam: exams[(i - 1) % exams.length]._id, student: students[(i - 1) % students.length]._id }), (i) => ({
    exam: exams[(i - 1) % exams.length]._id,
    student: students[(i - 1) % students.length]._id,
    answers: new Map([['q1', 'A']]),
    score: 70 + i,
    totalMarks: 100
  }));

  await seedMany('Expense', Expense, (i) => ({ expenseCode: `SAMPLE-EXP-${i}` }), (i) => ({
    expenseCode: `SAMPLE-EXP-${i}`,
    category: 'Operations',
    title: `Sample Expense ${i}`,
    amount: 100 + i * 20,
    expenseDate: day(i),
    paymentMethod: 'cash',
    referenceNo: `SAMPLE-REF-${i}`,
    paidTo: `Sample Vendor ${i}`,
    approvedBy: adminUser._id,
    approvalStatus: 'approved'
  }));

  const feeStructures = await seedMany('FeeStructure', FeeStructure, (i) => ({ feeCode: `SAMPLE-FEE-${i}` }), (i) => ({
    feeCode: `SAMPLE-FEE-${i}`,
    feeName: `Sample Fee ${i}`,
    class: classes[(i - 1) % classes.length]._id,
    feeType: ['tuition', 'admission', 'other', 'tuition', 'other'][i - 1],
    amount: 500 + i * 50,
    frequency: i % 2 ? 'monthly' : 'one-time',
    applicableFrom: monthDate(i - 1),
    status: 'active',
    deletedAt: null
  }));

  const studentFees = await seedMany('StudentFee', StudentFee, (i) => ({ student: students[(i - 1) % students.length]._id, feeStructure: feeStructures[(i - 1) % feeStructures.length]._id, academicYear: '2026-2027' }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    feeStructure: feeStructures[(i - 1) % feeStructures.length]._id,
    academicYear: '2026-2027',
    totalAmount: 500 + i * 50,
    discountAmount: 0,
    payableAmount: 500 + i * 50,
    dueDate: day(i + 15),
    paymentStatus: i % 2 ? 'pending' : 'partial',
    createdBy: adminUser._id
  }));

  await seedMany('FeePayment', FeePayment, (i) => ({ receiptNo: `SAMPLE-RCPT-${i}` }), (i) => ({
    studentFee: studentFees[(i - 1) % studentFees.length]._id,
    receiptNo: `SAMPLE-RCPT-${i}`,
    paidAmount: 200 + i * 20,
    paymentMethod: 'cash',
    transactionReference: `SAMPLE-FTR-${i}`,
    paymentStatus: 'completed',
    receivedBy: adminUser._id,
    verifiedBy: adminUser._id,
    verificationStatus: 'verified'
  }));

  await seedMany('FinalResult', FinalResult, (i) => ({ student: students[(i - 1) % students.length]._id, exam: exams[(i - 1) % exams.length]._id, subject: subjects[(i - 1) % subjects.length]._id }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    exam: exams[(i - 1) % exams.length]._id,
    class: classes[(i - 1) % classes.length]._id,
    subject: subjects[(i - 1) % subjects.length]._id,
    totalScore: 70 + i,
    status: 'pass',
    grade: ['A', 'B', 'C', 'B', 'A'][i - 1]
  }));

  await seedMany('FinancialReport', FinancialReport, (i) => ({ reportType: `Sample Report ${i}`, reportPeriod: `2026-${String(i).padStart(2, '0')}` }), (i) => ({
    reportType: `Sample Report ${i}`,
    reportPeriod: `2026-${String(i).padStart(2, '0')}`,
    totalIncome: 1000 * i,
    totalExpense: 500 * i,
    netBalance: 500 * i,
    generatedBy: adminUser._id,
    approvalStatus: 'approved'
  }));

  await seedMany('Guardian', Guardian, (i) => ({ student: students[(i - 1) % students.length]._id, phone: `07400000${i}` }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    name: `Sample Guardian ${i}`,
    relationship: 'Father',
    phone: `07400000${i}`,
    email: `guardian${i}@madrasa.test`,
    occupation: 'Trader',
    address: `Sample Address ${i}`,
    isPrimary: true,
    deletedAt: null
  }));

  await seedMany('Guarantor', Guarantor, (i) => ({ user: studentUsers[(i - 1) % studentUsers.length]._id, fullName: `Sample Guarantor ${i}` }), (i) => ({
    user: studentUsers[(i - 1) % studentUsers.length]._id,
    fullName: `Sample Guarantor ${i}`,
    relationship: 'Uncle',
    phoneNumber: `07500000${i}`,
    whatsapp: `07500000${i}`,
    job: 'Shopkeeper',
    isPrimary: i === 1,
    deletedAt: null
  }));

  const hostelRooms = await seedMany('HostelRoom', HostelRoom, (i) => ({ roomNumber: `SAMPLE-R-${i}`, building: 'Sample Hostel' }), (i) => ({
    roomNumber: `SAMPLE-R-${i}`,
    building: 'Sample Hostel',
    floor: i,
    capacity: 2,
    roomType: 'double',
    amenities: ['wifi', 'fan', 'study_table'],
    status: 'available',
    monthlyRent: 100 + i * 10,
    createdBy: adminUser._id,
    deletedAt: null
  }));

  await seedMany('HostelAllocation', HostelAllocation, (i) => ({ student: students[(i - 1) % students.length]._id }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    room: hostelRooms[(i - 1) % hostelRooms.length]._id,
    bedNumber: i,
    checkInDate: day(i),
    status: 'active',
    monthlyRent: 100 + i * 10,
    securityDeposit: 50,
    emergencyContact: { name: `Emergency ${i}`, relationship: 'Father', phone: `07600000${i}`, email: `emergency${i}@madrasa.test` },
    createdBy: adminUser._id,
    deletedAt: null
  }));

  const hostelMeals = await seedMany('HostelMeal', HostelMeal, (i) => ({ date: day(i), mealType: ['breakfast', 'lunch', 'dinner', 'snack', 'breakfast'][i - 1] }), (i) => ({
    mealType: ['breakfast', 'lunch', 'dinner', 'snack', 'breakfast'][i - 1],
    date: day(i),
    menu: { mainDish: `Sample Dish ${i}`, beverage: 'Tea' },
    totalResidents: 50,
    attendedCount: 45 + i,
    createdBy: adminUser._id,
    deletedAt: null
  }));

  await seedMany('HostelMealAttendance', HostelMealAttendance, (i) => ({ student: students[(i - 1) % students.length]._id, meal: hostelMeals[(i - 1) % hostelMeals.length]._id }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    meal: hostelMeals[(i - 1) % hostelMeals.length]._id,
    status: i % 2 ? 'present' : 'absent',
    markedBy: adminUser._id,
    notes: `Sample meal attendance ${i}`
  }));

  await seedMany('KitchenBudget', KitchenBudget, (i) => ({ month: i, year: 2026 }), (i) => ({
    month: i,
    year: 2026,
    allocatedAmount: 1000 * i,
    approvedAmount: 900 * i,
    spentAmount: 400 * i,
    remainingAmount: 500 * i,
    approvedBy: adminUser._id,
    budgetStatus: 'approved'
  }));

  const kitchenInventory = await seedMany('KitchenInventory', KitchenInventory, (i) => ({ itemName: `Sample Kitchen Item ${i}` }), (i) => ({
    itemName: `Sample Kitchen Item ${i}`,
    category: 'Food',
    quantity: 20 + i,
    unit: 'kg',
    minimumStock: 5,
    unitPrice: 2 + i,
    status: 'available'
  }));

  const kitchenPurchases = await seedMany('KitchenPurchase', KitchenPurchase, (i) => ({ itemName: `Sample Purchase Item ${i}`, purchaseDate: day(i) }), (i) => ({
    itemName: `Sample Purchase Item ${i}`,
    category: 'Food',
    quantity: 10 + i,
    unit: 'kg',
    unitPrice: 3 + i,
    totalPrice: (10 + i) * (3 + i),
    purchaseDate: day(i),
    supplier: `Sample Supplier ${i}`,
    recordedBy: adminUser._id
  }));

  await seedMany('KitchenExpense', KitchenExpense, (i) => ({ referenceNo: `SAMPLE-KEXP-${i}` }), (i) => ({
    expenseDate: day(i),
    expenseType: 'Food',
    relatedPurchase: kitchenPurchases[(i - 1) % kitchenPurchases.length]._id,
    amount: 50 + i,
    paymentMethod: 'cash',
    referenceNo: `SAMPLE-KEXP-${i}`,
    paidTo: `Sample Kitchen Vendor ${i}`,
    approvedBy: adminUser._id,
    expenseStatus: 'approved'
  }));

  await seedMany('KitchenWaste', KitchenWaste, (i) => ({ itemName: kitchenInventory[(i - 1) % kitchenInventory.length].itemName, wasteDate: day(i) }), (i) => ({
    itemName: kitchenInventory[(i - 1) % kitchenInventory.length].itemName,
    quantity: i,
    unit: 'kg',
    wasteDate: day(i),
    reason: ['spoiled', 'expired', 'overcooked', 'other', 'spoiled'][i - 1],
    recordedBy: adminUser._id
  }));

  const leaveTypes = await seedMany('LeaveType', LeaveType, (i) => ({ leaveCode: `SAMPLE-LT-${i}` }), (i) => ({
    leaveTypeName: `Sample Leave Type ${i}`,
    leaveCode: `SAMPLE-LT-${i}`,
    maxDaysAllowed: 5 + i,
    isPaid: true,
    genderSpecific: 'both',
    status: 'active'
  }));

  await seedMany('Leave', Leave, (i) => ({ employee: employees[(i - 1) % employees.length]._id, leaveType: leaveTypes[(i - 1) % leaveTypes.length]._id }), (i) => ({
    employee: employees[(i - 1) % employees.length]._id,
    leaveType: leaveTypes[(i - 1) % leaveTypes.length]._id,
    leaveReason: `Sample leave reason ${i}`,
    status: 'pending',
    leaveDays: i,
    approvedBy: employees[0]._id
  }));

  await seedMany('Message', Message, (i) => ({ sender: adminUser._id, recipient: sampleUsers[(i - 1) % sampleUsers.length]._id, subject: `Sample Message ${i}` }), (i) => ({
    sender: adminUser._id,
    recipient: sampleUsers[(i - 1) % sampleUsers.length]._id,
    subject: `Sample Message ${i}`,
    content: `Sample message body ${i}`,
    status: i % 2 ? 'unread' : 'read'
  }));

  await seedMany('SalaryStructure', SalaryStructure, (i) => ({ employeeType: ['teacher', 'staff', 'admin', 'support', 'teacher'][i - 1], effectiveFrom: monthDate(i - 1) }), (i) => ({
    employeeType: ['teacher', 'staff', 'admin', 'support', 'teacher'][i - 1],
    basicSalary: 30000 + i * 3000,
    allowanceAmount: 1000,
    housingAllowance: 1500,
    foodAllowance: 800,
    transportAllowance: 700,
    overtimeRate: 100,
    deductionType: 'tax',
    taxPercentage: 3,
    effectiveFrom: monthDate(i - 1),
    status: 'active'
  }));

  await seedMany('SalaryPayment', SalaryPayment, (i) => ({ employee: employees[(i - 1) % employees.length]._id, salaryMonth: i, salaryYear: 2026 }), (i) => ({
    employee: employees[(i - 1) % employees.length]._id,
    salaryMonth: i,
    salaryYear: 2026,
    grossSalary: 30000 + i * 1000,
    totalAllowance: 2000,
    totalDeduction: 500,
    netSalary: 31500 + i * 1000,
    transactionReference: `SAMPLE-SAL-${i}`,
    paymentStatus: 'paid',
    approvedBy: adminUser._id,
    paidBy: adminUser._id
  }));

  await seedMany('SalaryDeduction', SalaryDeduction, (i) => ({ employee: employees[(i - 1) % employees.length]._id, deductionMonth: i, deductionYear: 2026 }), (i) => ({
    employee: employees[(i - 1) % employees.length]._id,
    deductionType: `Sample Deduction ${i}`,
    deductionReason: 'Late attendance',
    deductionAmount: 100 + i,
    deductionMonth: i,
    deductionYear: 2026,
    appliedBy: adminUser._id,
    approvedBy: adminUser._id,
    status: 'approved'
  }));

  await seedMany('SalaryAdvance', SalaryAdvance, (i) => ({ employee: employees[(i - 1) % employees.length]._id, requestDate: day(i) }), (i) => ({
    employee: employees[(i - 1) % employees.length]._id,
    advanceAmount: 500 + i * 50,
    requestDate: day(i),
    approvalDate: day(i + 1),
    approvedBy: adminUser._id,
    repaymentStartMonth: i,
    monthlyDeductionAmount: 100,
    remainingBalance: 400,
    advanceStatus: 'approved'
  }));

  await seedMany('StudentDegree', StudentDegree, (i) => ({ student: students[(i - 1) % students.length]._id, degree: degrees[(i - 1) % degrees.length]._id, academicYear: '2026-2027' }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    degree: degrees[(i - 1) % degrees.length]._id,
    academicYear: '2026-2027',
    status: 'active'
  }));

  await seedMany('StudentEducation', StudentEducation, (i) => ({ student: students[(i - 1) % students.length]._id }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    previousDegree: `Previous Degree ${i}`,
    previousInstitution: `Previous Institution ${i}`,
    location: `Sample Location ${i}`
  }));

  await seedMany('StudentLeave', StudentLeave, (i) => ({ student: students[(i - 1) % students.length]._id, startDate: day(i) }), (i) => ({
    student: students[(i - 1) % students.length]._id,
    leaveType: 'Personal',
    startDate: day(i),
    endDate: day(i + 1),
    reason: `Sample student leave ${i}`,
    approvedBy: employees[0]._id,
    approvalStatus: 'pending'
  }));

  await seedMany('Supplier', Supplier, (i) => ({ name: `Sample Supplier ${i}` }), (i) => ({
    name: `Sample Supplier ${i}`,
    phone: `07700000${i}`,
    address: `Sample Supplier Address ${i}`,
    itemsSupplied: ['Rice', 'Oil', 'Vegetables'],
    status: 'active',
    notes: `Sample supplier ${i}`
  }));

  await seedMany('Transaction', Transaction, (i) => ({ transactionCode: `SAMPLE-TXN-${i}` }), (i) => ({
    transactionCode: `SAMPLE-TXN-${i}`,
    account: accounts[(i - 1) % accounts.length]._id,
    transactionType: i % 2 ? 'income' : 'expense',
    amount: 100 + i * 25,
    transactionDate: day(i),
    referenceType: 'Sample',
    balanceAfter: 1000 + i * 100,
    performedBy: adminUser._id,
    verifiedBy: adminUser._id,
    verificationStatus: 'verified',
    description: `Sample transaction ${i}`
  }));

  await seedMany('UserDocument', UserDocument, (i) => ({ user: sampleUsers[(i - 1) % sampleUsers.length]._id, filePath: `/sample/documents/user-${i}.pdf` }), (i) => ({
    user: sampleUsers[(i - 1) % sampleUsers.length]._id,
    type: 'id-card',
    filePath: `/sample/documents/user-${i}.pdf`,
    deletedAt: null
  }));

  await seedMany('WeeklyMenu', WeeklyMenu, (i) => ({ weekStartDate: day(1), day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i - 1], mealType: ['breakfast', 'lunch', 'dinner', 'breakfast', 'lunch'][i - 1] }), (i) => ({
    weekStartDate: day(1),
    weekEndDate: day(7),
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i - 1],
    mealType: ['breakfast', 'lunch', 'dinner', 'breakfast', 'lunch'][i - 1],
    menuItems: [`Sample menu item ${i}`, 'Tea', 'Bread'],
    notes: `Sample weekly menu ${i}`,
    createdBy: adminUser._id
  }));

  console.log('[seedSampleData] Done. Login password for sample users is sample1234');
};

run()
  .catch((error) => {
    console.error('[seedSampleData] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
