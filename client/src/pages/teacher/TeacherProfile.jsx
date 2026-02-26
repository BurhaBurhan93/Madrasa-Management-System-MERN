import React, { useState, useRef } from 'react';
import Card from '../../components/UIHelper/Card';
import Input from '../../components/UIHelper/Input';
import Button from '../../components/UIHelper/Button';
import Avatar from '../../components/UIHelper/Avatar';
import Badge from '../../components/UIHelper/Badge';

const TeacherProfile = () => {
  const [userData, setUserData] = useState({
    firstName: 'Abdul',
    lastName: 'Rahman',
    email: 'ustad.rahman@example.com',
    username: 'ustad_rahman',
    employeeId: 'TCH2024001',
    phoneNumber: '+1234567890',
    dateOfBirth: '1985-08-12',
    address: 'Madrasa Main Campus',
    qualification: 'Master in Islamic Studies',
    experienceYears: '8',
    department: 'Hadith Department',
    joiningDate: '2018-09-01',
    profilePicture: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
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
                  {userData.firstName} {userData.lastName}
                </h2>

                <p className="text-gray-600">Employee ID: {userData.employeeId}</p>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">Teacher</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{userData.department}</span>
                  </div>
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
                <Input label="First Name" name="firstName" value={userData.firstName} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Last Name" name="lastName" value={userData.lastName} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Email" name="email" value={userData.email} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Username" name="username" value={userData.username} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Employee ID" name="employeeId" value={userData.employeeId} disabled />
                <Input label="Phone Number" name="phoneNumber" value={userData.phoneNumber} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Date of Birth" type="date" name="dateOfBirth" value={userData.dateOfBirth} onChange={handleInputChange} disabled={!editMode} />
              </div>

              <div className="mt-4">
                <Input label="Address" type="textarea" name="address" value={userData.address} onChange={handleInputChange} disabled={!editMode} />
              </div>
            </Card>

            {/* Professional Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Qualification" name="qualification" value={userData.qualification} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Years of Experience" name="experienceYears" value={userData.experienceYears} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Department" name="department" value={userData.department} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Joining Date" type="date" name="joiningDate" value={userData.joiningDate} onChange={handleInputChange} disabled={!editMode} />
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfile;
