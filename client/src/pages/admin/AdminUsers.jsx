import React, { useState, useEffect } from 'react';
import Card from '../../components/UIHelper/Card';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    name: '', fatherName: '', grandfatherName: '', email: '', password: '', role: 'student',
    phone: '', whatsapp: '', dob: '', bloodType: '', idNumber: '',
    permanentAddress: { province: '', district: '', village: '' },
    currentAddress: { province: '', district: '', village: '' },
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params = filterRole ? { role: filterRole } : {};
      const res = await axios.get('http://localhost:5000/api/users', { params });
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!editMode && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      console.log('Submitting form data:', formData);
      
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        const response = await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, updateData);
        console.log('Update response:', response.data);
        alert('User updated successfully');
      } else {
        const response = await axios.post('http://localhost:5000/api/users', formData);
        console.log('Create response:', response.data);
        alert('User created successfully');
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Full error:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server');
        alert('Error: Cannot connect to server. Make sure the server is running on http://localhost:5000');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({ ...user, password: '' });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', fatherName: '', grandfatherName: '', email: '', password: '', role: 'student',
      phone: '', whatsapp: '', dob: '', bloodType: '', idNumber: '',
      permanentAddress: { province: '', district: '', village: '' },
      currentAddress: { province: '', district: '', village: '' },
      status: 'active'
    });
    setShowModal(false);
    setEditMode(false);
    setCurrentUser(null);
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-blue-100 text-blue-800',
      staff: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      <Card>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setFilterRole('')} className={`px-4 py-2 rounded ${!filterRole ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
          <button onClick={() => setFilterRole('admin')} className={`px-4 py-2 rounded ${filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Admin</button>
          <button onClick={() => setFilterRole('teacher')} className={`px-4 py-2 rounded ${filterRole === 'teacher' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Teacher</button>
          <button onClick={() => setFilterRole('student')} className={`px-4 py-2 rounded ${filterRole === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Student</button>
          <button onClick={() => setFilterRole('staff')} className={`px-4 py-2 rounded ${filterRole === 'staff' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Staff</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-transparent bg-white/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editMode ? '✏️ Edit User' : '➕ Add New User'}</h2>
                <button onClick={resetForm} className="text-white hover:text-gray-200 text-2xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">👤 Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather Name</label>
                    <input
                      type="text"
                      value={formData.grandfatherName}
                      onChange={(e) => setFormData({ ...formData, grandfatherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Grandfather's name"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🔐 Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {editMode && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      required={!editMode}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">👨‍🎓 Student</option>
                      <option value="teacher">👨‍🏫 Teacher</option>
                      <option value="staff">⚙️ Staff</option>
                      <option value="admin">🔑 Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">✅ Active</option>
                      <option value="inactive">❌ Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📋 Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="National ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📞 Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🏠 Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                    <input
                      type="text"
                      value={formData.permanentAddress.province}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, province: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input
                      type="text"
                      value={formData.permanentAddress.district}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, district: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                    <input
                      type="text"
                      value={formData.permanentAddress.village}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, village: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Village"
                    />
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📍 Current Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                    <input
                      type="text"
                      value={formData.currentAddress.province}
                      onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, province: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input
                      type="text"
                      value={formData.currentAddress.district}
                      onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, district: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                    <input
                      type="text"
                      value={formData.currentAddress.village}
                      onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, village: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Village"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all"
                >
                  {editMode ? '💾 Update User' : '➕ Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
