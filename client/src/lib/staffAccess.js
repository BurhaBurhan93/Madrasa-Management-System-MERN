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

const modulesFromPermissions = (permissions = []) =>
  permissions
    .map((permission) => normalize(permission))
    .filter((permission) => permission.startsWith("staff:"))
    .map((permission) => permission.split(":")[1])
    .filter(Boolean);

const modulesFromDepartment = (department) => {
  const value = normalize(department);
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
  return null;
};

export const getAllowedStaffModules = (user) => {
  if (!user) return ["dashboard", "profile"];

  if (user.role === "admin") return MODULES_BY_EMPLOYEE_TYPE.admin;

  if (user.role !== "staff") return ["dashboard", "profile"];

  const employeeTypeModules =
    MODULES_BY_EMPLOYEE_TYPE[normalize(user.employeeType)];
  if (employeeTypeModules) return employeeTypeModules;

  const explicitModules = Array.isArray(user.staffModules)
    ? user.staffModules.map(normalize).filter(Boolean)
    : [];
  if (explicitModules.length)
    return [...new Set(["dashboard", "profile", ...explicitModules])];

  const permissionModules = modulesFromPermissions(user.permissions);
  if (permissionModules.length)
    return [...new Set(["dashboard", "profile", ...permissionModules])];

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
