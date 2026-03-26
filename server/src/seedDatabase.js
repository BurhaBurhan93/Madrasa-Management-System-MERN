const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Employee = require('./models/Employee');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Book = require('./models/Book');
const BookCategory = require('./models/BookCategory');
const BorrowedBook = require('./models/BorrowedBook');
const FeeStructure = require('./models/FeeStructure');
const StudentFee = require('./models/StudentFee');
const FeePayment = require('./models/FeePayment');
const Exam = require('./models/Exam');
const ExamType = require('./models/ExamType');
const AttendanceSession = require('./models/AttendanceSession');
const AttendanceRecord = require('./models/AttendanceRecord');
const Assignment = require('./models/Assignment');
const Complaint = require('./models/Complaint');
const Transaction = require('./models/Transaction');
const Expense = require('./models/Expense');
const Account = require('./models/Account');
const SalaryStructure = require('./models/SalaryStructure');
const SalaryPayment = require('./models/SalaryPayment');
const SalaryDeduction = require('./models/SalaryDeduction');
const SalaryAdvance = require('./models/SalaryAdvance');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Employee.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      BookCategory.deleteMany({}),
      Book.deleteMany({}),
      BorrowedBook.deleteMany({}),
      FeeStructure.deleteMany({}),
      StudentFee.deleteMany({}),
      FeePayment.deleteMany({}),
      Exam.deleteMany({}),
      ExamType.deleteMany({}),
      AttendanceSession.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      Assignment.deleteMany({}),
      Complaint.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      Expense.deleteMany({}),
      SalaryStructure.deleteMany({}),
      SalaryPayment.deleteMany({}),
      SalaryDeduction.deleteMany({}),
      SalaryAdvance.deleteMany({}),
      Role.deleteMany({}),
      Permission.deleteMany({})
    ]);

    // Permissions & Roles
    const permissions = await Permission.insertMany([
      { name: 'view_finance', description: 'View finance data' },
      { name: 'manage_finance', description: 'Manage finance data' },
      { name: 'manage_library', description: 'Manage library data' },
      { name: 'manage_students', description: 'Manage students data' }
    ]);

    const roleMap = {
      admin: permissions.map(p => p._id),
      staff: permissions.map(p => p._id),
      teacher: [permissions[0]._id],
      student: []
    };

    await Role.insertMany([
      { name: 'admin', description: 'Admin role', permissions: roleMap.admin },
      { name: 'staff', description: 'Staff role', permissions: roleMap.staff },
      { name: 'teacher', description: 'Teacher role', permissions: roleMap.teacher },
      { name: 'student', description: 'Student role', permissions: roleMap.student }
    ]);

    // Users
    const usersData = [
      { name: 'Admin User', email: 'admin@gmail.com', password: 'admin1234', role: 'admin' },
      { name: 'Student One', email: 'student@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Student Two', email: 'student2@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Teacher One', email: 'teacher@gmail.com', password: 'teacher1234', role: 'teacher' },
      { name: 'Teacher Two', email: 'teacher2@gmail.com', password: 'teacher1234', role: 'teacher' },
      { name: 'Staff One', email: 'staff@gmail.com', password: 'staff1234', role: 'staff' },
      { name: 'Staff Two', email: 'staff2@gmail.com', password: 'staff1234', role: 'staff' }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await User.create({ ...u, password: hashed });
      createdUsers.push(user);
    }

    const adminUser = createdUsers.find(u => u.role === 'admin');

    // Classes
    const classData = [
      { code: 'CLS-6A', name: 'Class 6', type: 'mixed', maxStudents: 40 },
      { code: 'CLS-6B', name: 'Class 6', type: 'mixed', maxStudents: 40 },
      { code: 'CLS-7A', name: 'Class 7', type: 'mixed', maxStudents: 40 },
      { code: 'CLS-8A', name: 'Class 8', type: 'mixed', maxStudents: 40 }
    ];

    const createdClasses = [];
    for (let i = 0; i < classData.length; i++) {
      const teacherUser = createdUsers.find(u => u.role === 'teacher');
      const newClass = await Class.create({
        ...classData[i],
        teacher: teacherUser?._id
      });
      createdClasses.push(newClass);
    }

    // Subjects
    const subjects = await Subject.insertMany([
      { name: 'Mathematics', field: 'Science' },
      { name: 'Physics', field: 'Science' },
      { name: 'Chemistry', field: 'Science' },
      { name: 'Biology', field: 'Science' },
      { name: 'English', field: 'Arts' }
    ]);

    // Students
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    const createdStudents = [];
    for (let i = 0; i < studentUsers.length; i++) {
      const student = await Student.create({
        user: studentUsers[i]._id,
        studentCode: `STU-${2024000 + i + 1}`,
        guardianPhone: `+12345678${i}`,
        admissionDate: new Date(),
        currentClass: createdClasses[i % createdClasses.length]?._id,
        status: 'active'
      });
      createdStudents.push(student);
    }

    // Employees
    const employeeUsers = createdUsers.filter(u => u.role === 'teacher' || u.role === 'staff');
    const createdEmployees = [];
    for (let i = 0; i < employeeUsers.length; i++) {
      const employee = await Employee.create({
        user: employeeUsers[i]._id,
        employeeCode: `EMP-${2024000 + i + 1}`,
        fullName: employeeUsers[i].name,
        employeeType: employeeUsers[i].role === 'teacher' ? 'teacher' : 'support',
        designation: employeeUsers[i].role === 'teacher' ? 'Teacher' : 'Staff',
        department: employeeUsers[i].role === 'teacher' ? 'Academics' : 'Administration',
        joiningDate: new Date(),
        baseSalary: 40000 + i * 1000
      });
      createdEmployees.push(employee);
    }

    // Payroll: Salary Structures
    const salaryStructures = await SalaryStructure.insertMany([
      {
        employeeType: 'teacher',
        basicSalary: 45000,
        allowanceAmount: 5000,
        housingAllowance: 3000,
        foodAllowance: 2000,
        transportAllowance: 1500,
        overtimeRate: 200,
        deductionType: 'tax',
        taxPercentage: 5,
        effectiveFrom: new Date('2024-01-01'),
        status: 'active'
      },
      {
        employeeType: 'support',
        basicSalary: 35000,
        allowanceAmount: 3000,
        housingAllowance: 2000,
        foodAllowance: 1500,
        transportAllowance: 1000,
        overtimeRate: 150,
        deductionType: 'tax',
        taxPercentage: 3,
        effectiveFrom: new Date('2024-01-01'),
        status: 'active'
      }
    ]);

    // Payroll: Salary Payments
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      const grossSalary = emp.baseSalary || (emp.employeeType === 'teacher' ? 45000 : 35000);
      const totalAllowance = emp.employeeType === 'teacher' ? 6500 : 4500;
      const totalDeduction = i % 2 === 0 ? 1200 : 800;
      const netSalary = grossSalary + totalAllowance - totalDeduction;
      await SalaryPayment.create({
        employee: emp._id,
        salaryMonth: 3,
        salaryYear: 2026,
        grossSalary,
        totalAllowance,
        totalDeduction,
        netSalary,
        paymentDate: new Date(),
        paymentMethod: 'cash',
        transactionReference: `SAL-${Date.now()}-${i}`,
        paymentStatus: 'paid',
        approvedBy: adminUser?._id,
        paidBy: adminUser?._id
      });
    }

    // Payroll: Salary Deductions
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      await SalaryDeduction.create({
        employee: emp._id,
        deductionType: 'Late Attendance',
        deductionReason: 'Late arrival',
        deductionAmount: 200 + i * 20,
        deductionMonth: 3,
        deductionYear: 2026,
        appliedBy: adminUser?._id,
        approvedBy: adminUser?._id,
        status: i % 3 === 0 ? 'pending' : 'approved'
      });
    }

    // Payroll: Salary Advances
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      await SalaryAdvance.create({
        employee: emp._id,
        advanceAmount: 1000 + i * 200,
        requestDate: new Date(Date.now() - i * 86400000),
        approvalDate: new Date(),
        approvedBy: adminUser?._id,
        repaymentStartMonth: 4,
        monthlyDeductionAmount: 150 + i * 10,
        remainingBalance: 800 + i * 150,
        advanceStatus: i % 2 === 0 ? 'approved' : 'pending'
      });
    }

    // Accounts
    const mainAccount = await Account.create({
      accountCode: 'MAIN',
      accountName: 'Main Account',
      accountType: 'cash',
      openingBalance: 0,
      currentBalance: 0,
      currency: 'USD',
      status: 'active',
      createdBy: adminUser?._id
    });

    // Book Categories & Books
    const categories = await BookCategory.insertMany([
      { name: 'Islamic Studies', description: 'Quran and Hadith' },
      { name: 'Science', description: 'Physics, Chemistry, Biology' },
      { name: 'Literature', description: 'English and Urdu' }
    ]);

    const books = await Book.insertMany([
      {
        title: 'Sahih Bukhari',
        category: categories[0]._id,
        pages: 1200,
        publisher: 'Madrasa Publications',
        publisherYear: 2022,
        stock: 5,
        purchasePrice: 20,
        salePrice: 25,
        addedBy: adminUser?._id
      },
      {
        title: 'Physics for Class 10',
        category: categories[1]._id,
        pages: 320,
        publisher: 'Edu Press',
        publisherYear: 2023,
        stock: 10,
        purchasePrice: 8,
        salePrice: 12,
        addedBy: adminUser?._id
      },
      {
        title: 'English Grammar',
        category: categories[2]._id,
        pages: 250,
        publisher: 'Language House',
        publisherYear: 2021,
        stock: 8,
        purchasePrice: 6,
        salePrice: 10,
        addedBy: adminUser?._id
      }
    ]);

    // Borrowed Books
    for (let i = 0; i < Math.min(createdStudents.length, books.length); i++) {
      await BorrowedBook.create({
        borrower: createdStudents[i]._id,
        book: books[i]._id,
        borrowedAt: new Date(Date.now() - i * 86400000),
        returnDate: new Date(Date.now() + (7 + i) * 86400000),
        status: 'borrowed'
      });
    }

    // Fee Structures
    const feeStructures = [];
    for (let i = 0; i < createdClasses.length; i++) {
      const tuition = await FeeStructure.create({
        feeCode: `FEE-TUIT-${i + 1}`,
        feeName: `Tuition Fee ${createdClasses[i].name}`,
        class: createdClasses[i]._id,
        feeType: 'tuition',
        amount: 2000 + i * 200,
        frequency: 'monthly'
      });
      feeStructures.push(tuition);

      const admission = await FeeStructure.create({
        feeCode: `FEE-ADM-${i + 1}`,
        feeName: `Admission Fee ${createdClasses[i].name}`,
        class: createdClasses[i]._id,
        feeType: 'admission',
        amount: 5000 + i * 300,
        frequency: 'one-time'
      });
      feeStructures.push(admission);
    }

    // Student Fees
    const studentFees = [];
    for (let i = 0; i < createdStudents.length; i++) {
      const fee = await StudentFee.create({
        student: createdStudents[i]._id,
        feeStructure: feeStructures[i % feeStructures.length]._id,
        academicYear: '2024-2025',
        totalAmount: 2000,
        discountAmount: 0,
        payableAmount: 2000,
        dueDate: new Date(Date.now() + 15 * 86400000),
        paymentStatus: 'pending',
        createdBy: adminUser?._id
      });
      studentFees.push(fee);
    }

    // Fee Payments
    for (let i = 0; i < studentFees.length; i++) {
      await FeePayment.create({
        studentFee: studentFees[i]._id,
        receiptNo: `RCPT-${Date.now()}-${i}`,
        paidAmount: 2000,
        paymentMethod: 'cash',
        paymentStatus: i % 2 === 0 ? 'completed' : 'pending',
        receivedBy: adminUser?._id,
        verifiedBy: adminUser?._id,
        verificationStatus: i % 2 === 0 ? 'verified' : 'pending',
        remarks: 'Seed payment'
      });
    }

    // Exam Types & Exams
    const examTypes = await ExamType.insertMany([
      { name: 'Midterm' },
      { name: 'Final' },
      { name: 'Quiz' }
    ]);

    for (let i = 0; i < examTypes.length; i++) {
      await Exam.create({
        title: `${examTypes[i].name} Exam 2024`,
        examType: examTypes[i]._id,
        academicYear: '2024-2025',
        startDate: new Date(Date.now() + i * 86400000),
        endDate: new Date(Date.now() + (i + 1) * 86400000),
        status: 'scheduled'
      });
    }

    // Assignments
    for (let i = 0; i < subjects.length; i++) {
      await Assignment.create({
        title: `${subjects[i].name} Assignment`,
        description: `Complete the ${subjects[i].name} assignment`,
        courseId: subjects[i]._id,
        dueDate: new Date(Date.now() + (i + 7) * 86400000),
        maxPoints: 100
      });
    }

    // Attendance Sessions & Records
    const sessions = [];
    for (let i = 0; i < createdClasses.length; i++) {
      const session = await AttendanceSession.create({
        class: createdClasses[i]._id,
        teacher: createdUsers.find(u => u.role === 'teacher')?._id,
        sessionDate: new Date(Date.now() - i * 86400000),
        sessionType: 'lecture',
        period: i + 1
      });
      sessions.push(session);
    }

    for (let i = 0; i < createdStudents.length; i++) {
      await AttendanceRecord.create({
        session: sessions[i % sessions.length]._id,
        student: createdStudents[i]._id,
        status: i % 3 === 0 ? 'absent' : 'present',
        markedBy: adminUser?._id,
        markedAt: new Date()
      });
    }

    // Complaints
    for (let i = 0; i < createdStudents.length; i++) {
      await Complaint.create({
        complaintCode: `CMP-${Date.now()}-${i}`,
        complainantType: 'student',
        complainant: createdStudents[i]._id,
        complaintCategory: 'General',
        subject: 'Service issue',
        description: 'Seeded complaint for testing',
        priorityLevel: i % 3 === 0 ? 'high' : 'medium',
        complaintStatus: i % 2 === 0 ? 'open' : 'in_progress'
      });
    }

    // Transactions
    const transactionTypes = ['income', 'expense'];
    const references = ['Fee Collection', 'Salary', 'Books', 'Maintenance'];
    let runningBalance = 0;
    for (let i = 0; i < 10; i++) {
      const amount = 1000 + i * 250;
      const tType = transactionTypes[i % 2];
      const impact = tType === 'income' ? amount : -amount;
      runningBalance += impact;
      await Transaction.create({
        transactionCode: `TXN-SEED-${Date.now()}-${i}`,
        account: mainAccount._id,
        transactionType: tType,
        amount,
        transactionDate: new Date(Date.now() - i * 86400000),
        referenceType: references[i % references.length],
        balanceAfter: runningBalance,
        performedBy: adminUser?._id,
        verifiedBy: adminUser?._id,
        verificationStatus: i % 3 === 0 ? 'pending' : 'verified',
        description: `Seeded transaction ${i + 1}`
      });
    }
    mainAccount.currentBalance = runningBalance;
    await mainAccount.save();

    // Expenses
    for (let i = 0; i < 10; i++) {
      await Expense.create({
        expenseCode: `EXP-${Date.now()}-${i}`,
        category: 'Operations',
        title: `Expense ${i + 1}`,
        amount: 500 + i * 100,
        expenseDate: new Date(Date.now() - i * 86400000),
        paymentMethod: 'cash',
        referenceNo: `REF-${i + 1}`,
        paidTo: 'Vendor',
        approvedBy: adminUser?._id,
        approvalStatus: i % 2 === 0 ? 'approved' : 'pending',
        remarks: 'Seed expense'
      });
    }

    console.log('Database seeding completed successfully.');
    console.log('Login credentials:');
    console.log('  Admin: admin@gmail.com / admin1234');
    console.log('  Student: student@gmail.com / student1234');
    console.log('  Teacher: teacher@gmail.com / teacher1234');
    console.log('  Staff: staff@gmail.com / staff1234');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
