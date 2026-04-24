import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiBookOpen, FiInbox, FiUser, FiMenu, FiLogOut,
  FiSearch, FiBell, FiChevronDown,
  FiUsers, FiPackage, FiDollarSign, FiUserPlus, FiCoffee, FiAward
} from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

const StaffPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('staffSidebarOpen', true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Error reading user:', e);
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
  }, [setSidebarOpen]);

  const menuItems = [
    { id: 'dashboard', icon: <FiHome size={19} />, path: 'dashboard', label: 'Dashboard', type: 'link' },
    {
      id: 'registrar',
      icon: <FiAward size={19} />,
      label: 'Registrar / Student Affairs',
      type: 'dropdown',
      items: [
        { id: 'admissions', label: 'Student Admissions', path: 'registrar/admissions' },
        { id: 'student-registration', label: 'Student Registration', path: 'registrar/student-registration' },
        { id: 'students', label: 'All Students', path: 'registrar/students' },
        { id: 'profiles', label: 'Student Profiles', path: 'registrar/profiles' },
        { id: 'class-assignment', label: 'Class Assignment', path: 'registrar/class-assignment' },
        { id: 'data-correction', label: 'Data Correction', path: 'registrar/data-correction' },
        { id: 'guardians', label: 'Guardian Management', path: 'registrar/guardians' },
        { id: 'education-history', label: 'Education History', path: 'registrar/education-history' },
        { id: 'documents', label: 'Documents Management', path: 'registrar/documents' },
        { id: 'hostel', label: 'Hostel Management', path: 'registrar/hostel' },
        { id: 'hostel-rooms', label: 'Hostel Rooms', path: 'registrar/hostel-rooms' },
        { id: 'hostel-allocations', label: 'Room Allocations', path: 'registrar/hostel-allocations' },
        { id: 'hostel-meals', label: 'Meal Management', path: 'registrar/hostel-meals' },
        { id: 'reports', label: 'Reports & Export', path: 'registrar/reports' }
      ]
    },
    { id: 'students', icon: <FiUsers size={19} />, path: 'students', label: 'Students', type: 'link' },
    { id: 'inventory', icon: <FiPackage size={19} />, path: 'inventory', label: 'Inventory', type: 'link' },
    {
      id: 'library',
      icon: <FiBookOpen size={19} />,
      label: 'Library',
      type: 'dropdown',
      items: [
        { id: 'categories', label: 'Categories', path: 'library/categories' },
        { id: 'books', label: 'Books', path: 'library/books' },
        { id: 'borrowed', label: 'Borrowed', path: 'library/borrowed' },
        { id: 'purchases', label: 'Purchases', path: 'library/purchases' },
        { id: 'sales', label: 'Sales', path: 'library/sales' },
        { id: 'reports', label: 'Reports', path: 'library/reports' }
      ]
    },
    {
      id: 'complaints',
      icon: <FiInbox size={19} />,
      label: 'Complaints',
      type: 'dropdown',
      items: [
        { id: 'list', label: 'Complaints List', path: 'complaints' },
        { id: 'actions', label: 'Actions', path: 'complaints/actions' },
        { id: 'feedback', label: 'Feedback', path: 'complaints/feedback' },
        { id: 'reports', label: 'Reports', path: 'complaints/reports' }
      ]
    },
    {
      id: 'finance',
      icon: <FiBookOpen size={19} />,
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
      icon: <FiDollarSign size={19} />,
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
      icon: <FiCoffee size={19} />,
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
      icon: <FiUsers size={19} />,
      label: 'HR',
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
    navigate(`/staff/${path}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isActive = (path) => {
    if (!path) return location.pathname === '/staff' || location.pathname === '/staff/';
    return location.pathname.startsWith(`/staff/${path}`);
  };

  const isDropdownActive = (items) => items.some((item) => location.pathname.startsWith(`/staff/${item.path}`));

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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const groupedMenu = useMemo(() => ([
    { title: 'Overview', items: menuItems.slice(0, 4) },
    { title: 'Operations', items: menuItems.slice(4) }
  ]), [location.pathname]);

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
                  <div className="mt-1 text-lg font-semibold text-slate-900">Staff Workspace</div>
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Staff Console</p>
                <h1 className="mt-1 text-lg font-semibold text-slate-900 lg:text-xl">
                  Welcome back, <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">{user?.name || 'Staff'}</span>
                </h1>
                <p className="mt-1 text-xs text-slate-500 lg:text-sm">Manage operations with a cleaner workspace and faster navigation.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 md:flex">
                <FiSearch className="mr-2 text-slate-400" size={18} />
                <input type="text" placeholder="Search modules, tables..." className="w-48 bg-transparent text-sm text-slate-600 outline-none" />
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

export default StaffPanel;
