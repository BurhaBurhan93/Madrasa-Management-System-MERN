import { useState, useRef } from 'react';

const Profile = () => {
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
    // Here you would typically send the updated data to the server
    console.log('Saving user data:', userData);
    setEditMode(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    setUserData({
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
    setEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the image to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
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

  const validatePasswordChange = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePasswordChange()) {
      return;
    }
    
    // Here you would typically send the password change request to the server
    console.log('Changing password:', passwordData);
    
    // Reset form and close modal
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Profile Management</h2>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={userData.profilePicture || "https://via.placeholder.com/120x120/3b82f6/ffffff?text=SM"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="ml-6">
            <h3 className="text-xl font-bold text-gray-800">{userData.firstName} {userData.lastName}</h3>
            <p className="text-gray-600">Student ID: {userData.studentId}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleEditToggle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={userData.studentId}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={userData.dateOfBirth}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                editMode 
                  ? 'border-gray-300 focus:ring-blue-200 focus:border-blue-500' 
                  : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
        </div>
        
        {editMode && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
          <button
            onClick={() => setShowChangePassword(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Change Password
          </button>
        </div>
        
        {showChangePassword && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      passwordErrors.currentPassword 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      passwordErrors.newPassword 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      passwordErrors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;