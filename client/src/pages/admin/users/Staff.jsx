import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import BasicPageTemplate from '../../../templates/BasicPageTemplate';
import api from '../../../lib/api';

const NON_TEACHER_TYPES = ['admin', 'finance', 'registrar', 'hr', 'librarian', 'kitchen', 'security', 'support', 'maintenance', 'payroll', 'complaints', 'inventory', 'general-manager'];

const Staff = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusLabel = (status) => {
    if (status === 'active') return t('users.active');
    if (status === 'on-leave') return t('users.onLeave');
    return t('users.inactive');
  };

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/employees');
      const data = res.data?.data || [];
      const nonTeachers = data.filter(e => NON_TEACHER_TYPES.includes(e.employeeType) || !e.employeeType || e.employeeType === 'support');
      const mapped = nonTeachers.map(s => ({
        id: s._id,
        _id: s._id,
        employeeId: s.employeeCode || t('common.na'),
        name: s.fullName || t('users.unknown'),
        designation: s.designation?.designationTitle || s.employeeType || t('common.na'),
        department: s.department?.departmentName || t('common.na'),
        phone: s.phoneNumber || t('common.na'),
        email: s.email || t('common.na'),
        status: s.status || 'inactive',
        joinDate: s.joiningDate ? new Date(s.joiningDate).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-CA') : t('common.na'),
      }));
      setStaff(mapped);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const columns = [
    { key: 'employeeId', label: t('users.employeeId'), sortable: true },
    { key: 'name', label: t('users.staffName'), sortable: true },
    { key: 'designation', label: t('users.designation'), sortable: true },
    { key: 'department', label: t('users.department'), sortable: true },
    { key: 'phone', label: t('users.phone') },
    { key: 'email', label: t('users.email') },
    {
      key: 'status',
      label: t('users.status'),
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {statusLabel(value)}
        </span>
      )
    },
    { key: 'joinDate', label: t('users.joinDate'), sortable: true },
  ];

  const filters = [
    {
      key: 'department',
      label: t('users.department'),
      options: [...new Set(staff.map(s => s.department).filter(Boolean))].map(d => ({ value: d, label: d })),
    },
    {
      key: 'designation',
      label: t('users.designation'),
      options: [...new Set(staff.map(s => s.designation).filter(Boolean))].map(d => ({ value: d, label: d })),
    },
  ];

  const handleView = (staffMember) => {
    navigate(`/admin/users/staff/view/${staffMember.id}`);
  };

  const handleEdit = (staffMember) => {
    navigate(`/admin/users/staff/edit/${staffMember.id}`);
  };

  const handleDelete = async (staffMember) => {
    try {
      await api.delete(`/hr/employees/${staffMember._id}`);
      setStaff(staff.filter(s => s.id !== staffMember.id));
    } catch (err) {
      console.error('Failed to delete staff:', err);
    }
  };

  const handleCreate = () => {
    navigate('/admin/users/register');
  };

  return (
    <BasicPageTemplate
      title={t('users.staffManagement')}
      description={t('users.manageStaff')}
      columns={columns}
      data={staff}
      loading={loading}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      searchFields={['name', 'employeeId', 'designation', 'department', 'email']}
      filters={filters}
      exportData={staff}
      pageSize={10}
      onRowClick={handleView}
      emptyMessage={t('users.noStaffFound')}
    />
  );
};

export default Staff;
