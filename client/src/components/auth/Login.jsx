import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const roles = [
    { id: 'admin', label: 'Admin', color: 'from-cyan-400 to-cyan-600', icon: '👑', description: 'System Administrator' },
    { id: 'student', label: 'Student', color: 'from-sky-400 to-blue-500', icon: '🎓', description: 'Student Portal' },
    { id: 'teacher', label: 'Teacher', color: 'from-cyan-300 to-cyan-500', icon: '📚', description: 'Teacher Portal' },
    { id: 'staff', label: 'Staff', color: 'from-sky-300 to-blue-400', icon: '⚙️', description: 'Staff Portal' },
  ];

  const demoCredentials = {
    admin: { username: 'admin@gmail.com', password: 'admin1234' },
    student: { username: 'student@gmail.com', password: 'student1234' },
    teacher: { username: 'teacher@gmail.com', password: 'teacher1234' },
    staff: { username: 'staff@gmail.com', password: 'staff1234' }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    setFormData({ username: '', password: '' });
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials against demo credentials (no database)
    const creds = demoCredentials[selectedRole];
    if (formData.username === creds.username && formData.password === creds.password) {
      // Create mock user data
      const mockUser = {
        id: `${selectedRole}_001`,
        name: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} User`,
        email: creds.username,
        role: selectedRole
      };
      
      // Store user info (no JWT token needed for demo)
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }

      // Navigate based on role
      switch (selectedRole) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'staff':
          navigate('/staff');
          break;
        default:
          navigate('/');
      }
    } else {
      setErrors({ 
        general: 'Invalid credentials. Please try again.' 
      });
    }

    setIsLoading(false);
  };

  const getRoleColor = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.color : 'from-blue-500 to-indigo-600';
  };

  const getRoleLabel = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.label : 'Portal';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Role Selection */}
          <div className="lg:w-1/2 bg-gray-50 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">Select your role to continue</p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shadow-md`}>
                    {role.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${selectedRole === role.id ? 'text-blue-700' : 'text-gray-800'}`}>
                      {role.label}
                    </h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  {selectedRole === role.id && (
                    <div className="ml-auto">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-200 to-cyan-400 text-gray-700 rounded-lg font-medium hover:from-cyan-300 hover:to-cyan-500 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Demo: Auto-fill {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Credentials
              </button>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8">
            <div className={`bg-gradient-to-r ${getRoleColor()} p-6 -mx-8 -mt-8 mb-8 text-center`}>
              <h1 className="text-3xl font-bold text-white mb-2">{getRoleLabel()} Portal</h1>
              <p className="text-white/80">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder={`Enter your ${selectedRole} username`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${getRoleColor()} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign In as ${getRoleLabel()}`
                )}
              </button>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Use Demo Credentials
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Register here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;