import React, { useState, useEffect } from 'react';
import Card from '../../components/UIHelper/Card';
import Avatar from '../../components/UIHelper/Avatar';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import CalendarDatePicker from "../../components/UIHelper/CalendarDatePicker";

const AdminProfile = () => {
  const [user, setUser] = useState({
    name: 'Administrator',
    email: 'admin@madrasa.edu',
    phone: '+92 300 1234567',
    role: 'Super Admin',
    adminId: 'ADM2024001',
    address: 'Main Campus, Islamabad',
    dob: '1985-05-15',
    joinDate: '2020-01-01',
    permissions: ['all'],
    status: 'active'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  useEffect(() => {
    // Fetch admin profile data from API
    const fetchProfile = async () => {
      try {
        // const res = await axios.get('/api/admin/profile');
        // setUser(res.data);
        // setFormData(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // await axios.put('/api/admin/profile', formData);
      setUser(formData);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const InfoRow = ({ icon, label, value, name, type = 'text' }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        {isEditing && name ? (
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <p className="mt-1 font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👤 Admin Profile</h1>
          <p className="text-gray-600 mt-1">Manage your administrator account</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg"
              >
                <FiSave size={18} /> Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 font-semibold"
              >
                <FiX size={18} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
            >
              <FiEdit2 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              <Avatar size="xxl" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {user.status}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    ID: {user.adminId}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <InfoRow 
                icon={<FiUser size={20} />} 
                label="Full Name" 
                value={user.name} 
                name="name"
              />
              <InfoRow 
                icon={<FiMail size={20} />} 
                label="Email Address" 
                value={user.email} 
                name="email"
                type="email"
              />
              <InfoRow 
                icon={<FiPhone size={20} />} 
                label="Phone Number" 
                value={user.phone} 
                name="phone"
                type="tel"
              />
              <InfoRow 
                icon={<FiMapPin size={20} />} 
                label="Address" 
                value={user.address} 
                name="address"
              />
              <InfoRow 
                icon={<FiCalendar size={20} />} 
                label="Date of Birth" 
                value={new Date(user.dob).toLocaleDateString()} 
                name="dob"
                type="date"
              />
              <InfoRow 
                icon={<FiCalendar size={20} />} 
                label="Join Date" 
                value={new Date(user.joinDate).toLocaleDateString()} 
              />
            </div>
          </Card>

          {/* Security Settings */}
          <Card title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Enable
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Change Password
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Permissions & Activity */}
        <div className="space-y-6">
          <Card title="Permissions">
            <div className="space-y-3">
              {user.permissions.map((perm, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiShield className="text-green-600" size={18} />
                  <span className="font-medium text-gray-900 capitalize">{perm.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              As a Super Admin, you have full access to all system modules and settings.
            </p>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-4">
              {[
                { action: 'Updated user permissions', time: '2 hours ago' },
                { action: 'Approved new student admission', time: '1 day ago' },
                { action: 'Generated financial report', time: '2 days ago' },
                { action: 'Updated system settings', time: '3 days ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Services</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Backup Status</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Last: 24h ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;