import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/UIHelper/Card';
import Input from '../../components/UIHelper/Input';
import Button from '../../components/UIHelper/Button';
import Avatar from '../../components/UIHelper/Avatar';
import Badge from '../../components/UIHelper/Badge';
import axios from 'axios';

const TeacherProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    fatherName: '',
    grandfatherName: '',
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
  });

  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        if (res.data.success) {
          const user = res.data.data;
          setUserData({
            ...user,
            dob: user.dob ? user.dob.split('T')[0] : '',
            permanentAddress: user.permanentAddress || { province: '', district: '', village: '' },
            currentAddress: user.currentAddress || { province: '', district: '', village: '' }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`http://localhost:5000/api/users/${userId}`, userData);
      setEditMode(false);
      alert('Profile updated successfully!');
      fetchUserData();
    } catch (error) {
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

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Profile</h1>
        <p className="text-gray-600">Manage your professional and personal information</p>
      </div>

      <div className="space-y-6">

        <div className="flex flex-col md:flex-row gap-6">

          {/* Profile Card */}
          <div className="w-full md:w-1/3">
            <Card>
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={userData.status === 'active' ? 'success' : 'danger'}>
                      {userData.status?.charAt(0).toUpperCase() + userData.status?.slice(1)}
                    </Badge>
                  </div>

                  {userData.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{userData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Personal & Professional Info */}
          <div className="w-full md:w-2/3 space-y-6">

            {/* Personal Info */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

                {!editMode ? (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name" name="name" value={userData.name || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Father Name" name="fatherName" value={userData.fatherName || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Grandfather Name" name="grandfatherName" value={userData.grandfatherName || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Email" name="email" value={userData.email || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Phone" name="phone" value={userData.phone || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="WhatsApp" name="whatsapp" value={userData.whatsapp || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Date of Birth" type="date" name="dob" value={userData.dob || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Blood Type" name="bloodType" value={userData.bloodType || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="ID Number" name="idNumber" value={userData.idNumber || ''} onChange={handleInputChange} disabled={!editMode} />
              </div>
            </Card>

            {/* Professional Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Permanent Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Province" name="permanentProvince" value={userData.permanentAddress?.province || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, province: e.target.value}})} disabled={!editMode} />
                  <Input label="District" name="permanentDistrict" value={userData.permanentAddress?.district || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, district: e.target.value}})} disabled={!editMode} />
                  <Input label="Village" name="permanentVillage" value={userData.permanentAddress?.village || ''} onChange={(e) => setUserData({...userData, permanentAddress: {...userData.permanentAddress, village: e.target.value}})} disabled={!editMode} />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Current Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Province" name="currentProvince" value={userData.currentAddress?.province || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, province: e.target.value}})} disabled={!editMode} />
                  <Input label="District" name="currentDistrict" value={userData.currentAddress?.district || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, district: e.target.value}})} disabled={!editMode} />
                  <Input label="Village" name="currentVillage" value={userData.currentAddress?.village || ''} onChange={(e) => setUserData({...userData, currentAddress: {...userData.currentAddress, village: e.target.value}})} disabled={!editMode} />
                </div>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfile;
