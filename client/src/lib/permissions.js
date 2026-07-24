/**
 * Unified Permission System for Madrasa EMIS
 *
 * Central source of truth for all role-based access control across panels.
 * Import this file wherever you need to check permissions.
 */

import { getUser } from './auth';

/* ──────────────────────────────────────────
   0. PANEL ACCESS MAP
   Shows exactly which roles can access which panel routes.
   Used by ProtectedRoute and sidebar rendering.
   ────────────────────────────────────────── */

export const PANEL_ACCESS = {
  admin: {
    panel: '/admin',
    label: 'Admin Panel',
    allowedRoles: ['admin'],
    landingRoute: '/admin/dashboard',
    modules: [
      'dashboard', 'users', 'students', 'teachers', 'staff',
      'academic', 'classes', 'subjects', 'exams', 'timetable', 'degrees', 'syllabus', 'grading',
      'attendance',
      'finance', 'feeStructure', 'payments', 'expenses', 'salaries', 'accounts', 'transactions',
      'library', 'books', 'categories', 'borrowedBooks', 'purchases', 'sales',
      'complaints', 'hostel', 'hr', 'kitchen',
      'reports', 'settings', 'profile',
    ],
  },
  staff: {
    panel: '/staff',
    label: 'Staff Panel',
    allowedRoles: ['staff'],
    landingRoute: '/staff/dashboard',
    modules: [
      'dashboard', 'registrar', 'students', 'hostel',
      'library', 'books', 'categories', 'borrowedBooks', 'purchases', 'sales',
      'complaints',
      'finance', 'transactions', 'accounts', 'feeStructure', 'payments', 'expenses',
      'payroll', 'salaryStructures', 'salaryPayments', 'salaryDeductions', 'salaryAdvances',
      'kitchen', 'inventory', 'mealPlan', 'weeklyMenu', 'suppliers', 'waste',
      'hr', 'departments', 'designations', 'employees', 'attendance', 'leave',
      'reports', 'profile',
    ],
  },
  teacher: {
    panel: '/teacher',
    label: 'Teacher Panel',
    allowedRoles: ['teacher'],
    landingRoute: '/teacher',
    modules: [
      'dashboard', 'subjects', 'students', 'assignments',
      'attendance', 'attendanceReports',
      'exams', 'results',
      'communications', 'complaints', 'profile',
    ],
  },
  student: {
    panel: '/student',
    label: 'Student Panel',
    allowedRoles: ['student'],
    landingRoute: '/student/dashboard',
    modules: [
      'dashboard', 'courses', 'schedule', 'attendance', 'exams', 'examResults',
      'timetable', 'results', 'degrees', 'eduHistory',
      'assignments', 'homeworkSubmission',
      'library', 'resources', 'borrowedBooks', 'purchaseHistory',
      'finance', 'fees', 'transactionHistory',
      'hostel', 'leave',
      'communications', 'complaints', 'certificates', 'events',
      'profile', 'settings',
    ],
  },
};

/**
 * Check if a role can access a specific panel.
 * @param {string} panelKey - 'admin' | 'staff' | 'teacher' | 'student'
 * @param {string} [role] - role to check; defaults to current user's role
 * @returns {boolean}
 */
export const canAccessPanel = (panelKey, role) => {
  const userRole = role || getUser()?.role;
  if (!userRole) return false;
  const panel = PANEL_ACCESS[panelKey];
  return panel ? panel.allowedRoles.includes(userRole) : false;
};

/**
 * Get the landing route for a given role.
 */
export const getLandingRoute = (role) => {
  const entry = Object.values(PANEL_ACCESS).find((p) => p.allowedRoles.includes(role));
  return entry?.landingRoute || '/';
};

/**
 * Get all panel keys accessible by a role.
 */
export const getAccessiblePanels = (role) => {
  return Object.entries(PANEL_ACCESS)
    .filter(([, p]) => p.allowedRoles.includes(role))
    .map(([key]) => key);
};

/* ──────────────────────────────────────────
   1. ROLE → CAPABILITY MAP
   Each capability is a boolean or an object of granular CRUD flags.
   ────────────────────────────────────────── */

const ROLE_PERMISSIONS = {
  admin: {
    // Admin has full access to everything
    dashboard: true,
    users: { view: true, create: true, edit: true, delete: true },
    students: { view: true, create: true, edit: true, delete: true },
    teachers: { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true, delete: true },
    academic: { view: true, create: true, edit: true, delete: true },
    classes: { view: true, create: true, edit: true, delete: true },
    subjects: { view: true, create: true, edit: true, delete: true },
    exams: { view: true, create: true, edit: true, delete: true },
    timetable: { view: true, create: true, edit: true, delete: true },
    degrees: { view: true, create: true, edit: true, delete: true },
    syllabus: { view: true, create: true, edit: true, delete: true },
    grading: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true },
    feeStructure: { view: true, create: true, edit: true, delete: true },
    payments: { view: true, create: true, edit: true, delete: true },
    expenses: { view: true, create: true, edit: true, delete: true },
    salaries: { view: true, create: true, edit: true, delete: true },
    accounts: { view: true, create: true, edit: true, delete: true },
    transactions: { view: true, create: true, edit: true, delete: true },
    library: { view: true, create: true, edit: true, delete: true },
    books: { view: true, create: true, edit: true, delete: true },
    categories: { view: true, create: true, edit: true, delete: true },
    borrowedBooks: { view: true, create: true, edit: true, delete: true },
    purchases: { view: true, create: true, edit: true, delete: true },
    sales: { view: true, create: true, edit: true, delete: true },
    complaints: { view: true, create: true, edit: true, delete: true },
    hostel: { view: true, create: true, edit: true, delete: true },
    hr: { view: true, create: true, edit: true, delete: true },
    kitchen: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true },
    profile: true,
  },

  staff: {
    // Staff access is further refined by staffModules in user object
    dashboard: true,
    profile: true,
    students: { view: true, create: true, edit: true, delete: false },
    academic: { view: true, create: false, edit: false, delete: false },
    attendance: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: true, edit: true, delete: false },
    library: { view: true, create: true, edit: true, delete: false },
    complaints: { view: true, create: true, edit: true, delete: false },
    hostel: { view: true, create: true, edit: true, delete: false },
    kitchen: { view: true, create: true, edit: true, delete: false },
    hr: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: false },
    settings: false,
    users: { view: true, create: true, edit: false, delete: false },
  },

  teacher: {
    dashboard: true,
    profile: true,
    students: { view: true, create: false, edit: false, delete: false },
    subjects: { view: true, create: false, edit: false, delete: false },
    exams: { view: true, create: true, edit: true, delete: false },
    assignments: { view: true, create: true, edit: true, delete: false },
    attendance: { view: true, create: true, edit: true, delete: false },
    results: { view: true, create: true, edit: true, delete: false },
    complaints: { view: true, create: false, edit: true, delete: false },
    reports: false,
    finance: false,
    library: false,
    hostel: false,
    kitchen: false,
    hr: false,
    settings: false,
    users: false,
  },

  student: {
    dashboard: true,
    profile: { view: true, create: false, edit: true, delete: false },
    courses: { view: true },
    attendance: { view: true },
    assignments: { view: true, create: true },
    exams: { view: true },
    results: { view: true },
    fees: { view: true },
    library: { view: true },
    complaints: { view: true, create: true },
    timetable: { view: true },
    schedule: { view: true },
    hostel: { view: true },
    leave: { view: true, create: true },
    settings: true,
    certificates: { view: true },
    events: { view: true },
    communications: { view: true, create: true },
    // Students cannot manage admin/teacher/staff features
    academic: false,
    finance: false,
    hr: false,
    kitchen: false,
    users: false,
    staff: false,
  },
};

/* ──────────────────────────────────────────
   2. PUBLIC API
   ────────────────────────────────────────── */

/**
 * Get the full permissions object for a given role.
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || {};
};

/**
 * Get permissions for the currently logged-in user.
 */
export const getCurrentPermissions = () => {
  const user = getUser();
  if (!user) return {};
  return getRolePermissions(user.role);
};

/**
 * Check if a role (or current user) has a specific permission.
 * @param {string} module - e.g. 'students', 'finance', 'complaints'
 * @param {string} [action] - e.g. 'view', 'create', 'edit', 'delete'
 * @returns {boolean}
 */
export const canDo = (module, action) => {
  const user = getUser();
  if (!user) return false;

  // A general manager is a staff user with responsibility for every staff
  // workspace.  Their account role remains "staff", so handle this before
  // the normal staff capability map (which intentionally limits departments).
  const employeeType = String(user.employeeType || '').trim().toLowerCase();
  const staffRoleNames = Array.isArray(user.staffRoleNames)
    ? user.staffRoleNames.map((name) => String(name).trim().toLowerCase())
    : [];
  const isGeneralManager = user.role === 'staff' &&
    (employeeType === 'general-manager' || employeeType === 'general manager' ||
      staffRoleNames.includes('general-manager') || staffRoleNames.includes('general manager'));
  if (isGeneralManager) return true;

  const perms = getRolePermissions(user.role);

  // Staff module-level gating
  if (user.role === 'staff' && Array.isArray(user.staffModules)) {
    const staffModuleMap = {
      students: 'students',
      academic: 'registrar',
      classes: 'registrar',
      subjects: 'registrar',
      attendance: 'registrar',
      finance: 'finance',
      feeStructure: 'finance',
      payments: 'finance',
      expenses: 'finance',
      salaries: 'payroll',
      accounts: 'finance',
      transactions: 'finance',
      library: 'library',
      books: 'library',
      categories: 'library',
      borrowedBooks: 'library',
      purchases: 'library',
      sales: 'library',
      complaints: 'complaints',
      hostel: 'hostel',
      hr: 'hr',
      kitchen: 'kitchen',
      inventory: 'inventory',
    };
    const requiredModule = staffModuleMap[module] || module;
    if (requiredModule !== 'dashboard' && requiredModule !== 'profile' && !user.staffModules.includes(requiredModule)) {
      return false;
    }
  }

  const modulePerm = perms[module];
  if (!modulePerm) return false;
  if (modulePerm === true) return true;
  if (typeof modulePerm === 'object' && action) return !!modulePerm[action];
  if (typeof modulePerm === 'object' && !action) return true;
  return false;
};

/**
 * Convenience: can the user view this module?
 */
export const canView = (module) => canDo(module, 'view');

/**
 * Convenience: can the user create in this module?
 */
export const canCreate = (module) => canDo(module, 'create');

/**
 * Convenience: can the user edit in this module?
 */
export const canEdit = (module) => canDo(module, 'edit');

/**
 * Convenience: can the user delete in this module?
 */
export const canDelete = (module) => canDo(module, 'delete');

/**
 * Convenience: can the user export from this module?
 */
export const canExport = (module) => canDo(module, 'export');

/**
 * Check if user is admin.
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

/**
 * Check if user has a specific role.
 */
export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

/**
 * Get user object (re-exported for convenience).
 */
export const getCurrentUser = () => getUser();
