import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiBookOpen, FiCalendar, FiEdit, FiInbox, FiUser,
  FiMenu, FiLogOut, FiCreditCard, FiSearch, FiMessageSquare,
  FiChevronDown, FiChevronLeft, FiChevronRight, FiAward, FiCalendar as FiEvent, FiSettings, FiBriefcase,
  FiBook, FiSun, FiMoon, FiGlobe
} from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarProvider, useCalendar } from '../contexts/CalendarContext';
import { clearAuth } from '../lib/auth';
import axios from 'axios';
import NotificationDropdown from '../components/UIHelper/NotificationDropdown';
import { CALENDAR_SYSTEMS, calendarLabels, setCalendarSystem } from '../lib/dateUtils';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import useMadrasaInfo from '../hooks/useMadrasaInfo';
import { getMadrasaDisplayName, getMadrasaLogo } from '../lib/madrasaInfo';
import i18n from '../i18n';
import ConfirmDialog from '../components/ConfirmDialog';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Localization strings ──
const translations = {
  en: {
    console: 'Student Console', workspace: 'Student Workspace', welcome: 'Welcome back,',
    subtitle: 'Manage your academic journey with a cleaner workspace and faster navigation.',
    search: 'Search courses, assignments...', overview: 'Overview', operations: 'Operations',
    dashboard: 'Dashboard', academic: 'Academic',
    myCourses: 'My Courses', schedule: 'Schedule', attendance: 'Attendance',
    exams: 'Exams', examResults: 'Exam Results', timetable: 'Next Semester Timetable',
    allResults: 'All Results', myDegrees: 'My Degrees', eduHistory: 'Education History',
    assignments: 'Assignments', allAssignments: 'All Assignments',
    submitHomework: 'Submit Homework', library: 'Library',
    resources: 'Learning Resources', borrowed: 'Borrowed Books',
    purchaseHistory: 'Purchase History', finance: 'Finance',
    feesPayments: 'Fees & Payments', transactionHistory: 'Transaction History',
    hostel: 'Hostel', leave: 'Leave',
    communications: 'Communications', messages: 'Messages',
    complaints: 'Complaints', certificates: 'Certificates', events: 'Events',
    profile: 'Profile', profileSub: 'Account and identity',
    logout: 'Logout', logoutSub: 'Exit this workspace',
    theme: 'Toggle theme', language: 'Language',
    collapseSidebar: 'Collapse sidebar', expandSidebar: 'Expand sidebar',
  },
  dari: {
    console: 'کنسول شاگردان', workspace: 'فضای کاری شاگردان', welcome: 'خوش آمدید،',
    subtitle: 'سفر تعلیمی خود را با فضای کاری تمیز و ناوبری سریع مدیریت کنید.',
    search: 'جستجوی درس‌ها، تکالیف...', overview: 'مرور کلی', operations: 'عملیات',
    dashboard: 'داشبورد', academic: 'علمی',
    myCourses: 'درس‌های من', schedule: 'جدول', attendance: 'حاضری',
    exams: 'امتحانات', examResults: 'نتایج امتحانات', timetable: 'تایم‌تیبل سمستر بعدی',
    allResults: 'همه نتایج', myDegrees: 'درجه‌های من', eduHistory: 'تاریخچه تعلیمی',
    assignments: 'تکالیف', allAssignments: 'همه تکالیف',
    submitHomework: 'تسلیم خانه‌تکلیف', library: 'کتابخانه',
    resources: 'منابع تعلیمی', borrowed: 'کتاب‌های مستعار',
    purchaseHistory: 'تاریخچه خرید', finance: 'مالیه',
    feesPayments: 'فیس و پرداخت‌ها', transactionHistory: 'تاریخچه معاملات',
    hostel: 'هوستل', leave: 'رخصتی',
    communications: 'ارتباطات', messages: 'پیام‌ها',
    complaints: 'شکایات', certificates: 'گواهینامه‌ها', events: 'رویدادها',
    profile: 'پروفایل', profileSub: 'حساب و هویت',
    logout: 'خروج', logoutSub: 'خروج از فضای کاری',
    theme: 'تغییر تم', language: 'زبان',
    collapseSidebar: 'جمع کردن نوار کناری', expandSidebar: 'باز کردن نوار کناری',
  },
  ps: {
    console: 'د زده‌کوونکي کنسول', workspace: 'د زده‌کوونکي کاري فضا', welcome: 'ښه راغلاست،',
    subtitle: 'د پاکې کاري فضا او چټکې پلټنې سره خپل تعلیمي سفر اداره کړئ.',
    search: 'کورسونه، تکالیف ولټوئ...', overview: 'لنډه کتنه', operations: 'عملیات',
    dashboard: 'ډشبورډ', academic: 'تعلیمي',
    myCourses: 'زما کورسونه', schedule: 'وخت جدول', attendance: 'حاضرري',
    exams: 'امتحانونه', examResults: 'د امتحان پایلې', timetable: 'د راتلونکي سمستر وخت جدول',
    allResults: 'ټولې پایلې', myDegrees: 'زما درجې', eduHistory: 'تعلیمي تاریخچه',
    assignments: 'تکالیف', allAssignments: 'ټول تکالیف',
    submitHomework: 'د کور کار وسپارئ', library: 'کتابتون',
    resources: 'تعلیمي سرچینې', borrowed: 'پور اخیستي کتابونه',
    purchaseHistory: 'د اخیستنې تاریخچه', finance: 'مالي',
    feesPayments: 'فیس او تادیات', transactionHistory: 'د معاملو تاریخچه',
    hostel: 'هاسټل', leave: 'رخصتي',
    communications: 'اړیکې', messages: 'پیغامونه',
    complaints: 'شکایتونه', certificates: 'سندونه', events: 'پیښې',
    profile: 'پروفایل', profileSub: 'حساب او هویت',
    logout: 'وتل', logoutSub: 'له کاري فضا څخه وتل',
    theme: 'تیم بدل کړئ', language: 'ژبه',
    collapseSidebar: 'د اړخ پټۍ ټولول', expandSidebar: 'د اړخ پټۍ خلاصول',
  },
};

const StudentPanelContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useLocalStorage('studentSidebarOpen', true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useLocalStorage('studentLang', 'en');
  const { calSys, setCalSys } = useCalendar();
  const [madrasaInfo] = useMadrasaInfo({ fetchRemote: true });
  const isRTL = lang === 'dari' || lang === 'ps';
  const t = translations[lang] || translations.en;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
    return () => { document.documentElement.dir = 'ltr'; };
  }, [lang, isRTL]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`${API_BASE}/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = res.data;
        if (data.success) {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Set a default user from localStorage if API fails
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESIZE HANDLER ================= */
  useEffect(() => {
    let prevIsMobile = window.innerWidth < 768;
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      if (!prevIsMobile && nowMobile) setSidebarOpen(false);
      prevIsMobile = nowMobile;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  /* ================= MENU WITH SUBMENU SUPPORT ================= */
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <FiHome size={19} />, 
      path: '', 
      label: t.dashboard,
      type: 'link'
    },
    { 
      id: 'academic', 
      icon: <FiBookOpen size={19} />, 
      label: t.academic,
      type: 'dropdown',
      items: [
        { id: 'courses', label: t.myCourses, path: 'courses' },
        { id: 'schedule', label: t.schedule, path: 'schedule' },
        { id: 'attendance', label: t.attendance, path: 'attendance' },
        { id: 'exams', label: t.exams, path: 'exams' },
        { id: 'exam-results', label: t.examResults, path: 'exam-results' },
        { id: 'timetable', label: t.timetable, path: 'timetable' },
        { id: 'results', label: t.allResults, path: 'results' },
        { id: 'degrees', label: t.myDegrees, path: 'degrees' },
        { id: 'education', label: t.eduHistory, path: 'education' },
      ]
    },
    { 
      id: 'assignments', 
      icon: <FiEdit size={19} />, 
      label: t.assignments,
      type: 'dropdown',
      items: [
        { id: 'all-assignments', label: t.allAssignments, path: 'assignments' },
        { id: 'homework', label: t.submitHomework, path: 'homework-submission' },
      ]
    },
    { 
      id: 'library', 
      icon: <FiBook size={19} />, 
      label: t.library,
      type: 'dropdown',
      items: [
        { id: 'resources', label: t.resources, path: 'resources' },
        { id: 'borrowed', label: t.borrowed, path: 'borrowed' },
        { id: 'purchase', label: t.purchaseHistory, path: 'purchase' },
      ]
    },
    { 
      id: 'finance', 
      icon: <FiCreditCard size={19} />, 
      label: t.finance,
      type: 'dropdown',
      items: [
        { id: 'fees', label: t.feesPayments, path: 'fees' },
        { id: 'transactions', label: t.transactionHistory, path: 'transactions' },
      ]
    },
    { 
      id: 'hostel', 
      icon: <FiHome size={19} />, 
      path: 'hostel', 
      label: t.hostel,
      type: 'link'
    },
    { 
      id: 'leave', 
      icon: <FiCalendar size={19} />, 
      path: 'leave', 
      label: t.leave,
      type: 'link'
    },
    { 
      id: 'communications', 
      icon: <FiMessageSquare size={19} />, 
      label: t.communications,
      type: 'dropdown',
      items: [
        { id: 'messages', label: t.messages, path: 'communications' },
        { id: 'complaints', label: t.complaints, path: 'complaints' },
      ]
    },
    { 
      id: 'certificates', 
      icon: <FiAward size={19} />, 
      path: 'certificates', 
      label: t.certificates,
      type: 'link'
    },
    { 
      id: 'events', 
      icon: <FiEvent size={19} />, 
      path: 'events', 
      label: t.events,
      type: 'link'
    },
  ];

  /* ================= HELPERS ================= */
  const handleNavigation = (path) => {
    navigate(path ? `/student/${path}` : '/student');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isActive = (path) => {
    if (!path) return location.pathname === '/student' || location.pathname === '/student/';
    return location.pathname.startsWith(`/student/${path}`);
  };

  const isDropdownActive = (items) => {
    return items.some(item => location.pathname.startsWith(`/student/${item.path}`));
  };

  useEffect(() => {
    const activeDropdown = menuItems.find((item) => item.type === 'dropdown' && isDropdownActive(item.items));
    if (activeDropdown) {
      setOpenDropdown(activeDropdown.id);
    }
  }, [location.pathname]);

  // Save last visited path to localStorage
  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = () => {
    clearAuth();
    navigate('/');
  };

  const groupedMenu = useMemo(() => ([
    { title: t.overview, items: menuItems.slice(0, 2) },
    { title: t.operations, items: menuItems.slice(2) }
  ]), [lang]);

  /* ================= RENDER ================= */
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.98),_rgba(15,23,42,0.96)_42%,_rgba(2,6,23,1)_100%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.96),_rgba(224,242,254,0.92)_42%,_rgba(219,234,254,0.96)_100%)]'}`}>
      <aside
        className={`fixed z-30 h-screen border-r backdrop-blur-xl transition-all duration-300 md:relative ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/95' : 'border-cyan-100/80 bg-cyan-50/80'} ${sidebarOpen ? 'w-72' : 'w-24'}`}
      >
        <div className="flex h-full flex-col">
          <div className={`border-b px-4 py-5 ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200/80'} ${sidebarOpen ? '' : 'flex justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-lg font-bold text-white shadow-[0_12px_30px_-18px_rgba(14,165,233,0.9)]">
                {getMadrasaLogo(madrasaInfo) ? (
                  <img src={getMadrasaLogo(madrasaInfo)} alt={`${getMadrasaDisplayName(madrasaInfo)} logo`} className="h-full w-full object-cover" />
                ) : (
                  <span>{getMadrasaDisplayName(madrasaInfo)[0]?.toUpperCase() || 'M'}</span>
                )}
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">{getMadrasaDisplayName(madrasaInfo)}</div>
                  <div className={`mt-1 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{t.workspace}</div>
                </div>
              )}
            </div>
          </div>

          <nav
            className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="space-y-6">
              {groupedMenu.map((group) => (
                <div key={group.title}>
                  {sidebarOpen && <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{group.title}</p>}
                  <ul className="space-y-1.5">
                    {group.items.map((item) => {
                      const activeDropdown = item.type === 'dropdown' && isDropdownActive(item.items);
                      const activeLink = item.type === 'link' && isActive(item.path);
                      const buttonBase = activeLink || activeDropdown
                        ? theme === 'dark' ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 via-sky-900/30 to-slate-800 text-cyan-300' : 'border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white text-cyan-700'
                        : theme === 'dark' ? 'border-transparent text-slate-400 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 hover:shadow-sm' : 'border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm';

                      return (
                        <li key={item.id}>
                          {item.type === 'link' ? (
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${buttonBase}`}
                              title={!sidebarOpen ? item.label : ''}
                            >
                              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeLink ? 'bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]' : theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
                                {item.icon}
                              </span>
                              {sidebarOpen && <span className="text-[13px] font-medium">{item.label}</span>}
                            </button>
                          ) : (
                            <div>
                              <button
                                onClick={() => sidebarOpen && setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                className={`group flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${buttonBase}`}
                                title={!sidebarOpen ? item.label : ''}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeDropdown ? 'bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]' : theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
                                    {item.icon}
                                  </span>
                                  {sidebarOpen && <span className="text-[13px] font-medium">{item.label}</span>}
                                </div>
                                {sidebarOpen && <FiChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180 text-cyan-500' : theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'}`} />}
                              </button>

                              {sidebarOpen && openDropdown === item.id && (
                                <ul className="mt-2 space-y-1 pl-4">
                                  {item.items.map((sub) => {
                                    const activeSub = isActive(sub.path);
                                    return (
                                      <li key={sub.id}>
                                        <button
                                          onClick={() => handleNavigation(sub.path)}
                                          className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${activeSub ? theme === 'dark' ? 'bg-cyan-900/30 font-medium text-cyan-300' : 'bg-cyan-100/80 font-medium text-cyan-800' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                        >
                                          <span className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${activeSub ? 'bg-cyan-500 shadow-[0_0_0_4px_rgba(34,211,238,0.15)]' : theme === 'dark' ? 'bg-slate-600 group-hover:bg-cyan-500' : 'bg-slate-300 group-hover:bg-cyan-400'}`} />
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
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ${theme === 'dark' ? 'border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
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
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${theme === 'dark' ? 'border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                title={t.expandSidebar}
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}

          <div className={`border-t p-3 ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200/80'}`}>
            <div className={`rounded-3xl border p-2 ${theme === 'dark' ? 'border-slate-700/60 bg-slate-800/80' : 'border-cyan-100 bg-cyan-50/70'} ${sidebarOpen ? '' : 'space-y-2'}`}>
              <button
                onClick={() => handleNavigation('profile')}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${isActive('profile') ? theme === 'dark' ? 'bg-gradient-to-r from-cyan-900/30 to-sky-900/30 text-cyan-300' : 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                title={!sidebarOpen ? 'Profile' : ''}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isActive('profile') ? 'bg-cyan-600 text-white' : theme === 'dark' ? 'bg-slate-700 text-slate-400 group-hover:bg-cyan-900/50 group-hover:text-cyan-400' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
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
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${theme === 'dark' ? 'text-rose-400 hover:bg-rose-900/20 hover:text-rose-300' : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'}`}
                title={!sidebarOpen ? t.logout : ''}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-rose-900/30 text-rose-400 group-hover:bg-rose-900/50 group-hover:text-rose-300' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600'}`}>
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

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-slate-950/25 backdrop-blur-[1px] md:hidden" aria-hidden />}

      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header className={`sticky top-0 z-20 mx-3 mt-3 rounded-2xl border navbar-glass ${theme === 'dark' ? 'border-slate-700 bg-slate-900/80' : 'border-cyan-100/70 bg-cyan-50/70'}`}>
          <div className="flex items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'}`}
              >
                <FiMenu size={20} />
              </button>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t.console}</p>
                <h1 className={`mt-1 text-lg font-semibold lg:text-xl ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t.welcome} <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">{user?.name || 'Student'}</span>
                </h1>
                <p className={`mt-1 text-xs lg:text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{t.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`hidden items-center rounded-full border px-4 py-2.5 md:flex ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <FiSearch className="mr-2 text-slate-400" size={18} />
                <input type="text" placeholder={t.search} className={`w-48 bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-slate-300 placeholder:text-slate-500' : 'text-slate-600'}`} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} title={t.theme} className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'}`}>
                  {theme === 'dark' ? <FiSun size={19} /> : <FiMoon size={19} />}
                </button>
                <button onClick={() => { const langs = ['en', 'dari', 'ps']; setLang(langs[(langs.indexOf(lang) + 1) % langs.length]); }} title={t.language} className={`flex h-11 items-center gap-1 rounded-2xl border px-3 transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'}`}>
                  <FiGlobe size={17} />
                  <span className="text-xs font-semibold">{lang === 'en' ? 'EN' : lang === 'dari' ? 'دری' : 'پښتو'}</span>
                </button>
                <button onClick={() => { const sys = [CALENDAR_SYSTEMS.GREGORIAN, CALENDAR_SYSTEMS.HIJRI, CALENDAR_SYSTEMS.JALALI]; const next = sys[(sys.indexOf(calSys) + 1) % sys.length]; setCalSys(next); setCalendarSystem('student', next); }} title={calendarLabels[lang]?.[calSys] || calSys} className={`flex h-11 items-center gap-1 rounded-2xl border px-3 transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'}`}>
                  <FiCalendar size={17} />
                  <span className="text-[10px] font-semibold">{calendarLabels[lang]?.[calSys] || calSys}</span>
                </button>
                <NotificationDropdown t={t} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
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

const StudentPanel = () => (
  <CalendarProvider panelPrefix="student">
    <StudentPanelContent />
  </CalendarProvider>
);

export default StudentPanel;
