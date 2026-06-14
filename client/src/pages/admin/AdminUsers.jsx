import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UIHelper/Card';
import api from '../../lib/api';
import CalendarDatePicker from "../../components/UIHelper/CalendarDatePicker";

const AdminUsers = () => {
  const { t } = useTranslation();
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
      const res = await api.get('/users', { params });
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
      alert(t('admin.users.fillRequired'));
      return;
    }
    
    if (!editMode && !formData.password) {
      alert(t('admin.users.passwordRequired'));
      return;
    }

    try {
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        if (!updateData.bloodType) delete updateData.bloodType;
        if (!updateData.dob) delete updateData.dob;
        if (!updateData.idNumber) delete updateData.idNumber;
        await api.put(`/users/${currentUser._id}`, updateData);
        alert(t('admin.users.userUpdated'));
      } else {
        const payload = { ...formData };
        if (!payload.bloodType) delete payload.bloodType;
        if (!payload.dob) delete payload.dob;
        if (!payload.idNumber) delete payload.idNumber;
        await api.post('/users', payload);
        alert(t('admin.users.userCreated'));
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
    if (!window.confirm(t('admin.users.confirmDelete'))) return;
    try {
      await api.delete(`/users/${id}`);
      alert(t('admin.users.userDeleted'));
      fetchUsers();
    } catch (error) {
      alert(t('admin.users.userDeletedError'));
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

  if (loading) return <div className="p-6">{t('admin.common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.userManagement')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {t('admin.users.addUser')}
        </button>
      </div>

      <Card>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setFilterRole('')} className={`px-4 py-2 rounded ${!filterRole ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t('admin.users.all')}</button>
          <button onClick={() => setFilterRole('admin')} className={`px-4 py-2 rounded ${filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>{t('admin.users.admin')}</button>
          <button onClick={() => setFilterRole('teacher')} className={`px-4 py-2 rounded ${filterRole === 'teacher' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{t('admin.users.teacher')}</button>
          <button onClick={() => setFilterRole('student')} className={`px-4 py-2 rounded ${filterRole === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t('admin.users.student')}</button>
          <button onClick={() => setFilterRole('staff')} className={`px-4 py-2 rounded ${filterRole === 'staff' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{t('admin.users.staff')}</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.users.actions')}</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || t('admin.common.na')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 mr-3">{t('admin.users.edit')}</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">{t('admin.users.delete')}</button>
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
                <h2 className="text-2xl font-bold">{editMode ? t('admin.users.editUser') : t('admin.users.addNewUser')}</h2>
                <button onClick={resetForm} className="text-white hover:text-gray-200 text-2xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('admin.users.basicInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.name')} {t('admin.common.required')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('admin.users.enterFullName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.fatherName')}</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('admin.users.fathersName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.grandfatherName')}</label>
                    <input
                      type="text"
                      value={formData.grandfatherName}
                      onChange={(e) => setFormData({ ...formData, grandfatherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('admin.users.grandfathersName')}
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('admin.users.accountInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.email')} {t('admin.common.required')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('admin.users.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.users.password')} {editMode && <span className="text-gray-500 text-xs">({t('admin.users.leaveBlank')})</span>}
                    </label>
                    <input
                      type="password"
                      required={!editMode}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('admin.users.enterPassword')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.users.role')} {t('admin.common.required')}</label>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('admin.users.personalInformation')}</h3>
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
                    <CalendarDatePicker value={formData.dob} onChange={(date) => setFormData({ ...formData, dob: date })} placeholder="Select date" />
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
