import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiShield, FiUsers, FiCheck, FiX, FiUserPlus } from 'react-icons/fi';
import { Table, Button, Card, Input, Badge, Modal, Loading, CreateUserModal } from '../../../components/UIHelper';
import api from '../../../lib/api';

const RolesPermissions = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/permissions'),
      ]);
      const rolesData = rolesRes.data?.data || [];
      const permsData = permsRes.data?.data || [];
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err) {
      console.error('Failed to fetch roles/permissions:', err);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingRole(null);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowRoleModal(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      permissions: (role.permissions || []).map(p => p._id || p),
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        const res = await api.put(`/admin/roles/${editingRole._id}`, newRole);
        if (res.data?.success) {
          await fetchData();
        }
      } else {
        const res = await api.post('/admin/roles', newRole);
        if (res.data?.success) {
          await fetchData();
        }
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (err) {
      console.error('Failed to save role:', err);
    }
  };

  const handleDeleteRole = async (role) => {
    try {
      await api.delete(`/admin/roles/${role._id}`);
      setRoles(roles.filter(r => r._id !== role._id));
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const togglePermission = (permId) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = (perm.description || 'General').split(' ')[0] || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const columns = [
    {
      key: 'name',
      label: t('users.roleName'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
            <FiShield size={18} />
          </div>
          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'userCount',
      label: t('users.users'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUsers className="text-slate-400" size={16} />
          <span className="font-medium">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'permissions',
      label: t('users.permissions'),
      render: (value) => (
        <Badge color="blue" variant="subtle">
          {(value || []).length} {t('users.permissions')}
        </Badge>
      )
    },
    { key: 'createdAt', label: t('users.created'), sortable: true },
    {
      key: 'actions',
      label: t('users.actions'),
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(row)}
          >
            {t('users.edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDeleteRole(row)}
          >
            {t('users.delete')}
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('users.rolesPermissions')}</h1>
          <p className="text-slate-600">{t('users.manageRoles')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCreateUser(true)}
            icon={<FiUserPlus size={18} />}
          >
            {t('users.createUser')}
          </Button>
          <Button
            onClick={handleOpenCreate}
            icon={<FiShield size={18} />}
          >
            {editingRole ? t('users.editRole') : t('users.createNewRole')}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <Input
            placeholder={t('users.searchRoles')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiShield />}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          data={filteredRoles}
          pagination
          pageSize={10}
        />
      </Card>

      <Modal
        isOpen={showRoleModal}
        onClose={() => { setShowRoleModal(false); setEditingRole(null); }}
        title={editingRole ? t('users.editRole') : t('users.createNewRole')}
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.roleName')}
              </label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder={t('users.roleNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.description')}
              </label>
              <Input
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder={t('users.roleDescriptionPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              {t('users.permissions')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
              {permissions.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">{t('users.noPermissions')}</p>
              )}
              {permissions.map(perm => {
                const isSelected = newRole.permissions.includes(perm._id);
                return (
                  <div
                    key={perm._id}
                    onClick={() => togglePermission(perm._id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-cyan-300 bg-cyan-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{perm.name}</div>
                      <div className="text-xs text-slate-500">{perm.description || t('users.permission')}</div>
                    </div>
                    {isSelected ? (
                      <FiCheck className="text-cyan-600" size={18} />
                    ) : (
                      <FiX className="text-slate-400" size={18} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-sm text-slate-500">
              {t('users.selectedPermissions', { count: newRole.permissions.length })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => { setShowRoleModal(false); setEditingRole(null); }}>
              {t('users.cancel')}
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!newRole.name.trim()}
            >
              {editingRole ? t('users.updateRole') : t('users.createRole')}
            </Button>
          </div>
        </div>
      </Modal>

      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
      />
    </div>
  );
};

export default RolesPermissions;
