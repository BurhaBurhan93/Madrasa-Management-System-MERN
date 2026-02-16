import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Input from '../components/UIHelper/Input';
import Button from '../components/UIHelper/Button';
import Avatar from '../components/UIHelper/Avatar';
import Badge from '../components/UIHelper/Badge';
import { validateEmail, validatePhone } from '../lib/utils';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    email: 'ahmed.mohamed@example.com',
    username: 'ahmed_mohamed',
    studentId: 'STU2024001',
    phoneNumber: '+1234567890',
    dateOfBirth: '2000-05-15',
    address: '123 Education Street, Knowledge City',
    profilePicture: null
  });

  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  
  // Security related state
  const [showSecurity, setShowSecurity] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginHistory, setLoginHistory] = useState([
    { id: 1, date: '2024-02-10 10:30 AM', ip: '192.168.1.100', location: 'Local', status: 'Success' },
    { id: 2, date: '2024-02-09 3:45 PM', ip: '203.0.113.45', location: 'Remote', status: 'Success' },
    { id: 3, date: '2024-02-08 8:15 AM', ip: '198.51.100.23', location: 'Remote', status: 'Failed' }
  ]);

  const [securityErrors, setSecurityErrors] = useState({});
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    // In a real app, you would save to the backend
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset to original data
    setEditMode(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSecurityPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (securityErrors[name]) {
      setSecurityErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateSecurityPasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setSecurityErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSecurityPasswordSubmit = (e) => {
    e.preventDefault();
    
    if (validateSecurityPasswordForm()) {
      // In a real app, you would send to the backend
      alert('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    alert(`Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'} successfully!`);
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      // In a real app, you would send to the backend
      alert('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleShowChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Success':
        return 'Success';
      case 'Failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8">
      <div className="space-y-6">
        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col sm:flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Card>
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar alt={`${userData.firstName} ${userData.lastName}`} size="xl" />
                  )}
                  {editMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white text-sm underline"
                      >
                        Change
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  )}
                </div>
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-600">Student ID: {userData.studentId}</p>
                
                <div className="mt-6 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">Student</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <span className="text-gray-600">Enrollment:</span>
                    <span className="font-medium">Fall 2023</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="w-full md:w-2/3 space-y-6">
            <Card>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="flex space-x-2">
                  {!editMode ? (
                    <Button variant="outline" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                
                <Input
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                
                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                
                <Input
                  label="Username"
                  id="username"
                  name="username"
                  type="text"
                  value={userData.username}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                
                <Input
                  label="Student ID"
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={userData.studentId}
                  onChange={handleInputChange}
                  disabled={true} // Student ID is not editable
                />
                
                <Input
                  label="Phone Number"
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                
                <Input
                  label="Date of Birth"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={userData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Address"
                  id="address"
                  name="address"
                  type="textarea"
                  value={userData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
            </Card>

            {/* Academic Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                  <p className="text-gray-900">Fall 2023</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <p className="text-gray-900">3.7</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits Completed</label>
                  <p className="text-gray-900">45</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation</label>
                  <p className="text-gray-900">Spring 2025</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Security Settings */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              {showSecurity ? 'Hide' : 'Show'} Security Settings
              <svg 
                className={`ml-1 w-4 h-4 transition-transform ${showSecurity ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showSecurity && (
            <div className="space-y-6 pt-4">
              {/* Change Password */}
              <div className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handleSecurityPasswordSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      label="Current Password"
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handleSecurityPasswordChange}
                      error={securityErrors.currentPassword}
                      placeholder="Enter your current password"
                    />
                    
                    <Input
                      label="New Password"
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handleSecurityPasswordChange}
                      error={securityErrors.newPassword}
                      placeholder="Enter your new password"
                      helperText="Must be at least 6 characters"
                    />
                    
                    <Input
                      label="Confirm New Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handleSecurityPasswordChange}
                      error={securityErrors.confirmPassword}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable 2FA</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Add an extra layer of security to your account with two-factor authentication.
                    </p>
                  </div>
                  <button
                    onClick={toggleTwoFactor}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {twoFactorEnabled && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Setup Instructions</h4>
                    <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
                      <li>Download Google Authenticator or similar app</li>
                      <li>Scan the QR code with your authenticator app</li>
                      <li>Enter the 6-digit code from the app</li>
                      <li>Click verify to complete setup</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Session Management */}
              <div className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistory.map(session => (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Browser</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.ip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              session.status === 'Success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline">
                    Log Out All Other Sessions
                  </Button>
                </div>
              </div>

              {/* Security Recommendations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800">Password Strength</h4>
                    <p className="text-sm text-green-700 mt-1">Your password is strong and secure.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800">Two-Factor Auth</h4>
                    <p className="text-sm text-blue-700 mt-1">Consider enabling 2FA for better security.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
};

export default StudentProfile;