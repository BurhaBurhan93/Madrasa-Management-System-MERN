import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiBookOpen, FiUsers, FiEdit, FiCalendar, FiClipboard, 
  FiBarChart2, FiMessageSquare, FiUser, FiMenu, FiLogOut, 
  FiSearch, FiBell, FiChevronDown
} from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useLocalStorage('teacherSidebarOpen', true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user] = useLocalStorage('teacherUser', {
    name: 'Ustad Abdul Rahman',
    role: 'Teacher',
    employeeId: 'TCH2024001',
    email: 'teacher@example.com',
  });

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
  }, []);

  /* ================= MENU WITH SUBMENU SUPPORT ================= */
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <FiHome size={20} />, 
      path: '', 
      label: 'Dashboard',
      type: 'link'
    },
    { 
      id: 'academic', 
      icon: <FiBookOpen size={20} />, 
      label: 'Academic',
      type: 'dropdown',
      items: [
        { id: 'subjects', label: 'My Subjects', path: 'subjects' },
        { id: 'students', label: 'My Students', path: 'students' },
        { id: 'assignments', label: 'Assignments', path: 'assignments' },
        { id: 'create-assignment', label: 'Create Assignment', path: 'create-assignments' },
      ]
    },
    { 
      id: 'attendance', 
      icon: <FiCalendar size={20} />, 
      label: 'Attendance',
      type: 'dropdown',
      items: [
        { id: 'sessions', label: 'Class Sessions', path: 'sessions' },
        { id: 'mark-attendance', label: 'Mark Attendance', path: 'attendance' },
        { id: 'attendance-reports', label: 'Attendance Reports', path: 'attendance-reports' },
      ]
    },
    { 
      id: 'exams', 
      icon: <FiClipboard size={20} />, 
      label: 'Exams',
      type: 'dropdown',
      items: [
        { id: 'exams-list', label: 'My Exams', path: 'exams' },
        { id: 'create-exam', label: 'Create Exam', path: 'exams/create' },
      ]
    },
    { 
      id: 'results', 
      icon: <FiBarChart2 size={20} />, 
      label: 'Results',
      type: 'dropdown',
      items: [
        { id: 'enter-marks', label: 'Enter Marks', path: 'results/enter-marks' },
        { id: 'view-results', label: 'View Results', path: 'results/view-results' },
      ]
    },
    { 
      id: 'communications', 
      icon: <FiMessageSquare size={20} />, 
      label: 'Communications',
      type: 'dropdown',
      items: [
        { id: 'complaints', label: 'Assigned Complaints', path: 'complaints' },
        { id: 'messages', label: 'Messages', path: 'messages' },
      ]
    },
  ];

  /* ================= HELPERS ================= */
  const handleNavigation = (path) => {
    navigate(path ? `/teacher/${path}` : '/teacher');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isActive = (path) => {
    if (!path) return location.pathname === '/teacher' || location.pathname === '/teacher/';
    return location.pathname.startsWith(`/teacher/${path}`);
  };

  const isDropdownActive = (items) => {
    return items.some(item => location.pathname.startsWith(`/teacher/${item.path}`));
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR - Expandable with text and submenus */}
      <aside
        className={`bg-white shadow-lg fixed md:relative z-30 h-screen transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-100 ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-200 to-cyan-400 text-white flex items-center justify-center text-lg font-bold shadow-md shrink-0">
            M
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <div className="font-bold text-gray-800 whitespace-nowrap">Madrasa EMIS</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Teacher Panel</div>
            </div>
          )}
        </div>

        {/* Navigation - With text labels and submenus */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.type === 'link' ? (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-cyan-200 to-cyan-400 text-white shadow-md'
                        : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => sidebarOpen && toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isDropdownActive(item.items)
                          ? 'bg-cyan-50 text-cyan-600'
                          : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                      }`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 ${isDropdownActive(item.items) ? 'text-cyan-500' : ''}`}>
                          {item.icon}
                        </span>
                        {sidebarOpen && (
                          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <FiChevronDown 
                          size={16} 
                          className={`shrink-0 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {sidebarOpen && openDropdown === item.id && (
                      <ul className="mt-1 ml-9 space-y-1">
                        {item.items.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => handleNavigation(sub.path)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive(sub.path)
                                  ? 'bg-cyan-100 text-cyan-700 font-medium'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              }`}
                            >
                              {sub.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom - Profile & Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => handleNavigation('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mb-2 ${
              isActive('profile')
                ? 'bg-gradient-to-r from-cyan-200 to-cyan-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
            }`}
            title={!sidebarOpen ? 'Profile' : ''}
          >
            <span className="shrink-0"><FiUser size={20} /></span>
            {sidebarOpen && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Profile</span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyan-600 hover:bg-cyan-50 transition-all duration-200`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <span className="shrink-0"><FiLogOut size={20} /></span>
            {sidebarOpen && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 md:hidden z-20"
          aria-hidden
        />
      )}

      {/* CONTENT */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left - Toggle & Welcome */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiMenu size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">{user.name}</span>!
                </h1>
                <p className="text-sm text-gray-500">Manage your classes and students efficiently</p>
              </div>
            </div>

            {/* Right - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                <FiSearch className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search students, classes..."
                  className="bg-transparent outline-none text-sm text-gray-600 w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <FiBell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-200 to-cyan-400 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'T'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherPanel;
