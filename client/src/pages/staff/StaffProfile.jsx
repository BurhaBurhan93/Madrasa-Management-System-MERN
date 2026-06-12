import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { Card, Button, Input, Avatar, Badge, Form } from '../../components/UIHelper';

const StaffProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Ahmed Khan',
    email: 'ahmed.khan@madrasa.edu',
    phone: '0300-1234567',
    designation: 'Registrar',
    department: 'Administration',
    employeeId: 'S001',
    joinDate: '2021-02-10',
    address: '123 Main Street, City, Country',
    status: 'Active',
  });

  const [editData, setEditData] = useState({ ...profile });

  useEffect(() => {
    // In real app, fetch profile data from API
    setEditData({ ...profile });
  }, [profile]);

  const handleSave = () => {
    setProfile({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const InfoField = ({ label, value, icon, field, type = 'text' }) => (
    <div className="space-y-1">
      <div className="flex items-center text-sm text-slate-500">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
      {isEditing ? (
        <Input
          value={editData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          type={type}
          className="w-full"
        />
      ) : (
        <div className="text-slate-900 font-medium">{value}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Profile</h1>
          <p className="text-slate-600">Manage your personal information and account settings</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                icon={<FiX size={16} />}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                icon={<FiSave size={16} />}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              icon={<FiEdit size={16} />}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <Avatar
                size="xl"
                name={profile.name}
                className="border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <Badge color="green" variant="subtle">
                    {profile.status}
                  </Badge>
                </div>
                <p className="text-slate-600 mb-4">{profile.designation} • {profile.department}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <FiMail className="mr-2" size={14} />
                    {profile.email}
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="mr-2" size={14} />
                    {profile.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField
                label="Full Name"
                value={profile.name}
                icon={<FiUser size={14} />}
                field="name"
              />
              <InfoField
                label="Email Address"
                value={profile.email}
                icon={<FiMail size={14} />}
                field="email"
                type="email"
              />
              <InfoField
                label="Phone Number"
                value={profile.phone}
                icon={<FiPhone size={14} />}
                field="phone"
                type="tel"
              />
              <InfoField
                label="Designation"
                value={profile.designation}
                field="designation"
              />
              <InfoField
                label="Department"
                value={profile.department}
                field="department"
              />
              <InfoField
                label="Employee ID"
                value={profile.employeeId}
                field="employeeId"
              />
              <InfoField
                label="Join Date"
                value={profile.joinDate}
                icon={<FiCalendar size={14} />}
                field="joinDate"
                type="date"
              />
              <InfoField
                label="Address"
                value={profile.address}
                icon={<FiMapPin size={14} />}
                field="address"
              />
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bio/Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.bio || ''}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={4}
                    placeholder="Write a brief description about yourself..."
                  />
                ) : (
                  <p className="text-slate-700">
                    {profile.bio || 'No bio provided. Add a brief description about yourself.'}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Years of Service</span>
                <span className="font-bold text-slate-900">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Students Managed</span>
                <span className="font-bold text-slate-900">245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tasks Completed</span>
                <span className="font-bold text-slate-900">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Attendance Rate</span>
                <span className="font-bold text-green-600">98%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Update Profile Picture
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Activity Log
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Last Login</span>
                <span className="font-medium">Today, 10:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Account Created</span>
                <span className="font-medium">Feb 10, 2021</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email Verified</span>
                <Badge color="green" variant="subtle">Verified</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">2FA Enabled</span>
                <Badge color="red" variant="subtle">Disabled</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;