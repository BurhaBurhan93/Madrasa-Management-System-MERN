const mongoose = require('mongoose');
require('dotenv').config();

const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const FeeStructure = require('./models/FeeStructure');
const StudentFee = require('./models/StudentFee');
const FeePayment = require('./models/FeePayment');
const Expense = require('./models/Expense');
const FinancialReport = require('./models/FinancialReport');
const SalaryStructure = require('./models/SalaryStructure');
const SalaryPayment = require('./models/SalaryPayment');
const SalaryAdvance = require('./models/SalaryAdvance');
const SalaryDeduction = require('./models/SalaryDeduction');
const Student = require('./models/Student');
const Employee = require('./models/Employee');
const Class = require('./models/Class');
const User = require('./models/User');

const connectDB = require('./config/db');

const seedFinancePayroll = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding Finance & Payroll tables...\n');

    // Fetch existing data for relations
    const students = await Student.find().limit(10);
    const employees = await Employee.find().limit(10);
    const classes = await Class.find().limit(10);
    const adminUser = await User.findOne({ role: 'admin' });

    if (!students.length) return console.error('❌ No students found. Run main seeder first.');
    if (!employees.length) return console.error('❌ No employees found. Run main seeder first.');

    // ========== 1. ACCOUNTS (10 records) ==========
    console.log('🏦 Seeding Accounts...');
    await Account.deleteMany({});
    const accountData = [
      { accountCode: 'ACC001', accountName: 'Main Cash Account', accountType: 'cash', openingBalance: 100000, currentBalance: 150000 },
      { accountCode: 'ACC002', accountName: 'Petty Cash', accountType: 'petty_cash', openingBalance: 5000, currentBalance: 3500 },
      { accountCode: 'ACC003', accountName: 'Fee Collection', accountType: 'cash', openingBalance: 0, currentBalance: 75000 },
      { accountCode: 'ACC004', accountName: 'Salary Account', accountType: 'cash', openingBalance: 200000, currentBalance: 180000 },
      { accountCode: 'ACC005', accountName: 'Expense Account', accountType: 'cash', openingBalance: 50000, currentBalance: 30000 },
      { accountCode: 'ACC006', accountName: 'Library Fund', accountType: 'petty_cash', openingBalance: 10000, currentBalance: 8000 },
      { accountCode: 'ACC007', accountName: 'Maintenance Fund', accountType: 'cash', openingBalance: 20000, currentBalance: 15000 },
      { accountCode: 'ACC008', accountName: 'Emergency Fund', accountType: 'cash', openingBalance: 30000, currentBalance: 30000 },
      { accountCode: 'ACC009', accountName: 'Donation Account', accountType: 'cash', openingBalance: 0, currentBalance: 25000 },
      { accountCode: 'ACC010', accountName: 'Utility Account', accountType: 'petty_cash', openingBalance: 15000, currentBalance: 12000 },
    ];
    const accounts = await Account.insertMany(accountData.map(a => ({ ...a, createdBy: adminUser?._id })));
    console.log(`✅ ${accounts.length} Accounts created\n`);

    // ========== 2. FEE STRUCTURES (10 records) ==========
    console.log('📋 Seeding Fee Structures...');
    await FeeStructure.deleteMany({});
    const feeStructureData = [
      { feeCode: 'FS001', feeName: 'Tuition Fee - Class 6', feeType: 'tuition', amount: 2000, frequency: 'monthly', isMandatory: true },
      { feeCode: 'FS002', feeName: 'Tuition Fee - Class 7', feeType: 'tuition', amount: 2200, frequency: 'monthly', isMandatory: true },
      { feeCode: 'FS003', feeName: 'Tuition Fee - Class 8', feeType: 'tuition', amount: 2400, frequency: 'monthly', isMandatory: true },
      { feeCode: 'FS004', feeName: 'Tuition Fee - Class 9', feeType: 'tuition', amount: 2600, frequency: 'monthly', isMandatory: true },
      { feeCode: 'FS005', feeName: 'Tuition Fee - Class 10', feeType: 'tuition', amount: 2800, frequency: 'monthly', isMandatory: true },
      { feeCode: 'FS006', feeName: 'Admission Fee', feeType: 'admission', amount: 5000, frequency: 'one-time', isMandatory: true },
      { feeCode: 'FS007', feeName: 'Exam Fee', feeType: 'other', amount: 1000, frequency: 'yearly', isMandatory: true },
      { feeCode: 'FS008', feeName: 'Library Fee', feeType: 'other', amount: 500, frequency: 'yearly', isMandatory: false },
      { feeCode: 'FS009', feeName: 'Sports Fee', feeType: 'other', amount: 300, frequency: 'yearly', isMandatory: false },
      { feeCode: 'FS010', feeName: 'Hifz Program Fee', feeType: 'tuition', amount: 1500, frequency: 'monthly', isMandatory: true },
    ].map((f, i) => ({ ...f, class: classes[i % classes.length]?._id, applicableFrom: new Date('2024-01-01'), status: 'active' }));
    const feeStructures = await FeeStructure.insertMany(feeStructureData);
    console.log(`✅ ${feeStructures.length} Fee Structures created\n`);

    // ========== 3. STUDENT FEES (10 records) ==========
    console.log('💰 Seeding Student Fees...');
    await StudentFee.deleteMany({});
    const studentFees = await StudentFee.insertMany(
      students.slice(0, 10).map((s, i) => ({
        student: s._id,
        feeStructure: feeStructures[i % feeStructures.length]._id,
        academicYear: '2024-2025',
        totalAmount: feeStructures[i % feeStructures.length].amount,
        discountAmount: i % 3 === 0 ? 200 : 0,
        payableAmount: feeStructures[i % feeStructures.length].amount - (i % 3 === 0 ? 200 : 0),
        dueDate: new Date(2024, i % 12, 15),
        paymentStatus: ['pending', 'paid', 'partial', 'overdue'][i % 4],
        createdBy: adminUser?._id
      }))
    );
    console.log(`✅ ${studentFees.length} Student Fees created\n`);

    // ========== 4. FEE PAYMENTS (10 records) ==========
    console.log('💳 Seeding Fee Payments...');
    await FeePayment.deleteMany({});
    const feePayments = await FeePayment.insertMany(
      studentFees.slice(0, 10).map((sf, i) => ({
        studentFee: sf._id,
        receiptNo: `RCP2024${String(i + 1).padStart(3, '0')}`,
        paymentDate: new Date(2024, i % 12, 10),
        paidAmount: sf.payableAmount,
        paymentMethod: i % 2 === 0 ? 'cash' : 'card',
        transactionReference: `TXN${Date.now()}${i}`,
        paymentStatus: 'completed',
        verificationStatus: 'verified',
        paymentChannel: 'office',
        receivedBy: adminUser?._id,
        remarks: `Payment for ${sf.academicYear}`
      }))
    );
    console.log(`✅ ${feePayments.length} Fee Payments created\n`);

    // ========== 5. TRANSACTIONS (10 records) ==========
    console.log('💵 Seeding Transactions...');
    await Transaction.deleteMany({});
    const transactions = await Transaction.insertMany(
      Array.from({ length: 10 }, (_, i) => ({
        transactionCode: `TXN2024${String(i + 1).padStart(3, '0')}`,
        account: accounts[i % accounts.length]._id,
        transactionType: i % 2 === 0 ? 'income' : 'expense',
        amount: 5000 + i * 1000,
        transactionDate: new Date(2024, i % 12, i + 1),
        referenceType: i % 2 === 0 ? 'fee_payment' : 'expense',
        description: i % 2 === 0 ? `Fee collection ${i + 1}` : `Expense payment ${i + 1}`,
        verificationStatus: 'verified',
        performedBy: adminUser?._id
      }))
    );
    console.log(`✅ ${transactions.length} Transactions created\n`);

    // ========== 6. EXPENSES (10 records) ==========
    console.log('📊 Seeding Expenses...');
    await Expense.deleteMany({});
    const expenseCategories = ['Utilities', 'Maintenance', 'Stationery', 'Transport', 'Food', 'IT', 'Cleaning', 'Security', 'Events', 'Miscellaneous'];
    const expenses = await Expense.insertMany(
      Array.from({ length: 10 }, (_, i) => ({
        expenseCode: `EXP2024${String(i + 1).padStart(3, '0')}`,
        category: expenseCategories[i],
        title: `${expenseCategories[i]} Expense ${i + 1}`,
        amount: 1000 + i * 500,
        expenseDate: new Date(2024, i % 12, i + 5),
        paymentMethod: i % 2 === 0 ? 'cash' : 'card',
        referenceNo: `REF${i + 1}`,
        paidTo: `Vendor ${i + 1}`,
        approvedBy: adminUser?._id,
        approvalStatus: i % 3 === 0 ? 'pending' : 'approved',
        remarks: `Monthly ${expenseCategories[i]} expense`
      }))
    );
    console.log(`✅ ${expenses.length} Expenses created\n`);

    // ========== 7. SALARY STRUCTURES (10 records) ==========
    console.log('📑 Seeding Salary Structures...');
    await SalaryStructure.deleteMany({});
    const salaryStructures = await SalaryStructure.insertMany([
      { employeeType: 'teacher', basicSalary: 50000, allowanceAmount: 5000, housingAllowance: 8000, foodAllowance: 2000, transportAllowance: 3000, taxPercentage: 5, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'teacher', basicSalary: 45000, allowanceAmount: 4000, housingAllowance: 7000, foodAllowance: 2000, transportAllowance: 2500, taxPercentage: 5, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'teacher', basicSalary: 55000, allowanceAmount: 6000, housingAllowance: 9000, foodAllowance: 2500, transportAllowance: 3500, taxPercentage: 5, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'staff', basicSalary: 30000, allowanceAmount: 3000, housingAllowance: 5000, foodAllowance: 1500, transportAllowance: 2000, taxPercentage: 3, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'staff', basicSalary: 28000, allowanceAmount: 2500, housingAllowance: 4500, foodAllowance: 1500, transportAllowance: 1500, taxPercentage: 3, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'admin', basicSalary: 70000, allowanceAmount: 8000, housingAllowance: 12000, foodAllowance: 3000, transportAllowance: 5000, taxPercentage: 8, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'support', basicSalary: 20000, allowanceAmount: 2000, housingAllowance: 3000, foodAllowance: 1000, transportAllowance: 1000, taxPercentage: 2, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'teacher', basicSalary: 48000, allowanceAmount: 4500, housingAllowance: 7500, foodAllowance: 2000, transportAllowance: 3000, taxPercentage: 5, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'staff', basicSalary: 32000, allowanceAmount: 3200, housingAllowance: 5500, foodAllowance: 1800, transportAllowance: 2200, taxPercentage: 3, effectiveFrom: new Date('2024-01-01') },
      { employeeType: 'support', basicSalary: 22000, allowanceAmount: 2200, housingAllowance: 3500, foodAllowance: 1200, transportAllowance: 1200, taxPercentage: 2, effectiveFrom: new Date('2024-01-01') },
    ]);
    console.log(`✅ ${salaryStructures.length} Salary Structures created\n`);

    // ========== 8. SALARY PAYMENTS (10 records) ==========
    console.log('💼 Seeding Salary Payments...');
    await SalaryPayment.deleteMany({});
    const salaryPayments = await SalaryPayment.insertMany(
      employees.slice(0, 10).map((emp, i) => {
        const gross = 40000 + i * 2000;
        const deduction = gross * 0.05;
        return {
          employee: emp._id,
          salaryMonth: (i % 12) + 1,
          salaryYear: 2024,
          grossSalary: gross,
          totalAllowance: 5000 + i * 200,
          totalDeduction: deduction,
          netSalary: gross + 5000 + i * 200 - deduction,
          paymentDate: new Date(2024, i % 12, 28),
          paymentMethod: 'bank',
          transactionReference: `SAL2024${String(i + 1).padStart(3, '0')}`,
          paymentStatus: 'paid',
          approvedBy: adminUser?._id,
          paidBy: adminUser?._id
        };
      })
    );
    console.log(`✅ ${salaryPayments.length} Salary Payments created\n`);

    // ========== 9. SALARY ADVANCES (10 records) ==========
    console.log('💸 Seeding Salary Advances...');
    await SalaryAdvance.deleteMany({});
    const salaryAdvances = await SalaryAdvance.insertMany(
      employees.slice(0, 10).map((emp, i) => ({
        employee: emp._id,
        advanceAmount: 5000 + i * 1000,
        requestDate: new Date(2024, i % 12, 5),
        approvalDate: new Date(2024, i % 12, 7),
        approvedBy: adminUser?._id,
        repaymentStartMonth: (i % 12) + 1,
        monthlyDeductionAmount: 1000,
        remainingBalance: 5000 + i * 1000,
        advanceStatus: ['pending', 'approved', 'approved', 'closed'][i % 4]
      }))
    );
    console.log(`✅ ${salaryAdvances.length} Salary Advances created\n`);

    // ========== 10. SALARY DEDUCTIONS (10 records) ==========
    console.log('📉 Seeding Salary Deductions...');
    await SalaryDeduction.deleteMany({});
    const deductionTypes = ['Tax', 'Absence', 'Late', 'Loan', 'Insurance', 'Pension', 'Advance', 'Fine', 'Other', 'Medical'];
    const salaryDeductions = await SalaryDeduction.insertMany(
      employees.slice(0, 10).map((emp, i) => ({
        employee: emp._id,
        deductionType: deductionTypes[i],
        deductionReason: `${deductionTypes[i]} deduction for month ${(i % 12) + 1}`,
        deductionAmount: 500 + i * 100,
        deductionMonth: (i % 12) + 1,
        deductionYear: 2024,
        appliedBy: adminUser?._id,
        approvedBy: adminUser?._id,
        status: i % 3 === 0 ? 'pending' : 'approved'
      }))
    );
    console.log(`✅ ${salaryDeductions.length} Salary Deductions created\n`);

    console.log('🎉 Finance & Payroll seeding completed!\n');
    console.log('📊 Summary:');
    console.log('  - Accounts:          10');
    console.log('  - Fee Structures:    10');
    console.log('  - Student Fees:      10');
    console.log('  - Fee Payments:      10');
    console.log('  - Transactions:      10');
    console.log('  - Expenses:          10');
    console.log('  - Salary Structures: 10');
    console.log('  - Salary Payments:   10');
    console.log('  - Salary Advances:   10');
    console.log('  - Salary Deductions: 10');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error.message);
    process.exit(1);
  }
};

seedFinancePayroll();
