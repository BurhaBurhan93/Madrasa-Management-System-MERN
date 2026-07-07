import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useNavigate } from 'react-router-dom';
import BasicPageTemplate from '../../../templates/BasicPageTemplate';
import api from '../../../lib/api';

const Teachers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/employees', { params: { employeeType: 'teacher' } });
      const data = res.data?.data || [];
      const mapped = data.map(t => ({
        id: t._id,
        _id: t._id,
        employeeId: t.employeeCode || t('common.na'),
        name: t.fullName || t('users.unknown'),
        department: t.department?.departmentName || t('common.na'),
        subjects: t('common.na'),
        qualification: t.highestQualification || t('common.na'),
        status: t.status || 'inactive',
        joinDate: t.joiningDate ? new Date(t.joiningDate).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-CA') : t('common.na'),
        phoneNumber: t.phoneNumber || '',
        email: t.email || '',
        designation: t.designation?.designationTitle || '',
      }));
      setTeachers(mapped);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const columns = [
    { key: 'employeeId', label: t('users.employeeId'), sortable: true },
    { key: 'name', label: t('users.teacherName'), sortable: true },
    { key: 'department', label: t('users.department'), sortable: true },
    { key: 'subjects', label: t('users.subjects') },
    { key: 'qualification', label: t('users.qualification') },
    {
      key: 'status',
      label: t('users.status'),
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? t('users.active') : value === 'on-leave' ? t('users.onLeave') : t('users.inactive')}
        </span>
      )
    },
    { key: 'joinDate', label: t('users.joinDate'), sortable: true },
  ];

  const filters = [
    {
      key: 'department',
      label: t('users.department'),
      options: [...new Set(teachers.map(t => t.department).filter(Boolean))].map(d => ({ value: d, label: d })),
    },
    {
      key: 'status',
      label: t('users.status'),
      options: [
        { value: 'active', label: t('users.active') },
        { value: 'on-leave', label: t('users.onLeave') },
        { value: 'inactive', label: t('users.inactive') },
      ],
    },
  ];

  const handleView = (teacher) => {
    navigate(`/admin/users/teachers/view/${teacher.id}`);
  };

  const handleEdit = (teacher) => {
    navigate(`/admin/users/teachers/edit/${teacher.id}`);
  };

  const handleDelete = async (teacher) => {
    try {
      await api.delete(`/hr/employees/${teacher._id}`);
      setTeachers(teachers.filter(t => t.id !== teacher.id));
    } catch (err) {
      console.error('Failed to delete teacher:', err);
    }
  };

  const handleCreate = () => {
    navigate('/admin/users/register');
  };

  return (
    <BasicPageTemplate
      title={t('users.teachersManagement')}
      description={t('users.manageTeachers')}
      columns={columns}
      data={teachers}
      loading={loading}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      searchFields={['name', 'employeeId', 'subjects', 'qualification']}
      filters={filters}
      exportData={teachers}
      pageSize={10}
      onRowClick={handleView}
      emptyMessage={t('users.noTeachersFound')}
    />
  );
};

export default Teachers;
