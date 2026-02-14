import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

const StudentPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useLocalStorage('studentUser', {
    name: 'Ahmed Mohamed',
    role: 'Student',
    studentId: 'STU2024001',
    email: 'ahmed.mohamed@example.com'
  });

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Menu items with dropdowns
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      type: 'link'
    },
    {
      id: 'academic',
      label: 'Academic',
      type: 'dropdown',
      items: [
        { id: 'courses', label: 'My Courses', path: '/courses' },
        { id: 'schedule', label: 'Schedule', path: '/schedule' },
        { id: 'attendance', label: 'Attendance', path: '/attendance' },
        { id: 'exams', label: 'Exams', path: '/exams' },
        { id: 'results', label: 'Results', path: '/results' },
      ]
    },
    {
      id: 'assignments',
      label: 'Assignments',
      path: '/assignments',
      type: 'link'
    },
    {
      id: 'library',
      label: 'Library',
      type: 'dropdown',
      items: [
        { id: 'resources', label: 'Learning Resources', path: '/resources' },
        { id: 'borrowed', label: 'Borrowed Books', path: '/borrowed' },
        { id: 'purchase', label: 'Purchase History', path: '/purchase' },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      type: 'dropdown',
      items: [
        { id: 'fees', label: 'Fees & Payments', path: '/fees' },
        { id: 'transactions', label: 'Transaction History', path: '/transactions' },
      ]
    },
    {
      id: 'communications',
      label: 'Communications',
      type: 'dropdown',
      items: [
        { id: 'messages', label: 'Messages', path: '/communications' },
        { id: 'complaints', label: 'Complaints', path: '/complaints' },
        { id: 'feedback', label: 'Feedback', path: '/feedback' },
      ]
    },
    /* Removed feedback as separate menu item */
    {
      id: 'profile',
      label: 'Profile',
      type: 'dropdown',
      items: [
        { id: 'personal', label: 'Personal Info', path: '/profile' },
      ]
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const handleLogout = () => {
    // In a real app, you would clear the authentication token
    localStorage.removeItem('studentToken');
    navigate('/'); // Redirect to home instead of login
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-md ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-800">Madrasa EMIS</h1>
                <p className="text-xs text-gray-600">Student Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.type === 'link' ? (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname.includes(item.id)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        <svg
                          className={`w-4 h-4 transform transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    {sidebarOpen && openDropdown === item.id && (
                      <ul className="ml-8 mt-1 space-y-1 bg-gray-50 rounded-lg p-2">
                        {item.items.map((subItem) => (
                          <li key={subItem.id}>
                            <button
                              onClick={() => handleNavigation(subItem.path)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                location.pathname === subItem.path
                                  ? 'bg-blue-200 text-blue-800'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {subItem.label}
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

        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-medium">
                {user.name.charAt(0)}
              </span>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 mr-3 sm:mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="absolute top-1 right-1 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentPanel;