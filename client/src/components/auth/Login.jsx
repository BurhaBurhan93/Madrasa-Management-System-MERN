import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiZap, FiEye, FiEyeOff, FiArrowLeft, FiUser } from 'react-icons/fi';
import { getUserRole, isTokenValid, saveAuth } from '../../lib/auth';
import api from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

const redirectByRole = (navigate, role) => {
  const rolePaths = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    teacher: '/teacher',
    staff: '/staff/dashboard',
  };
  navigate(rolePaths[role] || '/', { replace: true });
};

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedStaffAccount, setSelectedStaffAccount] = useState('support');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    if (isTokenValid()) {
      redirectByRole(navigate, getUserRole());
    }
  }, [navigate]);

  const roles = [
    { id: 'admin', label: 'Admin', color: 'from-cyan-500 to-blue-600', icon: '👑', description: 'System Administrator' },
    { id: 'student', label: 'Student', color: 'from-sky-500 to-blue-700', icon: '🎓', description: 'Student Portal' },
    { id: 'teacher', label: 'Teacher', color: 'from-cyan-400 to-cyan-600', icon: '📚', description: 'Teacher Portal' },
    { id: 'staff', label: 'Staff', color: 'from-sky-400 to-blue-500', icon: '⚙️', description: 'Staff Portal' },
  ];

  const staffDemoAccounts = {
    support: { label: 'Support Staff', username: 'staff@gmail.com', password: 'staff1234' },
    finance: { label: 'Finance Staff', username: 'finance@gmail.com', password: 'finance1234' },
    registrar: { label: 'Registrar Staff', username: 'registrar@gmail.com', password: 'registrar1234' },
    hr: { label: 'HR Staff', username: 'hr@gmail.com', password: 'hr1234' },
    library: { label: 'Library Staff', username: 'library@gmail.com', password: 'library1234' },
    kitchen: { label: 'Kitchen Staff', username: 'kitchen@gmail.com', password: 'kitchen1234' },
    payroll: { label: 'Payroll Staff', username: 'payroll@gmail.com', password: 'payroll1234' },
    complaints: { label: 'Complaints Staff', username: 'complaints@gmail.com', password: 'complaints1234' },
    inventory: { label: 'Inventory Staff', username: 'inventory@gmail.com', password: 'inventory1234' },

    all: { label: 'All Staff Modules', username: 'staff.all@gmail.com', password: 'staffall1234' }
  };

  const demoCredentials = {
    admin: { username: 'admin@gmail.com', password: 'admin1234' },
    student: { username: 'student@gmail.com', password: 'student1234' },
    teacher: { username: 'teacher@gmail.com', password: 'teacher1234' },
    staff: staffDemoAccounts[selectedStaffAccount]
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    setFormData({ username: '', password: '' });
  };

  const handleStaffAccountSelect = (accountId) => {
    setSelectedStaffAccount(accountId);
    const creds = staffDemoAccounts[accountId];
    if (selectedRole === 'staff' && creds) {
      setFormData({ username: creds.username, password: creds.password });
    }
  };

  const fillDemoCredentials = () => {
    const creds = demoCredentials[selectedRole];
    if (creds) {
      setFormData({
        username: creds.username,
        password: creds.password
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.username,
        password: formData.password,
        role: selectedRole
      });

      const { token, user } = response.data;
      const authenticatedRole = user?.role || selectedRole;
      
      saveAuth(token, user, authenticatedRole);
      localStorage.removeItem('isDemoMode');
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      if (setUserRole) {
        setUserRole(authenticatedRole);
      }

      redirectByRole(navigate, authenticatedRole);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Invalid credentials. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.color : 'from-cyan-500 to-blue-600';
  };

  const getRoleLabel = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.label : 'Portal';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.95),_rgba(15,23,42,1)_42%,_rgba(30,41,59,1)_100%)]' 
        : 'bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.9),_rgba(248,250,252,1)_42%,_rgba(241,245,249,1)_100%)]'
    }`}>
      <button
        onClick={() => navigate('/')}
        className={`absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            : 'border-white/70 bg-white/80 text-slate-700 hover:bg-white'
        }`}
      >
        <FiArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className={`w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden border transition-colors duration-300 ${
        theme === 'dark' ? 'border-slate-700/60 bg-slate-900/80' : 'border-white/70 bg-white/90'
      }`}>
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Role Selection */}
          <div className={`lg:w-1/2 p-8 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'
          }`}>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                Welcome Back!
              </h2>
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Select your role to continue</p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 hover:-translate-y-1 ${
                    selectedRole === role.id
                      ? `border-cyan-500/60 bg-gradient-to-r ${role.color}/10 shadow-xl`
                      : theme === 'dark'
                      ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white/80'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl shadow-xl`}>
                    {role.icon}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-semibold text-lg ${
                      selectedRole === role.id ? 'text-cyan-600 dark:text-cyan-400' : theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                    }`}>
                      {role.label}
                    </h3>
                    <p className={theme === 'dark' ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>{role.description}</p>
                  </div>
                  {selectedRole === role.id && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedRole === 'staff' && (
              <div className="mt-6">
                <label htmlFor="staffAccount" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  Staff demo account
                </label>
                <select
                  id="staffAccount"
                  value={selectedStaffAccount}
                  onChange={(event) => handleStaffAccountSelect(event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-800 text-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20'
                      : 'border-gray-300 bg-white text-gray-700 focus:border-cyan-500 focus:ring-cyan-200'
                  }`}
                >
                  {Object.entries(staffDemoAccounts).map(([id, account]) => (
                    <option key={id} value={id}>
                      {account.label} - {account.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 hover:-translate-y-1"
              >
                <FiZap size={20} />
                <span>Demo: Auto-fill {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Credentials</span>
              </button>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8">
            <div className={`bg-gradient-to-r ${getRoleColor()} -mx-8 -mt-8 mb-8 p-8 text-center rounded-t-3xl`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg backdrop-blur-sm">
                  {roles.find(r => r.id === selectedRole)?.icon || '🔐'}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{getRoleLabel()} Portal</h1>
              <p className="text-white/80">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className={`p-4 rounded-xl border text-sm ${
                  theme === 'dark'
                    ? 'bg-red-900/20 border-red-500/30 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {errors.general}
                </div>
              )}

              <div>
                <label htmlFor="username" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  Username or Email
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                    <FiUser size={20} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.username 
                        ? theme === 'dark'
                          ? 'border-red-500 focus:ring-red-500/20 bg-slate-800 text-slate-200'
                          : 'border-red-500 focus:ring-red-200 bg-white text-gray-700'
                        : theme === 'dark'
                        ? 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20 bg-slate-800 text-slate-200'
                        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-200 bg-white text-gray-700'
                    }`}
                    placeholder={`Enter your ${selectedRole} username`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                    <FiLock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.password 
                        ? theme === 'dark'
                          ? 'border-red-500 focus:ring-red-500/20 bg-slate-800 text-slate-200'
                          : 'border-red-500 focus:ring-red-200 bg-white text-gray-700'
                        : theme === 'dark'
                        ? 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20 bg-slate-800 text-slate-200'
                        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-200 bg-white text-gray-700'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className={`h-4 w-4 rounded focus:ring-2 ${
                      theme === 'dark'
                        ? 'text-cyan-600 focus:ring-cyan-500 border-slate-600 bg-slate-800'
                        : 'text-cyan-600 focus:ring-cyan-500 border-gray-300'
                    }`}
                  />
                  <label htmlFor="remember" className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>
                    Remember me
                  </label>
                </div>
                <a href="#" className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                }`}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${getRoleColor()} text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FiLock size={20} />
                    <span>Sign In as {getRoleLabel()}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
