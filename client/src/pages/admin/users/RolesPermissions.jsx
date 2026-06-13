import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiUsers, FiCheck, FiX, FiUserPlus } from 'react-icons/fi';
import { Table, Button, Card, Input, Badge, Modal, Loading, CreateUserModal } from '../../../components/UIHelper';

const RolesPermissions = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });

  const permissionsList = [
    { id: 'user_read', label: 'View Users', category: 'Users' },
    { id: 'user_write', label: 'Create/Edit Users', category: 'Users' },
    { id: 'user_delete', label: 'Delete Users', category: 'Users' },
    { id: 'student_read', label: 'View Students', category: 'Students' },
    { id: 'student_write', label: 'Create/Edit Students', category: 'Students' },
    { id: 'student_delete', label: 'Delete Students', category: 'Students' },
    { id: 'teacher_read', label: 'View Teachers', category: 'Teachers' },
    { id: 'teacher_write', label: 'Create/Edit Teachers', category: 'Teachers' },
    { id: 'finance_read', label: 'View Finance', category: 'Finance' },
    { id: 'finance_write', label: 'Create/Edit Finance', category: 'Finance' },
    { id: 'attendance_read', label: 'View Attendance', category: 'Attendance' },
    { id: 'attendance_write', label: 'Create/Edit Attendance', category: 'Attendance' },
    { id: 'library_read', label: 'View Library', category: 'Library' },
    { id: 'library_write', label: 'Create/Edit Library', category: 'Library' },
    { id: 'reports_read', label: 'View Reports', category: 'Reports' },
    { id: 'settings_write', label: 'Edit Settings', category: 'Settings' },
  ];

  useEffect(() => {
    const mockRoles = [
      { 
        id: 1, 
        name: 'Administrator', 
        description: 'Full system access', 
        userCount: 3,
        permissions: permissionsList.map(p => p.id),
        createdAt: '2023-01-01'
      },
      { 
        id: 2, 
        name: 'Registrar', 
        description: 'Student management and admissions', 
        userCount: 2,
        permissions: ['student_read', 'student_write', 'user_read'],
        createdAt: '2023-02-15'
      },
      { 
        id: 3, 
        name: 'Teacher', 
        description: 'Academic and student management', 
        userCount: 15,
        permissions: ['student_read', 'attendance_read', 'attendance_write'],
        createdAt: '2023-03-10'
      },
      { 
        id: 4, 
        name: 'Accountant', 
        description: 'Financial management', 
        userCount: 2,
        permissions: ['finance_read', 'finance_write'],
        createdAt: '2023-04-05'
      },
      { 
        id: 5, 
        name: 'Librarian', 
        description: 'Library management', 
        userCount: 1,
        permissions: ['library_read', 'library_write'],
        createdAt: '2023-05-20'
      },
    ];
    setRoles(mockRoles);
    setLoading(false);
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = () => {
    const newRoleObj = {
      id: roles.length + 1,
      ...newRole,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRoles([...roles, newRoleObj]);
    setShowRoleModal(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const togglePermission = (permissionId) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Role Name', 
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
      label: 'Users', 
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUsers className="text-slate-400" size={16} />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'permissions', 
      label: 'Permissions', 
      render: (value) => (
        <Badge color="blue" variant="subtle">
          {value.length} permissions
        </Badge>
      )
    },
    { key: 'createdAt', label: 'Created', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/users/roles/edit/${row.id}`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => setRoles(roles.filter(r => r.id !== row.id))}
          >
            Delete
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
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-600">Manage user roles and their system permissions</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCreateUser(true)}
            icon={<FiUserPlus size={18} />}
          >
            Create User
          </Button>
          <Button
            onClick={() => setShowRoleModal(true)}
            icon={<FiShield size={18} />}
          >
            Create New Role
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <Input
            placeholder="Search roles..."
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
        onClose={() => setShowRoleModal(false)}
        title="Create New Role"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role Name
              </label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="e.g., Registrar, Accountant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Input
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Brief description of role responsibilities"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
              {permissionsList.map(permission => {
                const isSelected = newRole.permissions.includes(permission.id);
                return (
                  <div
                    key={permission.id}
                    onClick={() => togglePermission(permission.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-cyan-300 bg-cyan-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{permission.label}</div>
                      <div className="text-xs text-slate-500">{permission.category}</div>
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
              Selected: {newRole.permissions.length} permissions
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={!newRole.name.trim()}
            >
              Create Role
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
