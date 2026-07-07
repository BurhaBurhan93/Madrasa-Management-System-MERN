require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const Student = require('./models/Student');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const permissionNames = [
  'staff:registrar',
  'staff:students',
  'staff:inventory',
  'staff:library',
  'staff:complaints',
  'staff:finance',
  'staff:payroll',
  'staff:kitchen',
  'staff:hr',
];

const roleDefinitions = [
  { name: 'Administrator', description: 'Full system access', permissions: permissionNames },
  { name: 'Finance Staff', description: 'Finance module access', permissions: ['staff:finance'] },
  { name: 'Registrar Staff', description: 'Student affairs and registrar access', permissions: ['staff:registrar'] },
  { name: 'HR Staff', description: 'HR module access', permissions: ['staff:hr'] },
  { name: 'Library Staff', description: 'Library module access', permissions: ['staff:library'] },
  { name: 'Kitchen Staff', description: 'Kitchen module access', permissions: ['staff:kitchen'] },
  { name: 'Payroll Staff', description: 'Payroll module access', permissions: ['staff:payroll'] },
  { name: 'Complaints Staff', description: 'Complaints module access', permissions: ['staff:complaints'] },
  { name: 'Inventory Staff', description: 'Inventory module access', permissions: ['staff:inventory'] },
  { name: 'Support Staff', description: 'Basic support access', permissions: [] },
];

const accounts = [
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin1234',
    role: 'admin',
    roleNames: ['Administrator'],
  },
  {
    name: 'Student User',
    email: 'student@gmail.com',
    password: 'student1234',
    role: 'student',
    studentCode: 'STU2024001',
  },
  {
    name: 'Teacher User',
    email: 'teacher@gmail.com',
    password: 'teacher1234',
    role: 'teacher',
    employeeCode: 'EMP2024001',
    employeeType: 'teacher',
  },
  {
    name: 'Staff User',
    email: 'staff@gmail.com',
    password: 'staff1234',
    role: 'staff',
    roleNames: ['Support Staff'],
    employeeCode: 'EMP2024002',
    employeeType: 'support',
  },
  {
    name: 'Finance Staff',
    email: 'finance@gmail.com',
    password: 'finance1234',
    role: 'staff',
    roleNames: ['Finance Staff'],
    employeeCode: 'EMP2024003',
    employeeType: 'finance',
  },
  {
    name: 'Registrar Staff',
    email: 'registrar@gmail.com',
    password: 'registrar1234',
    role: 'staff',
    roleNames: ['Registrar Staff'],
    employeeCode: 'EMP2024004',
    employeeType: 'registrar',
  },
  {
    name: 'HR Staff',
    email: 'hr@gmail.com',
    password: 'hr1234',
    role: 'staff',
    roleNames: ['HR Staff'],
    employeeCode: 'EMP2024005',
    employeeType: 'hr',
  },
  {
    name: 'Library Staff',
    email: 'library@gmail.com',
    password: 'library1234',
    role: 'staff',
    roleNames: ['Library Staff'],
    employeeCode: 'EMP2024006',
    employeeType: 'librarian',
  },
  {
    name: 'Kitchen Staff',
    email: 'kitchen@gmail.com',
    password: 'kitchen1234',
    role: 'staff',
    roleNames: ['Kitchen Staff'],
    employeeCode: 'EMP2024007',
    employeeType: 'kitchen',
  },
  {
    name: 'Payroll Staff',
    email: 'payroll@gmail.com',
    password: 'payroll1234',
    role: 'staff',
    roleNames: ['Payroll Staff'],
    employeeCode: 'EMP2024008',
    employeeType: 'payroll',
  },
  {
    name: 'Complaints Staff',
    email: 'complaints@gmail.com',
    password: 'complaints1234',
    role: 'staff',
    roleNames: ['Complaints Staff'],
    employeeCode: 'EMP2024009',
    employeeType: 'complaints',
  },
  {
    name: 'Inventory Staff',
    email: 'inventory@gmail.com',
    password: 'inventory1234',
    role: 'staff',
    roleNames: ['Inventory Staff'],
    employeeCode: 'EMP2024010',
    employeeType: 'inventory',
  },
  {
    name: 'All Staff Modules',
    email: 'staff.all@gmail.com',
    password: 'staffall1234',
    role: 'staff',
    roleNames: ['Administrator'],
    employeeCode: 'EMP2024011',
    employeeType: 'admin',
  },
];

const upsertPermissions = async () => {
  const permissionMap = new Map();

  for (const name of permissionNames) {
    const permission = await Permission.findOneAndUpdate(
      { name },
      { $set: { name, description: `Allows access to ${name.replace('staff:', '')} staff module` } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    permissionMap.set(name, permission);
  }

  return permissionMap;
};

const upsertRoles = async (permissionMap) => {
  const roleMap = new Map();

  for (const definition of roleDefinitions) {
    const role = await Role.findOneAndUpdate(
      { name: definition.name },
      {
        $set: {
          name: definition.name,
          description: definition.description,
          permissions: definition.permissions.map((name) => permissionMap.get(name)._id),
          deletedAt: null,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    roleMap.set(definition.name, role);
  }

  return roleMap;
};

const upsertAccount = async (account, roleMap) => {
  const password = await bcrypt.hash(account.password, 10);
  const roleIds = (account.roleNames || []).map((name) => roleMap.get(name)?._id).filter(Boolean);

  const user = await User.findOneAndUpdate(
    { email: account.email },
    {
      $set: {
        name: account.name,
        email: account.email,
        password,
        role: account.role,
        roles: roleIds,
        status: 'active',
        deletedAt: null,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  if (account.role === 'student') {
    await Student.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          firstName: account.name,
          email: account.email,
          studentCode: account.studentCode,
          admissionDate: new Date(),
          status: 'active',
          deletedAt: null,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  if (account.role === 'teacher' || account.role === 'staff') {
    await Employee.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          employeeCode: account.employeeCode,
          fullName: account.name,
          gender: 'male',
          phoneNumber: 'N/A',
          email: account.email,
          employeeType: account.employeeType,
          joiningDate: new Date(),
          baseSalary: 0,
          status: 'active',
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  return user;
};

const run = async () => {
  if (!MONGO_URI) {
    throw new Error('Missing MONGODB_URI or MONGO_URI in server/.env');
  }

  await mongoose.connect(MONGO_URI);
  console.log('[seedAtlasAccounts] Connected to MongoDB Atlas');

  const permissionMap = await upsertPermissions();
  const roleMap = await upsertRoles(permissionMap);

  for (const account of accounts) {
    await upsertAccount(account, roleMap);
    console.log(`[seedAtlasAccounts] Upserted ${account.role}: ${account.email} / ${account.password}`);
  }

  await mongoose.disconnect();
  console.log('[seedAtlasAccounts] Done');
};

run().catch(async (error) => {
  console.error('[seedAtlasAccounts] Failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
