import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/UIHelper/Card';
import axios from 'axios';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', grandfatherName: '', email: '', password: '', role: 'student',
    phone: '', whatsapp: '', dob: '', bloodType: '', idNumber: '',
    permanentAddress: { province: '', district: '', village: '' },
    currentAddress: { province: '', district: '', village: '' },
    status: 'active'
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${id}`);
      const user = res.data.data;
      setFormData({
        ...user,
        password: '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        permanentAddress: user.permanentAddress || { province: '', district: '', village: '' },
        currentAddress: user.currentAddress || { province: '', district: '', village: '' }
      });
    } catch (error) {
      alert('Error fetching user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await axios.put(`http://localhost:5000/api/users/${id}`, updateData);
      alert('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/admin/users')} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">👤 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather Name</label>
                <input type="text" value={formData.grandfatherName || ''} onChange={(e) => setFormData({ ...formData, grandfatherName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🔐 Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-xs text-gray-500">(leave blank to keep current)</span></label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📋 Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input type="text" value={formData.idNumber || ''} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select value={formData.bloodType || ''} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select</option>
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
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📞 Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input type="tel" value={formData.whatsapp || ''} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🏠 Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <input type="text" value={formData.permanentAddress.province} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, province: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input type="text" value={formData.permanentAddress.district} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, district: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                <input type="text" value={formData.permanentAddress.village} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, village: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📍 Current Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <input type="text" value={formData.currentAddress.province} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, province: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input type="text" value={formData.currentAddress.district} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, district: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                <input type="text" value={formData.currentAddress.village} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, village: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold">
              💾 Update User
            </button>
            <button type="button" onClick={() => navigate('/admin/users')} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold">
              ❌ Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserEdit;
