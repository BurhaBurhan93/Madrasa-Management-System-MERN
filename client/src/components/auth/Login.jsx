import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiMail, FiUser, FiChevronDown } from 'react-icons/fi';
import { getUserRole, isTokenValid, saveAuth } from '../../lib/auth';
import api from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import { getCachedMadrasaInfo, getMadrasaDisplayName, getMadrasaLogo, getMadrasaAddressText, subscribeToMadrasaInfo } from '../../lib/madrasaInfo';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';

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
  const [madrasaInfo, setMadrasaInfo] = useState(() => getCachedMadrasaInfo());
  const [selectedRole, setSelectedRole] = useState('admin');
  const [staffSubRole, setStaffSubRole] = useState('support');
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ps' || i18n.language === 'prs' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const roles = [
    { id: 'admin', label: t('adminLabel'), icon: 'FiUser' },
    { id: 'teacher', label: t('teacherLabel'), icon: 'FiUser' },
    { id: 'student', label: t('studentLabel'), icon: 'FiUser' },
    { id: 'staff', label: t('staffLabel'), icon: 'FiUser' },
  ];

  const staffSubRoles = [
    { id: 'finance', label: t('financeStaff') },
    { id: 'registrar', label: t('registrarStaff') },
    { id: 'hr', label: t('hrStaff') },
    { id: 'library', label: t('libraryStaff') },
    { id: 'kitchen', label: t('kitchenStaff') },
    { id: 'payroll', label: t('payrollStaff') },
    { id: 'complaints', label: t('complaintsStaff') },
    { id: 'inventory', label: t('inventoryStaff') },
    { id: 'general-manager', label: t('generalManagerStaff') },
  ];

  useEffect(() => {
    if (isTokenValid()) {
      redirectByRole(navigate, getUserRole());
    }
  }, [navigate]);

  useEffect(() => {
    const refresh = () => setMadrasaInfo(getCachedMadrasaInfo());
    const unsubscribe = subscribeToMadrasaInfo(refresh);
    return unsubscribe;
  }, []);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setStaffDropdownOpen(false);
    setErrors({});
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
      newErrors.username = t('usernameRequired');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength');
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
        role: selectedRole,
      });

      const { token, user } = response.data;
      const authenticatedRole = user?.role;
      
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
        general: error.response?.data?.message || t('invalidCredentials') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <button
        onClick={() => navigate('/')}
        className={`absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            : 'border-white/70 bg-white/50 text-slate-700 hover:bg-white/80'
        }`}
      >
        <FiArrowLeft size={18} />
        <span className="text-sm font-medium">{t('backToHome')}</span>
      </button>

      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher dark={theme === 'dark'} />
      </div>

      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'border-slate-700/50 bg-slate-800/90' 
          : 'border-white/60 bg-white/95'
      }`}>
        <div className={`p-8 text-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-4 overflow-hidden ${
            theme === 'dark'
              ? 'bg-slate-700'
              : 'bg-slate-100'
          }`}>
            <img
              src={getMadrasaLogo(madrasaInfo)}
              alt={getMadrasaDisplayName(madrasaInfo)}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
            {getMadrasaDisplayName(madrasaInfo)}
          </h1>
          <p className={`mt-1 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            {t('madrasaSubtitle')}
          </p>
          {getMadrasaAddressText(madrasaInfo) && (
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              {getMadrasaAddressText(madrasaInfo)}
            </p>
          )}
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('selectRole')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      selectedRole === role.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : theme === 'dark'
                        ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              {selectedRole === 'staff' && (
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{staffSubRoles.find(s => s.id === staffSubRole)?.label}</span>
                    <FiChevronDown size={16} className={`transition-transform duration-200 ${staffDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {staffDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setStaffDropdownOpen(false)} />
                      <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg max-h-60 overflow-y-auto ${
                        theme === 'dark'
                          ? 'border-slate-600 bg-slate-800'
                          : 'border-gray-200 bg-white'
                      }`}>
                        {staffSubRoles.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setStaffSubRole(sub.id);
                              setStaffDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                              staffSubRole === sub.id
                                ? theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                                : theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('emailAddress')}
              </label>
              <div className="relative">
                <div className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                  <FiMail size={18} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                    errors.username 
                      ? theme === 'dark'
                        ? 'border-red-500 focus:ring-red-500/20 bg-slate-700/50 text-slate-100'
                        : 'border-red-500 focus:ring-red-200 bg-white text-gray-800'
                      : theme === 'dark'
                      ? 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 bg-slate-700/50 text-slate-100 placeholder-slate-400'
                      : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-200 bg-white text-gray-800 placeholder-gray-400'
                  }`}
                    placeholder={t('enterEmail')}
                  />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('password')}
              </label>
              <div className="relative">
                <div className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                    errors.password 
                      ? theme === 'dark'
                        ? 'border-red-500 focus:ring-red-500/20 bg-slate-700/50 text-slate-100'
                        : 'border-red-500 focus:ring-red-200 bg-white text-gray-800'
                      : theme === 'dark'
                      ? 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 bg-slate-700/50 text-slate-100 placeholder-slate-400'
                      : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-200 bg-white text-gray-800 placeholder-gray-400'
                  }`}
                    placeholder={t('enterPassword')}
                  />
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3.5 top-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className={`h-4 w-4 rounded focus:ring-2 ${
                  theme === 'dark'
                    ? 'text-cyan-600 focus:ring-cyan-500 border-slate-600 bg-slate-700'
                    : 'text-cyan-600 focus:ring-cyan-500 border-gray-300'
                }`}
              />
              <label htmlFor="remember" className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                {t('rememberMe')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 text-sm`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <FiLock size={18} />
                  <span>{t('signIn')}</span>
                </>
              )}
            </button>
          </form>

          <div className={`mt-6 text-center text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            &copy; {new Date().getFullYear()} {getMadrasaDisplayName(madrasaInfo)}. {t('allRightsReserved')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
