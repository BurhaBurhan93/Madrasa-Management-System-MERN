import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiBookOpen, FiCalendar, FiEdit, FiInbox, FiUser,
  FiMenu, FiLogOut, FiCreditCard, FiSearch, FiBell, FiMessageSquare,
  FiChevronDown, FiAward, FiCalendar as FiEvent, FiSettings, FiBriefcase,
  FiBook
} from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useLocalStorage('studentSidebarOpen', true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);

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
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  /* ================= MENU WITH SUBMENU SUPPORT ================= */
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <FiHome size={19} />, 
      path: '', 
      label: 'Dashboard',
      type: 'link'
    },
    { 
      id: 'academic', 
      icon: <FiBookOpen size={19} />, 
      label: 'Academic',
      type: 'dropdown',
      items: [
        { id: 'courses', label: 'My Courses', path: 'courses' },
        { id: 'schedule', label: 'Schedule', path: 'schedule' },
        { id: 'attendance', label: 'Attendance', path: 'attendance' },
        { id: 'exams', label: 'Exams', path: 'exams' },
        { id: 'exam-results', label: 'Exam Results', path: 'exam-results' },
        { id: 'timetable', label: 'Next Semester Timetable', path: 'timetable' },
        { id: 'results', label: 'All Results', path: 'results' },
        { id: 'degrees', label: 'My Degrees', path: 'degrees' },
        { id: 'education', label: 'Education History', path: 'education' },
      ]
    },
    { 
      id: 'assignments', 
      icon: <FiEdit size={19} />, 
      label: 'Assignments',
      type: 'dropdown',
      items: [
        { id: 'all-assignments', label: 'All Assignments', path: 'assignments' },
        { id: 'homework', label: 'Submit Homework', path: 'homework-submission' },
      ]
    },
    { 
      id: 'library', 
      icon: <FiBook size={19} />, 
      label: 'Library',
      type: 'dropdown',
      items: [
        { id: 'resources', label: 'Learning Resources', path: 'resources' },
        { id: 'borrowed', label: 'Borrowed Books', path: 'borrowed' },
        { id: 'purchase', label: 'Purchase History', path: 'purchase' },
      ]
    },
    { 
      id: 'finance', 
      icon: <FiCreditCard size={19} />, 
      label: 'Finance',
      type: 'dropdown',
      items: [
        { id: 'fees', label: 'Fees & Payments', path: 'fees' },
        { id: 'transactions', label: 'Transaction History', path: 'transactions' },
      ]
    },
    { 
      id: 'hostel', 
      icon: <FiHome size={19} />, 
      path: 'hostel', 
      label: 'Hostel',
      type: 'link'
    },
    { 
      id: 'leave', 
      icon: <FiCalendar size={19} />, 
      path: 'leave', 
      label: 'Leave',
      type: 'link'
    },
    { 
      id: 'communications', 
      icon: <FiMessageSquare size={19} />, 
      label: 'Communications',
      type: 'dropdown',
      items: [
        { id: 'messages', label: 'Messages', path: 'communications' },
        { id: 'complaints', label: 'Complaints', path: 'complaints' },
      ]
    },
    { 
      id: 'certificates', 
      icon: <FiAward size={19} />, 
      path: 'certificates', 
      label: 'Certificates',
      type: 'link'
    },
    { 
      id: 'events', 
      icon: <FiEvent size={19} />, 
      path: 'events', 
      label: 'Events',
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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  const groupedMenu = useMemo(() => ([
    { title: 'Overview', items: menuItems.slice(0, 2) }, // Dashboard, Academic dropdown
    { title: 'Operations', items: menuItems.slice(2) }   // Assignments, Library, Finance, Hostel, Leave, Communications, Certificates, Events
  ]), []);

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.9),_rgba(248,250,252,1)_42%,_rgba(241,245,249,1)_100%)]">
      <aside
        className={`fixed z-30 h-screen border-r border-white/70 bg-white/90 backdrop-blur-xl transition-all duration-300 md:relative ${sidebarOpen ? 'w-72' : 'w-24'}`}
      >
        <div className="flex h-full flex-col">
          <div className={`border-b border-slate-200/80 px-4 py-5 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-lg font-bold text-white shadow-[0_12px_30px_-18px_rgba(14,165,233,0.9)]">
                M
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Madrasa EMIS</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">Student Workspace</div>
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
                        ? 'border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white text-cyan-700 '
                        : 'border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm';

                      return (
                        <li key={item.id}>
                          {item.type === 'link' ? (
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${buttonBase}`}
                              title={!sidebarOpen ? item.label : ''}
                            >
                              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeLink ? 'bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
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
                                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${activeDropdown ? 'bg-cyan-600 text-white shadow-[0_10px_25px_-18px_rgba(8,145,178,0.9)]' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
                                    {item.icon}
                                  </span>
                                  {sidebarOpen && <span className="text-[13px] font-medium">{item.label}</span>}
                                </div>
                                {sidebarOpen && <FiChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180 text-cyan-600' : 'text-slate-400 group-hover:text-slate-700'}`} />}
                              </button>

                              {sidebarOpen && openDropdown === item.id && (
                                <ul className="mt-2 space-y-1 pl-4">
                                  {item.items.map((sub) => {
                                    const activeSub = isActive(sub.path);
                                    return (
                                      <li key={sub.id}>
                                        <button
                                          onClick={() => handleNavigation(sub.path)}
                                          className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${activeSub ? 'bg-cyan-100/80 font-medium text-cyan-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                        >
                                          <span className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${activeSub ? 'bg-cyan-500 shadow-[0_0_0_4px_rgba(34,211,238,0.15)]' : 'bg-slate-300 group-hover:bg-cyan-400'}`} />
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

          <div className="border-t border-slate-200/80 p-3">
            <div className={`rounded-3xl border border-slate-200 bg-white/95 p-2 ${sidebarOpen ? '' : 'space-y-2'}`}>
              <button
                onClick={() => handleNavigation('profile')}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${isActive('profile') ? 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                title={!sidebarOpen ? 'Profile' : ''}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isActive('profile') ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
                  <FiUser size={18} />
                </span>
                {sidebarOpen && (
                  <div>
                    <p className="text-[13px] font-medium">Profile</p>
                    <p className="text-xs text-slate-400">Account and identity</p>
                  </div>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-rose-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-700"
                title={!sidebarOpen ? 'Logout' : ''}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-all duration-200 group-hover:bg-rose-100 group-hover:text-rose-600">
                  <FiLogOut size={18} />
                </span>
                {sidebarOpen && (
                  <div>
                    <p className="text-[13px] font-medium">Logout</p>
                    <p className="text-xs text-rose-300">Exit this workspace</p>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-slate-950/25 backdrop-blur-[1px] md:hidden" aria-hidden />}

      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/72 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <FiMenu size={20} />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Student Console</p>
                <h1 className="mt-1 text-lg font-semibold text-slate-900 lg:text-xl">
                  Welcome back, <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">{user?.name || 'Student'}</span>
                </h1>
                <p className="mt-1 text-xs text-slate-500 lg:text-sm">Manage your academic journey with a cleaner workspace and faster navigation.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 md:flex">
                <FiSearch className="mr-2 text-slate-400" size={18} />
                <input type="text" placeholder="Search courses, assignments..." className="w-48 bg-transparent text-sm text-slate-600 outline-none" />
              </div>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                <FiBell size={19} />
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentPanel;
