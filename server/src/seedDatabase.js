const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('./models/User');
const Student = require('./models/Student');
const Employee = require('./models/Employee');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Book = require('./models/Book');
const BookCategory = require('./models/BookCategory');
const BorrowedBook = require('./models/BorrowedBook');
const Complaint = require('./models/Complaint');
const FeeStructure = require('./models/FeeStructure');
const FeePayment = require('./models/FeePayment');
const Exam = require('./models/Exam');
const ExamType = require('./models/ExamType');
const AttendanceRecord = require('./models/AttendanceRecord');
const Assignment = require('./models/Assignment');
const Transaction = require('./models/Transaction');
const Expense = require('./models/Expense');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data to avoid conflicts
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Employee.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ========== 1. ROLES & PERMISSIONS ==========
    console.log('📋 Seeding Roles and Permissions...');
    const roles = ['admin', 'student', 'teacher', 'staff'];
    for (let i = 0; i < roles.length; i++) {
      await Role.findOneAndUpdate(
        { name: roles[i] },
        { name: roles[i], description: `${roles[i]} role` },
        { upsert: true }
      );
    }
    console.log('✅ Roles created\n');

    // ========== 2. USERS (10 records) ==========
    console.log('👥 Seeding Users...');
    const userData = [
      { name: 'Admin User', email: 'admin@gmail.com', password: 'admin1234', role: 'admin' },
      { name: 'Student Demo', email: 'student@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Student Two', email: 'student2@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Student Three', email: 'student3@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Teacher Demo', email: 'teacher@gmail.com', password: 'teacher1234', role: 'teacher' },
      { name: 'Teacher Two', email: 'teacher2@gmail.com', password: 'teacher1234', role: 'teacher' },
      { name: 'Staff Demo', email: 'staff@gmail.com', password: 'staff1234', role: 'staff' },
      { name: 'Staff Two', email: 'staff2@gmail.com', password: 'staff1234', role: 'staff' },
      { name: 'Student Four', email: 'student4@gmail.com', password: 'student1234', role: 'student' },
      { name: 'Teacher Three', email: 'teacher3@gmail.com', password: 'teacher1234', role: 'teacher' }
    ];

    const createdUsers = [];
    for (const user of userData) {
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await User.create({
          ...user,
          password: hashedPassword
        });
        createdUsers.push(newUser);
      } else {
        createdUsers.push(existing);
      }
    }
    console.log(`✅ ${createdUsers.length} Users created\n`);

    // ========== 3. STUDENTS (10 records) ==========
    console.log('🎓 Seeding Students...');
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    const studentData = [
      { studentId: 'STU2024001', class: 'Class 10', section: 'A', rollNumber: '101' },
      { studentId: 'STU2024002', class: 'Class 9', section: 'B', rollNumber: '102' },
      { studentId: 'STU2024003', class: 'Class 10', section: 'A', rollNumber: '103' },
      { studentId: 'STU2024004', class: 'Class 8', section: 'C', rollNumber: '104' },
      { studentId: 'STU2024005', class: 'Class 11', section: 'A', rollNumber: '105' },
      { studentId: 'STU2024006', class: 'Class 9', section: 'A', rollNumber: '106' },
      { studentId: 'STU2024007', class: 'Class 10', section: 'B', rollNumber: '107' },
      { studentId: 'STU2024008', class: 'Class 12', section: 'A', rollNumber: '108' },
      { studentId: 'STU2024009', class: 'Class 8', section: 'B', rollNumber: '109' },
      { studentId: 'STU2024010', class: 'Class 11', section: 'B', rollNumber: '110' }
    ];

    const createdStudents = [];
    for (let i = 0; i < Math.min(studentUsers.length, studentData.length); i++) {
      const existing = await Student.findOne({ userId: studentUsers[i]._id });
      if (!existing) {
        const student = await Student.create({
          userId: studentUsers[i]._id,
          ...studentData[i],
          enrollmentDate: new Date(2024, 0, 15),
          status: 'active',
          guardianName: `Guardian ${i + 1}`,
          guardianPhone: `+123456789${i}`,
          address: `Address ${i + 1}, City`
        });
        createdStudents.push(student);
      }
    }
    console.log(`✅ ${createdStudents.length} Students created\n`);

    // ========== 4. EMPLOYEES (Teachers & Staff - 10 records) ==========
    console.log('👔 Seeding Employees...');
    const employeeUsers = createdUsers.filter(u => u.role === 'teacher' || u.role === 'staff');
    const employeeData = [
      { employeeId: 'EMP2024001', department: 'Mathematics', designation: 'Senior Teacher', type: 'teacher' },
      { employeeId: 'EMP2024002', department: 'Science', designation: 'Teacher', type: 'teacher' },
      { employeeId: 'EMP2024003', department: 'Library', designation: 'Librarian', type: 'staff' },
      { employeeId: 'EMP2024004', department: 'Administration', designation: 'Admin Staff', type: 'staff' },
      { employeeId: 'EMP2024005', department: 'English', designation: 'Teacher', type: 'teacher' },
      { employeeId: 'EMP2024006', department: 'Accounts', designation: 'Accountant', type: 'staff' },
      { employeeId: 'EMP2024007', department: 'IT', designation: 'IT Staff', type: 'staff' },
      { employeeId: 'EMP2024008', department: 'Physics', designation: 'Teacher', type: 'teacher' },
      { employeeId: 'EMP2024009', department: 'Administration', designation: 'Office Staff', type: 'staff' },
      { employeeId: 'EMP2024010', department: 'Chemistry', designation: 'Teacher', type: 'teacher' }
    ];

    const createdEmployees = [];
    for (let i = 0; i < Math.min(employeeUsers.length, employeeData.length); i++) {
      const existing = await Employee.findOne({ userId: employeeUsers[i]._id });
      if (!existing) {
        const employee = await Employee.create({
          userId: employeeUsers[i]._id,
          ...employeeData[i],
          joinDate: new Date(2023, 5, 1),
          status: 'active',
          salary: 50000 + (i * 5000),
          phone: `+987654321${i}`
        });
        createdEmployees.push(employee);
      }
    }
    console.log(`✅ ${createdEmployees.length} Employees created\n`);

    // ========== 5. CLASSES (10 records) ==========
    console.log('🏫 Seeding Classes...');
    const classData = [
      { name: 'Class 6', section: 'A', capacity: 40 },
      { name: 'Class 6', section: 'B', capacity: 40 },
      { name: 'Class 7', section: 'A', capacity: 40 },
      { name: 'Class 8', section: 'A', capacity: 40 },
      { name: 'Class 8', section: 'B', capacity: 40 },
      { name: 'Class 9', section: 'A', capacity: 45 },
      { name: 'Class 10', section: 'A', capacity: 45 },
      { name: 'Class 10', section: 'B', capacity: 45 },
      { name: 'Class 11', section: 'A', capacity: 35 },
      { name: 'Class 12', section: 'A', capacity: 35 }
    ];

    const createdClasses = [];
    for (let i = 0; i < classData.length; i++) {
      const existing = await Class.findOne({ name: classData[i].name, section: classData[i].section });
      if (!existing) {
        const newClass = await Class.create({
          ...classData[i],
          academicYear: '2024-2025',
          classTeacher: createdEmployees[i % createdEmployees.length]?._id
        });
        createdClasses.push(newClass);
      }
    }
    console.log(`✅ ${createdClasses.length} Classes created\n`);

    // ========== 6. SUBJECTS (10 records) ==========
    console.log('📚 Seeding Subjects...');
    const subjectData = [
      { name: 'Mathematics', code: 'MATH101', description: 'Basic Mathematics' },
      { name: 'Physics', code: 'PHY101', description: 'General Physics' },
      { name: 'Chemistry', code: 'CHEM101', description: 'General Chemistry' },
      { name: 'Biology', code: 'BIO101', description: 'General Biology' },
      { name: 'English', code: 'ENG101', description: 'English Language' },
      { name: 'Urdu', code: 'URD101', description: 'Urdu Language' },
      { name: 'Islamic Studies', code: 'ISL101', description: 'Islamic Education' },
      { name: 'Computer Science', code: 'CS101', description: 'Computer Studies' },
      { name: 'History', code: 'HIS101', description: 'World History' },
      { name: 'Geography', code: 'GEO101', description: 'World Geography' }
    ];

    const createdSubjects = [];
    for (const subj of subjectData) {
      const existing = await Subject.findOne({ code: subj.code });
      if (!existing) {
        const newSubject = await Subject.create({
          ...subj,
          credits: 3,
          isActive: true
        });
        createdSubjects.push(newSubject);
      }
    }
    console.log(`✅ ${createdSubjects.length} Subjects created\n`);

    // ========== 7. BOOK CATEGORIES (10 records) ==========
    console.log('📂 Seeding Book Categories...');
    const categoryData = [
      { name: 'Islamic Studies', description: 'Quran, Hadith, Fiqh books' },
      { name: 'Science', description: 'Physics, Chemistry, Biology' },
      { name: 'Mathematics', description: 'Math textbooks and references' },
      { name: 'Literature', description: 'English and Urdu literature' },
      { name: 'History', description: 'Islamic and World history' },
      { name: 'Computer Science', description: 'Programming and IT books' },
      { name: 'Reference', description: 'Dictionaries and encyclopedias' },
      { name: 'Fiction', description: 'Novels and stories' },
      { name: 'Biography', description: 'Life stories of notable people' },
      { name: 'Academic', description: 'General academic resources' }
    ];

    const createdCategories = [];
    for (const cat of categoryData) {
      const existing = await BookCategory.findOne({ name: cat.name });
      if (!existing) {
        const newCat = await BookCategory.create(cat);
        createdCategories.push(newCat);
      }
    }
    console.log(`✅ ${createdCategories.length} Book Categories created\n`);

    // ========== 8. BOOKS (10 records) ==========
    console.log('📖 Seeding Books...');
    const bookData = [
      { title: 'Sahih Bukhari', author: 'Imam Bukhari', isbn: '978-1234567890', quantity: 5 },
      { title: 'Physics for Class 10', author: 'Dr. Ahmed Khan', isbn: '978-1234567891', quantity: 20 },
      { title: 'Mathematics Part I', author: 'Prof. Rahim', isbn: '978-1234567892', quantity: 25 },
      { title: 'English Grammar', author: 'John Smith', isbn: '978-1234567893', quantity: 15 },
      { title: 'Islamic History', author: 'Dr. Fatima Ali', isbn: '978-1234567894', quantity: 10 },
      { title: 'Computer Programming', author: 'David Johnson', isbn: '978-1234567895', quantity: 12 },
      { title: 'Oxford Dictionary', author: 'Oxford Press', isbn: '978-1234567896', quantity: 8 },
      { title: 'Urdu Poetry Collection', author: 'Mirza Ghalib', isbn: '978-1234567897', quantity: 15 },
      { title: 'Chemistry Lab Manual', author: 'Dr. Sarah Ahmad', isbn: '978-1234567898', quantity: 18 },
      { title: 'Biology Textbook', author: 'Prof. Michael Chen', isbn: '978-1234567899', quantity: 22 }
    ];

    const createdBooks = [];
    for (let i = 0; i < bookData.length; i++) {
      const existing = await Book.findOne({ isbn: bookData[i].isbn });
      if (!existing) {
        const newBook = await Book.create({
          ...bookData[i],
          category: createdCategories[i % createdCategories.length]._id,
          publisher: 'Madrasa Publications',
          publishYear: 2023,
          available: bookData[i].quantity
        });
        createdBooks.push(newBook);
      }
    }
    console.log(`✅ ${createdBooks.length} Books created\n`);

    // ========== 9. BORROWED BOOKS (10 records) ==========
    console.log('📤 Seeding Borrowed Books...');
    const borrowData = [
      { studentId: 0, bookId: 0, daysAgo: 5 },
      { studentId: 1, bookId: 1, daysAgo: 10 },
      { studentId: 2, bookId: 2, daysAgo: 3 },
      { studentId: 3, bookId: 3, daysAgo: 15 },
      { studentId: 0, bookId: 4, daysAgo: 7 },
      { studentId: 1, bookId: 5, daysAgo: 12 },
      { studentId: 2, bookId: 6, daysAgo: 2 },
      { studentId: 3, bookId: 7, daysAgo: 20 },
      { studentId: 0, bookId: 8, daysAgo: 8 },
      { studentId: 1, bookId: 9, daysAgo: 4 }
    ];

    let borrowedCount = 0;
    for (const borrow of borrowData) {
      if (createdStudents[borrow.studentId] && createdBooks[borrow.bookId]) {
        const existing = await BorrowedBook.findOne({
          student: createdStudents[borrow.studentId]._id,
          book: createdBooks[borrow.bookId]._id,
          status: 'borrowed'
        });
        if (!existing) {
          await BorrowedBook.create({
            student: createdStudents[borrow.studentId]._id,
            book: createdBooks[borrow.bookId]._id,
            borrowDate: new Date(Date.now() - borrow.daysAgo * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + (14 - borrow.daysAgo) * 24 * 60 * 60 * 1000),
            status: 'borrowed'
          });
          borrowedCount++;
        }
      }
    }
    console.log(`✅ ${borrowedCount} Borrowed Books created\n`);

    // ========== 10. FEE STRUCTURE (10 records) ==========
    console.log('💰 Seeding Fee Structure...');
    const feeData = [
      { className: 'Class 6', tuitionFee: 2000, admissionFee: 5000, examFee: 1000 },
      { className: 'Class 7', tuitionFee: 2200, admissionFee: 5500, examFee: 1100 },
      { className: 'Class 8', tuitionFee: 2400, admissionFee: 6000, examFee: 1200 },
      { className: 'Class 9', tuitionFee: 2600, admissionFee: 6500, examFee: 1300 },
      { className: 'Class 10', tuitionFee: 2800, admissionFee: 7000, examFee: 1400 },
      { className: 'Class 11', tuitionFee: 3000, admissionFee: 7500, examFee: 1500 },
      { className: 'Class 12', tuitionFee: 3200, admissionFee: 8000, examFee: 1600 },
      { className: 'Hifz Program', tuitionFee: 1500, admissionFee: 4000, examFee: 800 },
      { className: 'Qiraat Course', tuitionFee: 1800, admissionFee: 4500, examFee: 900 },
      { className: 'Alim Course', tuitionFee: 2500, admissionFee: 6000, examFee: 1200 }
    ];

    const createdFeeStructures = [];
    for (const fee of feeData) {
      const existing = await FeeStructure.findOne({ className: fee.className, academicYear: '2024-2025' });
      if (!existing) {
        const newFee = await FeeStructure.create({
          ...fee,
          academicYear: '2024-2025',
          totalFee: fee.tuitionFee * 12 + fee.admissionFee + fee.examFee
        });
        createdFeeStructures.push(newFee);
      }
    }
    console.log(`✅ ${createdFeeStructures.length} Fee Structures created\n`);

    // ========== 11. FEE PAYMENTS (10 records) ==========
    console.log('💳 Seeding Fee Payments...');
    const paymentStatuses = ['paid', 'pending', 'partial'];
    for (let i = 0; i < 10; i++) {
      if (createdStudents[i]) {
        const existing = await FeePayment.findOne({ student: createdStudents[i]._id, month: (i % 12) + 1 });
        if (!existing) {
          await FeePayment.create({
            student: createdStudents[i]._id,
            amount: 2000 + (i * 100),
            month: (i % 12) + 1,
            year: 2024,
            status: paymentStatuses[i % 3],
            paymentDate: i % 3 === 0 ? new Date() : null,
            paymentMethod: i % 3 === 0 ? 'cash' : null
          });
        }
      }
    }
    console.log(`✅ Fee Payments created\n`);

    // ========== 12. EXAM TYPES (5 records) ==========
    console.log('📝 Seeding Exam Types...');
    const examTypes = [
      { name: 'Midterm Exam', description: 'Mid-year examination' },
      { name: 'Final Exam', description: 'End of year examination' },
      { name: 'Quiz', description: 'Weekly quiz test' },
      { name: 'Unit Test', description: 'Chapter-wise test' },
      { name: 'Practical', description: 'Lab practical exam' }
    ];

    const createdExamTypes = [];
    for (const type of examTypes) {
      const existing = await ExamType.findOne({ name: type.name });
      if (!existing) {
        const newType = await ExamType.create(type);
        createdExamTypes.push(newType);
      }
    }
    console.log(`✅ ${createdExamTypes.length} Exam Types created\n`);

    // ========== 13. EXAMS (10 records) ==========
    console.log('🧪 Seeding Exams...');
    const examData = [
      { name: 'Midterm 2024', type: 0 },
      { name: 'Final Exam 2024', type: 1 },
      { name: 'Math Quiz 1', type: 2 },
      { name: 'Physics Practical', type: 4 },
      { name: 'Chemistry Unit Test', type: 3 },
      { name: 'English Quiz', type: 2 },
      { name: 'Biology Practical', type: 4 },
      { name: 'Urdu Test', type: 3 },
      { name: 'Islamic Studies Quiz', type: 2 },
      { name: 'Computer Science Test', type: 0 }
    ];

    const createdExams = [];
    for (let i = 0; i < examData.length; i++) {
      const existing = await Exam.findOne({ name: examData[i].name });
      if (!existing) {
        const newExam = await Exam.create({
          name: examData[i].name,
          examType: createdExamTypes[examData[i].type]?._id,
          subject: createdSubjects[i % createdSubjects.length]._id,
          class: createdClasses[i % createdClasses.length]._id,
          date: new Date(2024, i % 12, 15 + (i % 15)),
          totalMarks: 100,
          duration: 120,
          status: i < 5 ? 'completed' : 'upcoming'
        });
        createdExams.push(newExam);
      }
    }
    console.log(`✅ ${createdExams.length} Exams created\n`);

    // ========== 14. ASSIGNMENTS (10 records) ==========
    console.log('📋 Seeding Assignments...');
    const assignmentData = [
      { title: 'Math Problem Set 1', subject: 0 },
      { title: 'Physics Lab Report', subject: 1 },
      { title: 'Chemistry Equations', subject: 2 },
      { title: 'Biology Diagram Drawing', subject: 3 },
      { title: 'English Essay Writing', subject: 4 },
      { title: 'Urdu Poetry Analysis', subject: 5 },
      { title: 'Islamic Studies Research', subject: 6 },
      { title: 'Programming Exercise', subject: 7 },
      { title: 'History Timeline', subject: 8 },
      { title: 'Geography Map Work', subject: 9 }
    ];

    for (let i = 0; i < assignmentData.length; i++) {
      const existing = await Assignment.findOne({ title: assignmentData[i].title });
      if (!existing) {
        await Assignment.create({
          title: assignmentData[i].title,
          subject: createdSubjects[assignmentData[i].subject]._id,
          class: createdClasses[i % createdClasses.length]._id,
          teacher: createdEmployees[i % createdEmployees.length]._id,
          description: `Complete the ${assignmentData[i].title}`,
          dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          totalMarks: 20 + (i * 2),
          status: 'active'
        });
      }
    }
    console.log(`✅ Assignments created\n`);

    // ========== 15. ATTENDANCE RECORDS (10 records) ==========
    console.log('📅 Seeding Attendance Records...');
    const attendanceStatuses = ['present', 'absent', 'late', 'excused'];
    for (let i = 0; i < 10; i++) {
      if (createdStudents[i]) {
        await AttendanceRecord.create({
          student: createdStudents[i]._id,
          class: createdClasses[i % createdClasses.length]._id,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          status: attendanceStatuses[i % 4],
          subject: createdSubjects[i % createdSubjects.length]._id
        });
      }
    }
    console.log(`✅ Attendance Records created\n`);

    // ========== 16. COMPLAINTS (10 records) ==========
    console.log('📢 Seeding Complaints...');
    const complaintData = [
      { title: 'Library book not available', category: 'Library', priority: 'medium' },
      { title: 'Classroom AC not working', category: 'Facilities', priority: 'high' },
      { title: 'Fee payment issue', category: 'Finance', priority: 'high' },
      { title: 'Teacher absent frequently', category: 'Academic', priority: 'medium' },
      { title: 'Canteen food quality', category: 'Facilities', priority: 'low' },
      { title: 'Bus timing issue', category: 'Transport', priority: 'medium' },
      { title: 'Exam schedule conflict', category: 'Academic', priority: 'high' },
      { title: 'Sports equipment needed', category: 'Facilities', priority: 'low' },
      { title: 'Internet connectivity', category: 'IT', priority: 'medium' },
      { title: 'Cleanliness issue', category: 'Facilities', priority: 'low' }
    ];

    const complaintStatuses = ['pending', 'in-progress', 'resolved'];
    for (let i = 0; i < complaintData.length; i++) {
      const existing = await Complaint.findOne({ title: complaintData[i].title });
      if (!existing) {
        await Complaint.create({
          ...complaintData[i],
          description: `This is a complaint about ${complaintData[i].title}`,
          submittedBy: createdStudents[i % createdStudents.length]?._id || createdUsers[0]._id,
          status: complaintStatuses[i % 3],
          submittedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        });
      }
    }
    console.log(`✅ Complaints created\n`);

    // ========== 17. TRANSACTIONS (10 records) ==========
    console.log('💵 Seeding Transactions...');
    const transactionTypes = ['income', 'expense'];
    const transactionCategories = ['Fee Collection', 'Salary', 'Books', 'Maintenance', 'Utilities', 'Equipment'];
    for (let i = 0; i < 10; i++) {
      await Transaction.create({
        type: transactionTypes[i % 2],
        category: transactionCategories[i % 6],
        amount: 10000 + (i * 5000),
        description: `Transaction ${i + 1} for ${transactionCategories[i % 6]}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        status: 'completed'
      });
    }
    console.log(`✅ Transactions created\n`);

    // ========== 18. EXPENSES (10 records) ==========
    console.log('📊 Seeding Expenses...');
    const expenseCategories = ['Salaries', 'Utilities', 'Maintenance', 'Books', 'Stationery', 'Events', 'Transport', 'Medical', 'Miscellaneous'];
    for (let i = 0; i < 10; i++) {
      await Expense.create({
        category: expenseCategories[i % 9],
        amount: 5000 + (i * 3000),
        description: `Expense for ${expenseCategories[i % 9]}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        approvedBy: createdEmployees[i % createdEmployees.length]?._id,
        status: i % 3 === 0 ? 'pending' : 'approved'
      });
    }
    console.log(`✅ Expenses created\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Roles: 4');
    console.log('  - Users: 10');
    console.log('  - Students: 10');
    console.log('  - Employees: 10');
    console.log('  - Classes: 10');
    console.log('  - Subjects: 10');
    console.log('  - Book Categories: 10');
    console.log('  - Books: 10');
    console.log('  - Borrowed Books: 10');
    console.log('  - Fee Structures: 10');
    console.log('  - Fee Payments: 10');
    console.log('  - Exam Types: 5');
    console.log('  - Exams: 10');
    console.log('  - Assignments: 10');
    console.log('  - Attendance Records: 10');
    console.log('  - Complaints: 10');
    console.log('  - Transactions: 10');
    console.log('  - Expenses: 10');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedDatabase;
