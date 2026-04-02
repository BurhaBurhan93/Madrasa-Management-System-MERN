import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Avatar from '../components/UIHelper/Avatar';
import Badge from '../components/UIHelper/Badge';
import ErrorPage from '../components/UIHelper/ErrorPage';
import axios from 'axios';

const StudentProfile = () => {
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
    profilePicture: null,
    studentCode: '',
    currentLevel: '',
    currentClass: '',
    admissionDate: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelationship: ''
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/profile', config);
      
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

  const handleLogout = () => {
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
        <p className="text-gray-600 mt-1">View your personal and academic information</p>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Information Managed by Registrar's Office</h3>
              <p className="mt-1 text-sm text-blue-700">
                This profile is read-only. All student information is managed by the Registrar / Student Affairs department to ensure data accuracy and integrity.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => navigate('/student/complaints')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Request Data Change
                </button>
                <span className="text-blue-400">|</span>
                <button
                  onClick={() => navigate('/student/communications')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col sm:flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Card>
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {userData.profilePicture ? (
                    <img 
                      src={userData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar alt={`${userData.name}`} size="xl" />
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

          {/* Profile Form - READ ONLY */}
          <div className="w-full md:w-2/3 space-y-6">
            <Card>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Managed by Registrar's Office • Read-only access</p>
                  </div>
                  <button
                    onClick={() => navigate('/student/complaints')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Request Change
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={userData.name || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                  <input 
                    type="text" 
                    value={userData.fatherName || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={userData.email || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={userData.phone || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    value={userData.whatsapp || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input 
                    type="text" 
                    value={userData.dob ? new Date(userData.dob).toLocaleDateString() : ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <input 
                    type="text" 
                    value={userData.bloodType || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input 
                    type="text" 
                    value={userData.idNumber || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Permanent Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input 
                      type="text" 
                      value={userData.permanentAddress?.province || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input 
                      type="text" 
                      value={userData.permanentAddress?.district || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input 
                      type="text" 
                      value={userData.permanentAddress?.village || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Current Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input 
                      type="text" 
                      value={userData.currentAddress?.province || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input 
                      type="text" 
                      value={userData.currentAddress?.district || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input 
                      type="text" 
                      value={userData.currentAddress?.village || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Guardian Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guardian Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input 
                    type="text" 
                    value={userData.guardianName || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Father or Guardian Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                  <input 
                    type="text" 
                    value={userData.guardianPhone || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Guardian contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email</label>
                  <input 
                    type="email" 
                    value={userData.guardianEmail || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Guardian email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input 
                    type="text" 
                    value={userData.guardianRelationship || ''} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="e.g., Father, Mother, Uncle"
                  />
                </div>
              </div>
            </Card>

            {/* Academic Information */}
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Academic Information</h2>
                <p className="text-sm text-gray-500 mt-1">Your academic progress and enrollment details</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1 font-medium">Student Code</p>
                  <p className="text-lg font-semibold text-blue-900">{userData.studentCode || 'N/A'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1 font-medium">Current Level</p>
                  <p className="text-lg font-semibold text-green-900">{userData.currentLevel || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1 font-medium">Current Class</p>
                  <p className="text-lg font-semibold text-purple-900">{userData.currentClass || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-1 font-medium">Admission Date</p>
                  <p className="text-lg font-semibold text-yellow-900">
                    {userData.admissionDate ? new Date(userData.admissionDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t p-4 flex items-center justify-between mt-8">
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
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;
