const DEFAULT_STAFF_MODULES = [
  "dashboard",
  "profile",
];
const PRINT_ENABLED_STAFF_MODULES = [
  "registrar",
  "library",
  "complaints",
  "finance",
  "payroll",
  "kitchen",
  "hr",
];

const MODULE_ALIASES = {
  leave: "hr",
  support: "support",
  payroll: "payroll",
  hr: "hr",
  finance: "finance",
  library: "library",
  complaints: "complaints",
  kitchen: "kitchen",
  hostel: "registrar",
  registrar: "registrar",
  students: "students",
  inventory: "inventory",
  dashboard: "dashboard",
  profile: "profile",
};

const MODULES_BY_EMPLOYEE_TYPE = {
  admin: [
    "dashboard",
    "profile",
    "registrar",
    "students",
    "inventory",
    "library",
    "complaints",
    "finance",
    "payroll",
    "kitchen",
    "hr",
    "support",
  ],
  "general-manager": [
    "dashboard",
    "profile",
    "registrar",
    "students",
    "inventory",
    "library",
    "complaints",
    "finance",
    "payroll",
    "kitchen",
    "hr",
    "support",
  ],
  support: ["dashboard", "profile", "support", "students", "inventory", "complaints"],
  finance: ["dashboard", "profile", "finance"],
  registrar: ["dashboard", "profile", "registrar"],
  hr: ["dashboard", "profile", "hr"],
  librarian: ["dashboard", "profile", "library"],
  kitchen: ["dashboard", "profile", "kitchen"],
  payroll: ["dashboard", "profile", "payroll"],
  complaints: ["dashboard", "profile", "complaints"],
  inventory: ["dashboard", "profile", "inventory"],
  maintenance: ["dashboard", "profile", "inventory", "complaints"],
  security: ["dashboard", "profile", "students", "complaints"],
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getRoleType = (roleNames = []) => {
  const names = roleNames.map(normalize);
  if (names.some((name) => name === 'general manager' || name === 'general-manager')) return 'general-manager';
  if (names.some((name) => name.includes('payroll'))) return 'payroll';
  if (names.some((name) => name.includes('finance'))) return 'finance';
  if (names.some((name) => name.includes('registrar'))) return 'registrar';
  if (names.some((name) => name.includes('support'))) return 'support';
  if (names.some((name) => name.includes('library'))) return 'librarian';
  if (names.some((name) => name.includes('kitchen'))) return 'kitchen';
  if (names.some((name) => name.includes('inventory'))) return 'inventory';
  if (names.some((name) => name.includes('complaint'))) return 'complaints';
  if (names.some((name) => name === 'hr staff' || name.includes('human resources'))) return 'hr';
  return null;
};

const STAFF_MODULES_MAP = {
  students: "students",
  academic: "registrar",
  classes: "registrar",
  subjects: "registrar",
  attendance: "registrar",
  finance: "finance",
  feeStructure: "finance",
  payments: "finance",
  expenses: "finance",
  salaries: "payroll",
  accounts: "finance",
  transactions: "finance",
  library: "library",
  books: "library",
  categories: "library",
  borrowedBooks: "library",
  purchases: "library",
  sales: "library",
  complaints: "complaints",
  hostel: "hostel",
  hr: "hr",
  kitchen: "kitchen",
  inventory: "inventory",
};

const mapToCanonicalModule = (moduleName) =>
  STAFF_MODULES_MAP[moduleName] || moduleName;

const modulesFromPermissions = (permissions = []) =>
  permissions
    .map((permission) => normalize(permission))
    .filter((permission) => permission.startsWith("staff:"))
    .map((permission) => permission.split(":")[1])
    .filter(Boolean)
    .map(mapToCanonicalModule);

const modulesFromDepartment = (department) => {
  const value = normalize(department);
  if (value.includes("payroll") || value.includes("salary"))
    return MODULES_BY_EMPLOYEE_TYPE.payroll;
  if (value.includes("finance") || value.includes("account"))
    return MODULES_BY_EMPLOYEE_TYPE.finance;
  if (
    value.includes("registrar") ||
    value.includes("admission") ||
    value.includes("student")
  )
    return MODULES_BY_EMPLOYEE_TYPE.registrar;
  if (value.includes("human") || value.includes("hr"))
    return MODULES_BY_EMPLOYEE_TYPE.hr;
  if (value.includes("library")) return MODULES_BY_EMPLOYEE_TYPE.librarian;
  if (value.includes("kitchen") || value.includes("food"))
    return MODULES_BY_EMPLOYEE_TYPE.kitchen;
  if (value.includes("support") || value.includes("complaint") || value.includes("ticket"))
    return MODULES_BY_EMPLOYEE_TYPE.support;
  if (value.includes("inventory") || value.includes("store") || value.includes("warehouse") || value.includes("stock"))
    return MODULES_BY_EMPLOYEE_TYPE.inventory;
  if (value.includes("security") || value.includes("guard"))
    return MODULES_BY_EMPLOYEE_TYPE.security;
  if (value.includes("maintenance") || value.includes("repair") || value.includes("facility"))
    return MODULES_BY_EMPLOYEE_TYPE.maintenance;
  return null;
};

export const getAllowedStaffModules = (user) => {
  if (!user) return ["dashboard", "profile"];

  if (user.role === "admin") return MODULES_BY_EMPLOYEE_TYPE.admin;

  if (user.role !== "staff") return ["dashboard", "profile"];

  const employeeType = normalize(user.employeeType);
  const designation = normalize(user.designation);
  const accountName = normalize(user.name);
  const roleType = getRoleType(user.staffRoleNames);

  // General Manager always sees every staff panel, even when the account also
  // retains an old single-department permission or stale staffModules value.
  if (
    employeeType === "general-manager" ||
    employeeType === "general manager" ||
    designation === "general-manager" ||
    designation === "general manager" ||
    accountName === "general-manager" ||
    accountName === "general manager" ||
    roleType === "general-manager"
  ) {
    return MODULES_BY_EMPLOYEE_TYPE["general-manager"];
  }

  // The authenticated staffModules value is calculated from the account's
  // assigned role.  It must win over a stale employee profile type.
  const explicitModules = Array.isArray(user.staffModules)
    ? user.staffModules.map(normalize).filter(Boolean).map(mapToCanonicalModule)
    : [];
  if (explicitModules.length)
    return [...new Set(["dashboard", "profile", ...explicitModules])];

  const permissionModules = modulesFromPermissions(user.permissions);
  if (permissionModules.length)
    return [...new Set(["dashboard", "profile", ...permissionModules])];

  if (roleType) return MODULES_BY_EMPLOYEE_TYPE[roleType];

  const employeeTypeModules =
    MODULES_BY_EMPLOYEE_TYPE[employeeType];
  if (employeeTypeModules) return employeeTypeModules;

  // Fallback: partial match employeeType against known types
  // e.g. "Payroll Staff" → "payroll", "General Manager" → "general-manager"
  if (user.employeeType) {
    const normalized = normalize(user.employeeType);
    const types = Object.keys(MODULES_BY_EMPLOYEE_TYPE).sort(
      (a, b) => b.length - a.length,
    );
    for (const type of types) {
      if (
        normalized.includes(type) ||
        normalized.includes(type.replace(/-/g, " "))
      )
        return MODULES_BY_EMPLOYEE_TYPE[type];
    }
  }

  return modulesFromDepartment(user.department) || DEFAULT_STAFF_MODULES;
};

export const getStaffModuleFromPath = (pathname) => {
  const parts = pathname
    .replace(/^\/staff\/?/, "")
    .split("/")
    .filter(Boolean);
  if (parts[0] === "registrar" && parts[1] && parts[1].startsWith("hostel")) {
    return "hostel";
  }
  const firstPart = parts[0] || "dashboard";
  return MODULE_ALIASES[firstPart] || firstPart;
};

const canAccessStaffPrint = (allowedModules) =>
  PRINT_ENABLED_STAFF_MODULES.some((moduleName) =>
    allowedModules.includes(moduleName),
  );

export const canAccessStaffPath = (pathname, user) => {
  if (!user) return true;
  if (user.role === "admin") return true;
  const allowedModules = getAllowedStaffModules(user);

  if (pathname.startsWith("/staff/print/")) {
    return canAccessStaffPrint(allowedModules);
  }

  const moduleName = getStaffModuleFromPath(pathname);
  return allowedModules.includes(moduleName);
};

export const filterStaffMenuItems = (menuItems, user) => {
  const allowedModules = getAllowedStaffModules(user);

  return menuItems
    .map((item) => {
      if (item.id === "print") {
        return canAccessStaffPrint(allowedModules) ? item : null;
      }

      if (!allowedModules.includes(item.id)) return null;
      if (item.type !== "dropdown") return item;

      const items = item.items.filter((subItem) =>
        allowedModules.includes(
          getStaffModuleFromPath(`/staff/${subItem.path}`),
        ),
      );
      return items.length ? { ...item, items } : null;
    })
    .filter(Boolean);
};
