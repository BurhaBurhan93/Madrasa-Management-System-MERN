import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/UIHelper/Card';
import { CreateUserModal } from '../../../components/UIHelper';
import api from '../../../lib/api';

const UserIndex = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('admin');

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

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

  const handleDelete = async (id) => {
    if (!window.confirm(t('users.deleteConfirm'))) return;
    try {
      await api.delete(`/users/${id}`);
      alert(t('users.userDeleted'));
      fetchUsers();
    } catch (error) {
      alert(t('users.errorDeletingUser'));
    }
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

  if (loading) return <div className="p-6">{t('common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('users.userManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('users.manageAllUsers')}</p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          {t('users.createUser')}
        </button>
      </div>

      <Card>
        <div className="mb-4 flex gap-2 flex-wrap">
          <button onClick={() => setFilterRole('')} className={`px-4 py-2 rounded-lg font-medium ${!filterRole ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t('users.all')}</button>
          <button onClick={() => setFilterRole('admin')} className={`px-4 py-2 rounded-lg font-medium ${filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>{t('users.admin')}</button>
          <button onClick={() => setFilterRole('teacher')} className={`px-4 py-2 rounded-lg font-medium ${filterRole === 'teacher' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{t('users.teacher')}</button>
          <button onClick={() => setFilterRole('student')} className={`px-4 py-2 rounded-lg font-medium ${filterRole === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t('users.student')}</button>
          <button onClick={() => setFilterRole('staff')} className={`px-4 py-2 rounded-lg font-medium ${filterRole === 'staff' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{t('users.staff')}</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                      {t('users.' + user.role) || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || t('common.na')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t('common.' + user.status) || user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => navigate(`/admin/users/edit/${user._id}`)} className="text-blue-600 hover:text-blue-900 mr-3">{t('users.edit')}</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">{t('users.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
};

export default UserIndex;
