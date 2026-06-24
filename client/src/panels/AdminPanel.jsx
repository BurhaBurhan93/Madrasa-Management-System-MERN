import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiMenu,
  FiLogOut,
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiBarChart2,
  FiLayers,
  FiClipboard,
  FiAward,
  FiPackage,
  FiCoffee,
  FiInbox,
  FiUserPlus,
  FiBook,
  FiFileText,
  FiDatabase,
  FiMonitor,
  FiShield,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiSun,
  FiMoon,
  FiGlobe,
  FiInfo,
  FiPrinter,
} from "react-icons/fi";
import useLocalStorage from "../hooks/useLocalStorage";
import { useTheme } from "../contexts/ThemeContext";
import i18n from "../i18n";
import { CalendarProvider, useCalendar } from "../contexts/CalendarContext";
import { clearAuth } from "../lib/auth";
import { PageSkeleton } from "../components/UIHelper/SkeletonLoader";
import NotificationDropdown from "../components/UIHelper/NotificationDropdown";
import {
  CALENDAR_SYSTEMS,
  calendarLabels,
  setCalendarSystem,
} from "../lib/dateUtils";
import useMadrasaInfo from "../hooks/useMadrasaInfo";
import { getMadrasaDisplayName, getMadrasaLogo } from "../lib/madrasaInfo";
import { translateAdminTree } from "../lib/adminLocalization";
import ConfirmDialog from "../components/ConfirmDialog";

// ── Localization strings ──
const translations = {
  en: {
    console: "Admin Console",
    workspace: "Admin Workspace",
    welcome: "Welcome back,",
    subtitle:
      "Manage the entire institution with a cleaner workspace and faster navigation.",
    search: "Search modules, users, reports...",
    overview: "Overview",
    operations: "Operations",
    management: "Management",
    dashboard: "Dashboard",
    userMgmt: "User Management",
    allUsers: "All Users",
    students: "Students",
    teachers: "Teachers",
    staff: "Staff",
    registerNew: "Register New User",
    rolesPerms: "Roles & Permissions",
    auditLogs: "Audit Logs",
    academic: "Academic",
    classes: "Classes",
    subjects: "Subjects",
    exams: "Exams",
    timetable: "Timetable",
    degrees: "Degrees",
    syllabus: "Syllabus",
    grading: "Grading System",
    attendance: "Attendance",
    daily: "Daily Attendance",
    reports: "Reports",
    settings: "Settings",
    warnings: "Attendance Warnings",
    corrections: "Corrections",
    finance: "Finance",
    feeStructure: "Fee Structure",
    payments: "Payments",
    expenses: "Expenses",
    salaries: "Salaries",
    accounts: "Accounts",
    transactions: "Transactions",
    finReports: "Financial Reports",
    library: "Library",
    books: "Books",
    categories: "Categories",
    borrowed: "Borrowed Books",
    purchases: "Purchases",
    sales: "Sales",
    libReports: "Reports",
    complaints: "Complaints",
    allComplaints: "All Complaints",
    pending: "Pending",
    resolved: "Resolved",
    actions: "Actions",
    feedback: "Feedback",
    compReports: "Reports",
    hostel: "Hostel",
    rooms: "Rooms",
    allocations: "Allocations",
    meals: "Meals",
    mealAtt: "Meal Attendance",
    hostReports: "Reports",
    hr: "HR Management",
    departments: "Departments",
    designations: "Designations",
    employees: "Employees",
    empAtt: "Employee Attendance",
    leave: "Leave Management",
    payroll: "Payroll",
    hrReports: "HR Reports",
    kitchen: "Kitchen",
    inventory: "Inventory",
    mealPlan: "Meal Planning",
    weeklyMenu: "Weekly Menu",
    suppliers: "Suppliers",
    waste: "Waste Tracking",
    kitReports: "Reports",
    reportsSection: "Reports",
    academicRpt: "Academic Reports",
    financialRpt: "Financial Reports",
    attendanceRpt: "Attendance Reports",
    operationalRpt: "Operational Reports",
    analytics: "Analytics Dashboard",
    sysSettings: "System Settings",
    general: "General Settings",
    academicSet: "Academic Settings",
    notifications: "Notifications",
    security: "Security",
    backup: "Backup & Restore",
    apiMgmt: "API Management",
    profile: "Profile",
    profileSub: "Account and identity",
    logout: "Logout",
    logoutSub: "Exit this workspace",
    theme: "Toggle theme",
    language: "Language",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    madrasaInfo: "Madrasa Info",
    print: "Print",
  },
  dari: {
    console: "کنسول مدیریتی",
    workspace: "فضای کاری مدیریت",
    welcome: "خوش آمدید،",
    subtitle: "مدیریت کامل مؤسسه با فضای کاری تمیز و ناوبری سریع.",
    search: "جستجوی ماژول‌ها، کاربران، گزارش‌ها...",
    overview: "مرور کلی",
    operations: "عملیات",
    management: "مدیریت",
    dashboard: "داشبورد",
    userMgmt: "مدیریت کاربران",
    allUsers: "همه کاربران",
    students: "شاگردان",
    teachers: "اساتید",
    staff: "کارمندان",
    registerNew: "ثبت کاربر جدید",
    rolesPerms: "نقش‌ها و مجوزها",
    auditLogs: "لاگ‌های حسابرسی",
    academic: "علمی",
    classes: "صنف‌ها",
    subjects: "مضامین",
    exams: "امتحانات",
    timetable: "تایم‌تیبل",
    degrees: "درجه‌ها",
    syllabus: "نصاب تعلیمی",
    grading: "سیستم نمره‌دهی",
    attendance: "حاضری",
    daily: "حاضری روزانه",
    reports: "گزارش‌ها",
    settings: "تنظیمات",
    warnings: "هشدارهای حاضری",
    corrections: "اصلاحات",
    finance: "مالیه",
    feeStructure: "ساختار فیس",
    payments: "پرداخت‌ها",
    expenses: "مصارف",
    salaries: "معاشات",
    accounts: "حساب‌ها",
    transactions: "معاملات",
    finReports: "گزارش‌های مالی",
    library: "کتابخانه",
    books: "کتاب‌ها",
    categories: "دسته‌بندی‌ها",
    borrowed: "کتاب‌های مستعار",
    purchases: "خریداری",
    sales: "فروش",
    libReports: "گزارش‌ها",
    complaints: "شکایات",
    allComplaints: "همه شکایات",
    pending: "معلق",
    resolved: "حل‌شده",
    actions: "اقدامات",
    feedback: "بازخورد",
    compReports: "گزارش‌ها",
    hostel: "هوستل",
    rooms: "اتاق‌ها",
    allocations: "تخصیص‌ها",
    meals: "وعده‌های غذایی",
    mealAtt: "حاضری غذا",
    hostReports: "گزارش‌ها",
    hr: "منابع بشری",
    departments: "دیپارتمنت‌ها",
    designations: "رتبه‌ها",
    employees: "کارمندان",
    empAtt: "حاضری کارمندان",
    leave: "مدیریت رخصتی",
    payroll: "معاش‌پردازی",
    hrReports: "گزارش‌های منابع بشری",
    kitchen: "آشپزخانه",
    inventory: "موجودی",
    mealPlan: "برنامه‌ریزی غذا",
    weeklyMenu: "مینوی هفتگی",
    suppliers: "عرضه‌کنندگان",
    waste: "ردیابی ضایعات",
    kitReports: "گزارش‌ها",
    reportsSection: "گزارش‌ها",
    academicRpt: "گزارش علمی",
    financialRpt: "گزارش مالی",
    attendanceRpt: "گزارش حاضری",
    operationalRpt: "گزارش عملیاتی",
    analytics: "داشبورد تحلیلی",
    sysSettings: "تنظیمات سیستم",
    general: "تنظیمات عمومی",
    academicSet: "تنظیمات علمی",
    notifications: "اعلانات",
    security: "امنیت",
    backup: "پشتیبان‌گیری و بازیابی",
    apiMgmt: "مدیریت API",
    profile: "پروفایل",
    profileSub: "حساب و هویت",
    logout: "خروج",
    logoutSub: "خروج از فضای کاری",
    theme: "تغییر تم",
    language: "زبان",
    collapseSidebar: "جمع کردن نوار کناری",
    expandSidebar: "باز کردن نوار کناری",
    madrasaInfo: "معلومات مدرسه",
    print: "چاپ",
  },
  ps: {
    console: "د ادارې کنسول",
    workspace: "د ادارې کاري فضا",
    welcome: "ښه راغلاست،",
    subtitle: "د پاکې کاري فضا او چټکې پلټنې سره بشپړ اداره اداره کړئ.",
    search: "موډلونه، کاروونکي، راپورونه ولټوئ...",
    overview: "لنډه کتنه",
    operations: "عملیات",
    management: "اداره",
    dashboard: "ډشبورډ",
    userMgmt: "د کاروونکو اداره",
    allUsers: "ټول کاروونکي",
    students: "زده‌کوونکي",
    teachers: "ښوونکي",
    staff: "کارکوونکي",
    registerNew: "نوی کاروونکی ثبت کړئ",
    rolesPerms: "رولونه او اجازې",
    auditLogs: "د حسابرسۍ لاګونه",
    academic: "تعلیمي",
    classes: "ټولګي",
    subjects: "مضمونونه",
    exams: "امتحانونه",
    timetable: "وخت جدول",
    degrees: "درجې",
    syllabus: "نصاب",
    grading: "د نمرې سیسټم",
    attendance: "حاضرري",
    daily: "ورځنۍ حاضري",
    reports: "راپورونه",
    settings: "تنظیمات",
    warnings: "د حاضرۍ خبردارنه",
    corrections: "سمونې",
    finance: "مالي",
    feeStructure: "د فیس جوړښت",
    payments: "تادیات",
    expenses: "مصارف",
    salaries: "معاشونه",
    accounts: "حسابونه",
    transactions: "معاملې",
    finReports: "مالي راپورونه",
    library: "کتابتون",
    books: "کتابونه",
    categories: "کټګورۍ",
    borrowed: "پور اخیستي کتابونه",
    purchases: "اخیستنې",
    sales: "پلورنې",
    libReports: "راپورونه",
    complaints: "شکایتونه",
    allComplaints: "ټول شکایتونه",
    pending: "ځنډیدلي",
    resolved: "حل شوي",
    actions: "اقدامات",
    feedback: "نظرونه",
    compReports: "راپورونه",
    hostel: "هاسټل",
    rooms: "خونې",
    allocations: "تخصیصونه",
    meals: "د ډوډۍ وختونه",
    mealAtt: "د ډوډۍ حاضري",
    hostReports: "راپورونه",
    hr: "بشري سرچینې",
    departments: "څانګې",
    designations: "رتبې",
    employees: "کارکوونکي",
    empAtt: "د کارکوونکو حاضري",
    leave: "د رخصتۍ اداره",
    payroll: "معاش ورکول",
    hrReports: "راپورونه",
    kitchen: "پخلنځی",
    inventory: "موجودي",
    mealPlan: "د ډوډۍ پلان",
    weeklyMenu: "اونیزه مینو",
    suppliers: "عرضه کوونکي",
    waste: "د ضایعاتو تعقیب",
    kitReports: "راپورونه",
    reportsSection: "راپورونه",
    academicRpt: "تعلیمي راپور",
    financialRpt: "مالي راپور",
    attendanceRpt: "د حاضرۍ راپور",
    operationalRpt: "عملي راپور",
    analytics: "تحلیلي ډشبورډ",
    sysSettings: "د سیسټم تنظیمات",
    general: "عمومي تنظیمات",
    academicSet: "تعلیمي تنظیمات",
    notifications: "خبرتیاوې",
    security: "امنیت",
    backup: "بک اپ او بیا رغول",
    apiMgmt: "API اداره",
    profile: "پروفایل",
    profileSub: "حساب او هویت",
    logout: "وتل",
    logoutSub: "له کاري فضا څخه وتل",
    theme: "تیم بدل کړئ",
    language: "ژبه",
    collapseSidebar: "د اړخ پټۍ ټولول",
    expandSidebar: "د اړخ پټۍ خلاصول",
    madrasaInfo: "د مدرسې معلومات",
    print: "چاپ",
  },
};

const AdminPanelContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useLocalStorage(
    "adminSidebarOpen",
    true,
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [lang, setLangRaw] = useLocalStorage("adminLang", "en");
  const setLang = (l) => {
    setLangRaw(l);
    localStorage.setItem("lang", l);
    i18n.changeLanguage(l);
  };
  const { calSys, setCalSys } = useCalendar();
  const [madrasaInfo] = useMadrasaInfo({ fetchRemote: true });
  const isRTL = lang === "dari" || lang === "ps";
  const panelRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const t = translations[lang] || translations.en;

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.dir = "ltr";
    };
  }, [lang, isRTL]);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return undefined;

    translateAdminTree(root, lang);

    const observer = new MutationObserver(() => {
      translateAdminTree(root, lang);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [lang]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error("Error reading user:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let prevIsMobile = window.innerWidth < 768;
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      // Only auto-close sidebar when crossing from desktop to mobile
      if (!prevIsMobile && nowMobile) {
        setSidebarOpen(false);
      }
      prevIsMobile = nowMobile;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  const menuItems = [
    {
      id: "dashboard",
      icon: <FiHome size={19} />,
      path: "dashboard",
      label: t.dashboard,
      type: "link",
    },
    {
      id: "madrasa-info",
      icon: <FiInfo size={19} />,
      path: "madrasa-info",
      label: t.madrasaInfo,
      type: "link",
    },
    {
      id: "print",
      icon: <FiPrinter size={19} />,
      path: "print/home",
      label: t.print,
      type: "link",
    },
    {
      id: "users",
      icon: <FiUsers size={19} />,
      label: t.userMgmt,
      type: "dropdown",
      items: [
        { id: "all-users", label: t.allUsers, path: "users" },
        { id: "students", label: t.students, path: "users/students" },
        { id: "teachers", label: t.teachers, path: "users/teachers" },
        { id: "staff", label: t.staff, path: "users/staff" },
        { id: "register", label: t.registerNew, path: "users/register" },
        { id: "roles", label: t.rolesPerms, path: "users/roles" },
        { id: "audit", label: t.auditLogs, path: "users/audit" },
      ],
    },
    {
      id: "academic",
      icon: <FiBookOpen size={19} />,
      label: t.academic,
      type: "dropdown",
      items: [
        { id: "classes", label: t.classes, path: "academic/classes" },
        { id: "subjects", label: t.subjects, path: "academic/subjects" },
        { id: "exams", label: t.exams, path: "academic/exams" },
        { id: "timetable", label: t.timetable, path: "academic/timetable" },
        { id: "degrees", label: t.degrees, path: "academic/degrees" },
        { id: "syllabus", label: t.syllabus, path: "academic/syllabus" },
        { id: "grading", label: t.grading, path: "academic/grading" },
      ],
    },
    {
      id: "attendance",
      icon: <FiCalendar size={19} />,
      label: t.attendance,
      type: "dropdown",
      items: [
        { id: "daily", label: t.daily, path: "attendance/daily" },
        { id: "reports", label: t.reports, path: "attendance/reports" },
        { id: "settings", label: t.settings, path: "attendance/settings" },
        { id: "warnings", label: t.warnings, path: "attendance/warnings" },
        {
          id: "corrections",
          label: t.corrections,
          path: "attendance/corrections",
        },
      ],
    },
    {
      id: "finance",
      icon: <FiDollarSign size={19} />,
      label: t.finance,
      type: "dropdown",
      items: [
        {
          id: "fee-structure",
          label: t.feeStructure,
          path: "finance/fee-structure",
        },
        { id: "payments", label: t.payments, path: "finance/payments" },
        { id: "expenses", label: t.expenses, path: "finance/expenses" },
        { id: "salaries", label: t.salaries, path: "finance/salaries" },
        { id: "accounts", label: t.accounts, path: "finance/accounts" },
        {
          id: "transactions",
          label: t.transactions,
          path: "finance/transactions",
        },
        { id: "reports", label: t.finReports, path: "finance/reports" },
      ],
    },
    {
      id: "library",
      icon: <FiBook size={19} />,
      label: t.library,
      type: "dropdown",
      items: [
        { id: "books", label: t.books, path: "library/books" },
        { id: "categories", label: t.categories, path: "library/categories" },
        { id: "borrowed", label: t.borrowed, path: "library/borrowed" },
        { id: "purchases", label: t.purchases, path: "library/purchases" },
        { id: "sales", label: t.sales, path: "library/sales" },
        { id: "reports", label: t.libReports, path: "library/reports" },
      ],
    },
    {
      id: "complaints",
      icon: <FiInbox size={19} />,
      label: t.complaints,
      type: "dropdown",
      items: [
        { id: "all-complaints", label: t.allComplaints, path: "complaints" },
        { id: "pending", label: t.pending, path: "complaints/pending" },
        { id: "resolved", label: t.resolved, path: "complaints/resolved" },
        { id: "actions", label: t.actions, path: "complaints/actions" },
        { id: "feedback", label: t.feedback, path: "complaints/feedback" },
        { id: "reports", label: t.compReports, path: "complaints/reports" },
      ],
    },
    {
      id: "hostel",
      icon: <FiHome size={19} />,
      label: t.hostel,
      type: "dropdown",
      items: [
        { id: "rooms", label: t.rooms, path: "hostel/rooms" },
        { id: "allocations", label: t.allocations, path: "hostel/allocations" },
        { id: "meals", label: t.meals, path: "hostel/meals" },
        { id: "attendance", label: t.mealAtt, path: "hostel/attendance" },
        { id: "reports", label: t.hostReports, path: "hostel/reports" },
      ],
    },
    {
      id: "hr",
      icon: <FiUserPlus size={19} />,
      label: t.hr,
      type: "dropdown",
      items: [
        { id: "departments", label: t.departments, path: "hr/departments" },
        { id: "designations", label: t.designations, path: "hr/designations" },
        { id: "employees", label: t.employees, path: "hr/employees" },
        { id: "attendance", label: t.empAtt, path: "hr/attendance" },
        { id: "leave", label: t.leave, path: "hr/leave" },
        { id: "payroll", label: t.payroll, path: "hr/payroll" },
        { id: "reports", label: t.hrReports, path: "hr/reports" },
      ],
    },
    {
      id: "kitchen",
      icon: <FiCoffee size={19} />,
      label: t.kitchen,
      type: "dropdown",
      items: [
        { id: "inventory", label: t.inventory, path: "kitchen/inventory" },
        { id: "meals", label: t.mealPlan, path: "kitchen/meals" },
        { id: "menu", label: t.weeklyMenu, path: "kitchen/menu" },
        { id: "suppliers", label: t.suppliers, path: "kitchen/suppliers" },
        { id: "waste", label: t.waste, path: "kitchen/waste" },
        { id: "reports", label: t.kitReports, path: "kitchen/reports" },
      ],
    },
    {
      id: "reports",
      icon: <FiBarChart2 size={19} />,
      label: t.reportsSection,
      type: "dropdown",
      items: [
        { id: "academic", label: t.academicRpt, path: "reports/academic" },
        { id: "financial", label: t.financialRpt, path: "reports/financial" },
        {
          id: "attendance",
          label: t.attendanceRpt,
          path: "reports/attendance",
        },
        {
          id: "operational",
          label: t.operationalRpt,
          path: "reports/operational",
        },
        { id: "analytics", label: t.analytics, path: "reports/analytics" },
      ],
    },
    {
      id: "settings",
      icon: <FiSettings size={19} />,
      label: t.sysSettings,
      type: "dropdown",
      items: [
        { id: "general", label: t.general, path: "settings/general" },
        { id: "academic", label: t.academicSet, path: "settings/academic" },
        {
          id: "notifications",
          label: t.notifications,
          path: "settings/notifications",
        },
        { id: "security", label: t.security, path: "settings/security" },
        { id: "backup", label: t.backup, path: "settings/backup" },
        { id: "api", label: t.apiMgmt, path: "settings/api" },
      ],
    },
  ];

  const createPrintCapture = () => {
    const contentNode = document.querySelector("[data-panel-print-content]");
    if (!contentNode) return null;

    const clone = contentNode.cloneNode(true);
    clone
      .querySelectorAll('button, [data-no-print="true"]')
      .forEach((element) => element.remove());

    clone.querySelectorAll("input, textarea, select").forEach((field) => {
      if (field.tagName === "SELECT") {
        const selectedOption = field.options[field.selectedIndex];
        field.setAttribute("data-print-value", selectedOption?.text || "");
      } else {
        field.setAttribute("data-print-value", field.value || "");
      }
    });

    const heading = contentNode.querySelector("h1, h2, h3");
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      title: heading?.textContent?.trim() || t.print,
      subtitle: "Current page capture",
      sections: [
        {
          type: "html",
          content: clone.innerHTML,
        },
      ],
    };

    sessionStorage.setItem(`printCapture:${key}`, JSON.stringify(payload));
    return key;
  };

  const handleNavigation = (path) => {
    if (path === "print/home") {
      const captureKey = createPrintCapture();
      navigate(
        captureKey ? `/admin/print/home/${captureKey}` : "/admin/print/home",
      );
      if (isMobile) setSidebarOpen(false);
      return;
    }

    navigate(`/admin/${path}`);
    if (isMobile) setSidebarOpen(false);
  };

  const isActive = (path) => {
    if (!path)
      return location.pathname === "/admin" || location.pathname === "/admin/";
    return location.pathname.startsWith(`/admin/${path}`);
  };

  const isDropdownActive = (items) =>
    items.some((item) => location.pathname.startsWith(`/admin/${item.path}`));

  useEffect(() => {
    const activeDropdown = menuItems.find(
      (item) => item.type === "dropdown" && isDropdownActive(item.items),
    );
    if (activeDropdown) {
      setOpenDropdown(activeDropdown.id);
    }
  }, [location.pathname]);

  // Save last visited path to localStorage
  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    clearAuth();
    navigate("/");
  };
  const groupedMenu = useMemo(
    () => [
      { title: t.overview, items: menuItems.slice(0, 4) },
      { title: t.operations, items: menuItems.slice(4, 9) },
      { title: t.management, items: menuItems.slice(9) },
    ],
    [location.pathname, lang],
  );

  return (
    <div
      ref={panelRef}
      data-admin-panel-root
      dir={isRTL ? "rtl" : "ltr"}
      className={`flex h-screen overflow-hidden ${theme === "dark" ? "bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.95),_rgba(15,23,42,1)_42%,_rgba(30,41,59,1)_100%)]" : "bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.9),_rgba(248,250,252,1)_42%,_rgba(241,245,249,1)_100%)]"}`}
    >
      <aside
        className={`fixed z-30 h-screen border-r backdrop-blur-xl transition-all duration-300 md:relative ${theme === "dark" ? "border-slate-700/60 bg-slate-900/95" : "border-white/70 bg-white/90"} ${sidebarOpen ? "w-72" : "w-24"}`}
      >
        <div className="flex h-full flex-col">
          <div
            className={`border-b px-4 py-5 ${theme === "dark" ? "border-slate-700/60" : "border-slate-200/80"} ${sidebarOpen ? "" : "flex justify-center"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-lg font-bold text-white shadow-[0_12px_30px_-18px_rgba(14,165,233,0.9)]">
                {getMadrasaLogo(madrasaInfo) ? (
                  <img
                    src={getMadrasaLogo(madrasaInfo)}
                    alt="Madrasa logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {getMadrasaDisplayName(madrasaInfo)[0]?.toUpperCase() ||
                      "M"}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">
                    {getMadrasaDisplayName(madrasaInfo)}
                  </div>
                  <div
                    className={`mt-1 text-lg font-semibold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}
                  >
                    {t.workspace}
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav
            className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="space-y-6">
              {groupedMenu.map((group) => (
                <div key={group.title}>
                  {sidebarOpen && (
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {group.title}
                    </p>
                  )}
                  <ul className="space-y-1.5">
                    {group.items.map((item) => {
                      const activeDropdown =
                        item.type === "dropdown" &&
                        isDropdownActive(item.items);
                      const activeLink =
                        item.type === "link" && isActive(item.path);
                      const buttonBase =
                        activeLink || activeDropdown
                          ? theme === "dark"
                            ? "border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 via-sky-900/30 to-slate-800 text-cyan-300"
                            : "border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white text-cyan-700"
                          : theme === "dark"
                            ? "border-transparent text-slate-400 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 hover:shadow-sm"
                            : "border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm";

                      return (
                        <li key={item.id}>
                          {item.type === "link" ? (
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${buttonBase}`}
                              title={!sidebarOpen ? item.label : ""}
                            >
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeLink ? "bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]" : theme === "dark" ? "bg-slate-800 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400" : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"}`}
                              >
                                {item.icon}
                              </span>
                              {sidebarOpen && (
                                <span className="text-[13px] font-medium">
                                  {item.label}
                                </span>
                              )}
                            </button>
                          ) : (
                            <div>
                              <button
                                onClick={() =>
                                  sidebarOpen &&
                                  setOpenDropdown(
                                    openDropdown === item.id ? null : item.id,
                                  )
                                }
                                className={`group flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${buttonBase}`}
                                title={!sidebarOpen ? item.label : ""}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeDropdown ? "bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]" : theme === "dark" ? "bg-slate-800 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400" : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"}`}
                                  >
                                    {item.icon}
                                  </span>
                                  {sidebarOpen && (
                                    <span className="text-[13px] font-medium">
                                      {item.label}
                                    </span>
                                  )}
                                </div>
                                {sidebarOpen && (
                                  <FiChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${openDropdown === item.id ? "rotate-180 text-cyan-500" : theme === "dark" ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-700"}`}
                                  />
                                )}
                              </button>

                              {sidebarOpen && openDropdown === item.id && (
                                <ul className="mt-2 space-y-1 pl-4">
                                  {item.items.map((sub) => {
                                    const activeSub = isActive(sub.path);
                                    return (
                                      <li key={sub.id}>
                                        <button
                                          onClick={() =>
                                            handleNavigation(sub.path)
                                          }
                                          className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${activeSub ? (theme === "dark" ? "bg-cyan-900/30 font-medium text-cyan-300" : "bg-cyan-100/80 font-medium text-cyan-800") : theme === "dark" ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
                                        >
                                          <span
                                            className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${activeSub ? "bg-cyan-500 shadow-[0_0_0_4px_rgba(34,211,238,0.15)]" : theme === "dark" ? "bg-slate-600 group-hover:bg-cyan-500" : "bg-slate-300 group-hover:bg-cyan-400"}`}
                                          />
                                          <span>{sub.label}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Collapse/Expand toggle in sidebar */}
          {sidebarOpen && (
            <div className="mx-3 mb-1">
              <button
                onClick={() => setSidebarOpen(false)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ${theme === "dark" ? "border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                title={t.collapseSidebar}
              >
                <FiChevronLeft size={18} />
                <span className="text-xs font-medium">{t.collapseSidebar}</span>
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <div className="flex justify-center mb-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${theme === "dark" ? "border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                title={t.expandSidebar}
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}

          <div
            className={`border-t p-3 ${theme === "dark" ? "border-slate-700/60" : "border-slate-200/80"}`}
          >
            <div
              className={`rounded-3xl border p-2 ${theme === "dark" ? "border-slate-700/60 bg-slate-800/80" : "border-slate-200 bg-white/95"} ${sidebarOpen ? "" : "space-y-2"}`}
            >
              <button
                onClick={() => handleNavigation("profile")}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${isActive("profile") ? (theme === "dark" ? "bg-gradient-to-r from-cyan-900/30 to-sky-900/30 text-cyan-300" : "bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700") : theme === "dark" ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                title={!sidebarOpen ? "Profile" : ""}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isActive("profile") ? "bg-cyan-600 text-white" : theme === "dark" ? "bg-slate-700 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400" : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"}`}
                >
                  <FiUser size={18} />
                </span>
                {sidebarOpen && (
                  <div>
                    <p className="text-[13px] font-medium">{t.profile}</p>
                    <p className="text-xs text-slate-400">{t.profileSub}</p>
                  </div>
                )}
              </button>
              <button
                onClick={handleLogout}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${theme === "dark" ? "text-rose-400 hover:bg-rose-900/20 hover:text-rose-300" : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"}`}
                title={!sidebarOpen ? "Logout" : ""}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${theme === "dark" ? "bg-rose-900/30 text-rose-400 group-hover:bg-rose-900/50 group-hover:text-rose-300" : "bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600"}`}
                >
                  <FiLogOut size={18} />
                </span>
                {sidebarOpen && (
                  <div>
                    <p className="text-[13px] font-medium">{t.logout}</p>
                    <p className="text-xs text-rose-300">{t.logoutSub}</p>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/25 backdrop-blur-[1px] md:hidden"
          aria-hidden
        />
      )}

      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header
          className={`sticky top-0 z-20 mx-3 mt-3 rounded-2xl border navbar-glass ${theme === "dark" ? "border-slate-700/60 bg-slate-900/80" : "border-white/70 bg-white/72"}`}
        >
          <div className="flex items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-400" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"}`}
              >
                <FiMenu size={20} />
              </button>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.24em] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  {t.console}
                </p>
                <h1
                  className={`mt-1 text-lg font-semibold lg:text-xl ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}
                >
                  {t.welcome}{" "}
                  <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                    {user?.name || "Administrator"}
                  </span>
                </h1>
                <p
                  className={`mt-1 text-xs lg:text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}
                >
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden items-center rounded-full border px-4 py-2.5 md:flex ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
              >
                <FiSearch className="mr-2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={t.search}
                  className={`w-48 bg-transparent text-sm outline-none ${theme === "dark" ? "text-slate-300 placeholder:text-slate-500" : "text-slate-600"}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  title={t.theme}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"}`}
                >
                  {theme === "dark" ? (
                    <FiSun size={19} />
                  ) : (
                    <FiMoon size={19} />
                  )}
                </button>
                <button
                  onClick={() => {
                    const langs = ["en", "dari", "ps"];
                    setLang(langs[(langs.indexOf(lang) + 1) % langs.length]);
                  }}
                  title={t.language}
                  className={`flex h-11 items-center gap-1 rounded-2xl border px-3 transition-all duration-200 hover:-translate-y-0.5 ${theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"}`}
                >
                  <FiGlobe size={17} />
                  <span className="text-xs font-semibold">
                    {lang === "en" ? "EN" : lang === "dari" ? "دری" : "پښتو"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    const sys = [
                      CALENDAR_SYSTEMS.GREGORIAN,
                      CALENDAR_SYSTEMS.HIJRI,
                      CALENDAR_SYSTEMS.JALALI,
                    ];
                    const next = sys[(sys.indexOf(calSys) + 1) % sys.length];
                    setCalSys(next);
                    setCalendarSystem("admin", next);
                  }}
                  title={calendarLabels[lang]?.[calSys] || calSys}
                  className={`flex h-11 items-center gap-1 rounded-2xl border px-3 transition-all duration-200 hover:-translate-y-0.5 ${theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"}`}
                >
                  <FiCalendar size={17} />
                  <span className="text-[10px] font-semibold">
                    {calendarLabels[lang]?.[calSys] || calSys}
                  </span>
                </button>
                <NotificationDropdown t={t} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6" data-panel-print-content>
          <Suspense fallback={<PageSkeleton variant="table" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
};

const AdminPanel = () => (
  <CalendarProvider panelPrefix="admin">
    <AdminPanelContent />
  </CalendarProvider>
);

export default AdminPanel;
