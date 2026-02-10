import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Input from '../components/UIHelper/Input';
import Button from '../components/UIHelper/Button';
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
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
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">
                      {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                    </span>
                  </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">Student</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment:</span>
                  <span className="font-medium">Fall 2023</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Change Password Section */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              <Button variant="outline" onClick={() => setShowChangePassword(!showChangePassword)}>
                {showChangePassword ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {showChangePassword && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Current Password"
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                  />
                  
                  <Input
                    label="New Password"
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;