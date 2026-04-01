import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import Card from '../components/UIHelper/Card';

import Input from '../components/UIHelper/Input';

import Button from '../components/UIHelper/Button';

import Avatar from '../components/UIHelper/Avatar';

import Badge from '../components/UIHelper/Badge';

import ErrorPage from '../components/UIHelper/ErrorPage';

import axios from 'axios';



const StudentProfile = () => {

  console.log('[StudentProfile] Component initializing...');

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({

    name: '',

    fatherName: '',

    email: '',

    phone: '',

    whatsapp: '',

    dob: '',

    bloodType: '',

    idNumber: '',

    permanentAddress: { province: '', district: '', village: '' },

    currentAddress: { province: '', district: '', village: '' },

    role: '',

    status: '',

    profilePicture: null

  });



  const [editMode, setEditMode] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const [passwordData, setPasswordData] = useState({

    currentPassword: '',

    newPassword: '',

    confirmPassword: ''

  });

  

  // Security related state

  const [showSecurity, setShowSecurity] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // TODO: Replace with actual login history from API when available

  const [loginHistory] = useState([]);



  const [securityErrors, setSecurityErrors] = useState({});



  // Get API config with auth token

  const getConfig = () => {

    const token = localStorage.getItem('token');

    console.log('[StudentProfile] Token exists:', !!token);

    return {

      headers: { Authorization: `Bearer ${token}` }

    };

  };



  useEffect(() => {

    console.log('[StudentProfile] useEffect triggered - fetching user data...');

    fetchUserData();

  }, []);



  const fetchUserData = async () => {

    try {

      setLoading(true);

      setError(null);

      console.log('[StudentProfile] Fetching user profile from API...');

      

      const config = getConfig();

      const response = await axios.get('http://localhost:5000/api/student/profile', config);

      

      console.log('[StudentProfile] API response:', response.data);

      

      // Merge API data with default structure

      setUserData(prev => ({

        ...prev,

        ...response.data,

        name: response.data.name || '',

        email: response.data.email || '',

        phone: response.data.phone || '',

        role: response.data.role || 'student',

        status: response.data.status || 'active'

      }));

    } catch (err) {

      console.error('[StudentProfile] Error fetching user data:', err);

      setError('Failed to load profile data. Please try again.');

    } finally {

      setLoading(false);

    }

  };



  const handleInputChange = (e) => {

    const { name, value } = e.target;

    console.log(`[StudentProfile] Input changed - ${name}:`, value);

    setUserData(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const handleEditToggle = () => {

    setEditMode(!editMode);

  };



  const handleSave = async () => {

    console.log('[StudentProfile] Saving profile data:', userData);

    try {

      const userId = localStorage.getItem('userId');

      const config = getConfig();

      await axios.put(`http://localhost:5000/api/users/${userId}`, userData, config);

      console.log('[StudentProfile] Profile updated successfully');

      setEditMode(false);

      alert('Profile updated successfully!');

      fetchUserData();

    } catch (error) {

      console.error('[StudentProfile] Error updating profile:', error);

      alert('Error updating profile: ' + (error.response?.data?.message || error.message));

    }

  };



  const handleCancel = () => {

    setEditMode(false);

    fetchUserData();

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



  const handleSecurityPasswordChange = (e) => {

    const { name, value } = e.target;

    console.log(`[StudentProfile] Password input changed - ${name}`);

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

    console.log('[StudentProfile] Submitting password change');

    

    if (validateSecurityPasswordForm()) {

      // In a real app, you would send to the backend

      console.log('[StudentProfile] Password form validated successfully');

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



  // legacy validatePasswordForm removed (unused)



  // legacy password handlers and status helpers removed (unused)

  const handleLogout = () => {

    console.log('[StudentProfile] Logging out...');

    localStorage.removeItem('studentToken');

    navigate('/');

  };





  if (loading) {

    return (

      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">Loading profile...</p>

        </div>

      </div>

    );

  }



  if (error) {

    return (

      <ErrorPage 

        type="generic" 

        title="Profile Unavailable"

        message={error}

        onRetry={fetchUserData}

        onHome={() => window.location.href = '/student/dashboard'}

        showBackButton={false}

      />

    );

  }



  return (

    <div className="w-full bg-gray-50 min-h-screen">

      <div className="py-6 mb-8">

        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>

        <p className="text-gray-600">Manage your personal information and preferences</p>

      </div>



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

                  {userData.name}

                </h2>

                <p className="text-gray-600">{userData.email}</p>

                

                <div className="mt-6 space-y-2">

                  <div className="flex flex-col sm:flex-row justify-between gap-2">

                    <span className="text-gray-600">Role:</span>

                    <span className="font-medium">{userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}</span>

                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-2">

                    <span className="text-gray-600">Status:</span>

                    <Badge variant={userData.status === 'active' ? 'success' : 'danger'}>

                      {userData.status?.charAt(0).toUpperCase() + userData.status?.slice(1)}

                    </Badge>

                  </div>

                  {userData.phone && (

                    <div className="flex flex-col sm:flex-row justify-between gap-2">

                      <span className="text-gray-600">Phone:</span>

                      <span className="font-medium">{userData.phone}</span>

                    </div>

                  )}

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

                <Input label="Name" name="name" value={userData.name || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="Father Name" name="fatherName" value={userData.fatherName || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="Email" name="email" value={userData.email || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="Phone" name="phone" value={userData.phone || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="WhatsApp" name="whatsapp" value={userData.whatsapp || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="Date of Birth" type="date" name="dob" value={userData.dob || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="Blood Type" name="bloodType" value={userData.bloodType || ''} onChange={handleInputChange} disabled={!editMode} />

                <Input label="ID Number" name="idNumber" value={userData.idNumber || ''} onChange={handleInputChange} disabled={!editMode} />

              </div>

            </Card>



            {/* Address Information */}

            <Card>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>

              <div className="mb-4">

                <h3 className="font-medium text-gray-700 mb-2">Permanent Address</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <Input label="Province" value={userData.permanentAddress?.province || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, province: e.target.value}})} disabled={!editMode} />

                  <Input label="District" value={userData.permanentAddress?.district || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, district: e.target.value}})} disabled={!editMode} />

                  <Input label="Village" value={userData.permanentAddress?.village || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, village: e.target.value}})} disabled={!editMode} />

                </div>

              </div>

              <div>

                <h3 className="font-medium text-gray-700 mb-2">Current Address</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <Input label="Province" value={userData.currentAddress?.province || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, province: e.target.value}})} disabled={!editMode} />

                  <Input label="District" value={userData.currentAddress?.district || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, district: e.target.value}})} disabled={!editMode} />

                  <Input label="Village" value={userData.currentAddress?.village || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, village: e.target.value}})} disabled={!editMode} />

                </div>

              </div>

            </Card>



            {/* Guardian Information */}

            <Card>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guardian Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Input 

                  label="Guardian Name" 

                  name="guardianName" 

                  value={userData.guardianName || ''} 

                  onChange={handleInputChange} 

                  disabled={!editMode} 

                  placeholder="Father or Guardian Name"

                />

                <Input 

                  label="Guardian Phone" 

                  name="guardianPhone" 

                  value={userData.guardianPhone || ''} 

                  onChange={handleInputChange} 

                  disabled={!editMode} 

                  placeholder="Guardian contact number"

                />

                <Input 

                  label="Guardian Email" 

                  name="guardianEmail" 

                  value={userData.guardianEmail || ''} 

                  onChange={handleInputChange} 

                  disabled={!editMode} 

                  placeholder="Guardian email address"

                />

                <Input 

                  label="Relationship" 

                  name="guardianRelationship" 

                  value={userData.guardianRelationship || ''} 

                  onChange={handleInputChange} 

                  disabled={!editMode} 

                  placeholder="e.g., Father, Mother, Uncle"

                />

              </div>

            </Card>



            {/* Academic Information */}

            <Card>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-blue-50 p-4 rounded-lg">

                  <p className="text-sm text-gray-600 mb-1">Student Code</p>

                  <p className="text-lg font-semibold text-gray-900">{userData.studentCode || 'STU-2024-001'}</p>

                </div>

                <div className="bg-green-50 p-4 rounded-lg">

                  <p className="text-sm text-gray-600 mb-1">Current Level</p>

                  <p className="text-lg font-semibold text-gray-900">{userData.currentLevel || 'Level 3'}</p>

                </div>

                <div className="bg-purple-50 p-4 rounded-lg">

                  <p className="text-sm text-gray-600 mb-1">Current Class</p>

                  <p className="text-lg font-semibold text-gray-900">{userData.currentClass || 'Class A'}</p>

                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">

                  <p className="text-sm text-gray-600 mb-1">Admission Date</p>

                  <p className="text-lg font-semibold text-gray-900">

                    {userData.admissionDate ? new Date(userData.admissionDate).toLocaleDateString() : '2023-09-01'}

                  </p>

                </div>

              </div>

              

              <div className="mt-6">

                <h3 className="font-medium text-gray-700 mb-3">Academic Progress</h3>

                <div className="space-y-3">

                  <div>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">Overall Progress</span>

                      <span className="font-medium text-blue-600">65%</span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">

                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>

                    </div>

                  </div>

                  <div>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">Attendance Rate</span>

                      <span className="font-medium text-green-600">92%</span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">

                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>

                    </div>

                  </div>

                  <div>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">Assignment Completion</span>

                      <span className="font-medium text-purple-600">78%</span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">

                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>

                    </div>

                  </div>

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

      <div className="bg-gray-50 border-t p-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">

            {userData.name?.[0] || 'S'}

          </div>

          <div>

            <p className="font-medium leading-tight text-gray-900">

              {userData.name}

            </p>

            <p className="text-sm text-gray-500 leading-tight">{userData.email}</p>

          </div>

        </div>

        <button

          onClick={handleLogout}

          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2"

        >

          Logout

        </button>

      </div>

    </div>

  );

};



export default StudentProfile;

