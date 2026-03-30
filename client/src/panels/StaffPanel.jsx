import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiBookOpen, FiInbox, FiUser, FiMenu, FiLogOut, 
  FiSearch, FiBell, FiFolder, FiBook, FiClipboard, 
  FiShoppingCart, FiTrendingUp, FiBarChart2, FiChevronDown,
  FiUsers, FiPackage, FiSettings, FiDollarSign, FiUserPlus, FiCoffee
} from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

const StaffPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('staffSidebarOpen', true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

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
      id: 'users',
      icon: <FiUserPlus size={20} />,
      label: 'User Management',
      type: 'dropdown',
      items: [
        { id: 'users-list', label: 'All Users', path: 'users' },
        { id: 'users-register', label: 'Register User', path: 'users/register' },
      ]
    },
    { 
      id: 'students', 
      icon: <FiUsers size={20} />, 
      path: 'students', 
      label: 'Students',
      type: 'link'
    },
    { 
      id: 'inventory', 
      icon: <FiPackage size={20} />, 
      path: 'inventory', 
      label: 'Inventory',
      type: 'link'
    },
    { 
      id: 'library', 
      icon: <FiBookOpen size={20} />, 
      label: 'Library',
      type: 'dropdown',
      items: [
        { id: 'categories', label: 'Categories', path: 'library/categories' },
        { id: 'books', label: 'Books', path: 'library/books' },
        { id: 'borrowed', label: 'Borrowed', path: 'library/borrowed' },
        { id: 'purchases', label: 'Purchases', path: 'library/purchases' },
        { id: 'sales', label: 'Sales', path: 'library/sales' },
        { id: 'reports', label: 'Reports', path: 'library/reports' },
      ]
    },
    { 
      id: 'complaints', 
      icon: <FiInbox size={20} />, 
      label: 'Complaints',
      type: 'dropdown',
      items: [
        { id: 'list', label: 'Complaints List', path: 'complaints' },
        { id: 'actions', label: 'Actions', path: 'complaints/actions' },
        { id: 'feedback', label: 'Feedback', path: 'complaints/feedback' },
        { id: 'reports', label: 'Reports', path: 'complaints/reports' },
      ]
    },
    {
      id: 'finance',
      icon: <FiTrendingUp size={20} />,
      label: 'Finance',
      type: 'dropdown',
      items: [
        { id: 'transactions', label: 'Transactions', path: 'finance/transactions' },
        { id: 'accounts', label: 'Accounts', path: 'finance/accounts' },
        { id: 'fee-structures', label: 'Fee Structures', path: 'finance/fee-structures' },
        { id: 'student-fees', label: 'Student Fees', path: 'finance/student-fees' },
        { id: 'fee-payments', label: 'Fee Payments', path: 'finance/fee-payments' },
        { id: 'expenses', label: 'Expenses', path: 'finance/expenses' },
        { id: 'reports', label: 'Financial Reports', path: 'finance/reports' }
      ]
    },
    {
      id: 'payroll',
      icon: <FiDollarSign size={20} />,
      label: 'Payroll',
      type: 'dropdown',
      items: [
        { id: 'salary-structures', label: 'Salary Structures', path: 'payroll/salary-structures' },
        { id: 'salary-payments', label: 'Salary Payments', path: 'payroll/salary-payments' },
        { id: 'salary-deductions', label: 'Salary Deductions', path: 'payroll/salary-deductions' },
        { id: 'salary-advances', label: 'Salary Advances', path: 'payroll/salary-advances' }
      ]
    },
    { 
      id: 'kitchen', 
      icon: <FiCoffee size={20} />, 
      label: 'Kitchen',
      type: 'dropdown',
      items: [
        { id: 'inventory', label: 'Inventory', path: 'kitchen/inventory' },
        { id: 'meals', label: 'Meal Planning', path: 'kitchen/meals' },
        { id: 'dailyMenu', label: 'Daily Purchases', path: 'kitchen/menu' },
        { id: 'weekly-menu', label: 'Weekly Menu', path: 'kitchen/weekly-menu' },
        { id: 'suppliers', label: 'Suppliers', path: 'kitchen/suppliers' },
        { id: 'waste', label: 'Waste Tracking', path: 'kitchen/waste' },
        { id: 'requests', label: 'Budget Requests', path: 'kitchen/requests' },
        { id: 'reports', label: 'Reports', path: 'kitchen/reports' }
      ]
    },
    { 
      id: 'hr', 
      icon: <FiUsers size={20} />, 
      label: 'Human Resource',
      type: 'dropdown',
      items: [
        { id: 'departments', label: 'Departments', path: 'hr/departments' },
        { id: 'designations', label: 'Designations', path: 'hr/designations' },
        { id: 'leave-types', label: 'Leave Types', path: 'hr/leave-types' },
        { id: 'employee-registration', label: 'Employee Registration', path: 'hr/employee-registration' },
        { id: 'employees', label: 'Employees', path: 'hr/employees' },
        { id: 'attendance', label: 'Attendance', path: 'hr/attendance' },
        { id: 'leave', label: 'Leave Management', path: 'hr/leave' },
        { id: 'payroll', label: 'Payroll', path: 'hr/payroll' },
        { id: 'reports', label: 'Reports', path: 'hr/reports' }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path ? `/staff/${path}` : '/staff');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isActive = (path) => {
    if (!path) return location.pathname === '/staff' || location.pathname === '/staff/';
    return location.pathname.startsWith(`/staff/${path}`);
  };

  const isDropdownActive = (items) => {
    return items.some(item => location.pathname.startsWith(`/staff/${item.path}`));
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

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
              <div className="text-xs text-gray-500 whitespace-nowrap">Staff Panel</div>
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
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">{user?.name || 'Staff'}</span>!
                </h1>
                <p className="text-sm text-gray-500">Manage library and complaints efficiently</p>
              </div>
            </div>

            {/* Right - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                <FiSearch className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search books, complaints..."
                  className="bg-transparent outline-none text-sm text-gray-600 w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <FiBell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              {user && (
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-200 to-cyan-400 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {user.name?.[0] || 'S'}
                  </div>
                </div>
              )}
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

export default StaffPanel;

