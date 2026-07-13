import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiFilter, FiDownload, FiPlus, FiEdit, FiEye, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Table, Button, Card, Input, Select, Badge, Modal, Loading } from '../../../components/UIHelper';
import api from '../../../lib/api';

const Students = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/all');
      const data = res.data?.data || [];
      const mapped = data.map(s => ({
        id: s._id,
        _id: s._id,
        rollNo: s.studentCode || t('common.na'),
        name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || t('users.unknown'),
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        class: s.currentClass?.name || t('common.na'),
        section: 'A',
        status: s.status || 'inactive',
        guardian: s.guardianName || t('common.na'),
        phone: s.phone || s.guardianPhone || t('common.na'),
        email: s.email || '',
        fatherName: s.fatherName || '',
        guardianPhone: s.guardianPhone || '',
      }));
      setStudents(mapped);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm) ||
                         student.guardian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const classOptions = [t('users.class8th'), t('users.class9th'), t('users.class10th'), t('users.class11th'), t('users.class12th')];
  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))];

  const handleView = (id) => {
    navigate(`/admin/users/students/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/users/students/edit/${id}`);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      await api.delete(`/student/${selectedStudent._id}`);
      setStudents(students.filter(s => s.id !== selectedStudent.id));
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const keys = ['rollNo', 'name', 'class', 'section', 'status', 'guardian', 'phone'];
    const headers = [t('users.rollNo'), t('common.name'), t('common.class'), t('common.section'), t('common.status'), t('users.guardian'), t('common.phone')];
    const csvContent = [
      headers.join(','),
      ...students.map(row => keys.map(k => JSON.stringify(String(row[k] ?? '')).replace(/^"|"$/g, '')).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students_export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const columns = [
    { key: 'rollNo', label: t('users.rollNo'), sortable: true },
    { key: 'name', label: t('users.studentName'), sortable: true },
    { key: 'class', label: t('users.class'), sortable: true },
    { key: 'section', label: t('users.section') },
    {
      key: 'status',
      label: t('users.status'),
      render: (value) => (
        <Badge
          color={value === 'active' ? 'green' : 'red'}
          variant="subtle"
        >
          {value === 'active' ? t('users.active') : t('users.inactive')}
        </Badge>
      )
    },
    { key: 'guardian', label: t('users.guardian') },
    { key: 'phone', label: t('users.phone') },
    {
      key: 'actions',
      label: t('users.actions'),
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(row.id)}
            icon={<FiEye size={14} />}
          >
            {t('users.view')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.id)}
            icon={<FiEdit size={14} />}
          >
            {t('users.edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDelete(row)}
            icon={<FiTrash2 size={14} />}
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
          <h1 className="text-2xl font-bold text-slate-900">{t('users.studentsManagement')}</h1>
          <p className="text-slate-600">{t('users.manageStudents')}</p>
        </div>
        <Button
          onClick={() => navigate('/admin/users/register')}
          icon={<FiPlus size={18} />}
        >
          {t('users.addNewStudent')}
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder={t('users.searchStudent')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '', label: t('users.allClasses') },
              ...(uniqueClasses.length > 0
                ? uniqueClasses.map(c => ({ value: c, label: c }))
                : classOptions.map(c => ({ value: c, label: c }))
              ),
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: t('users.allStatus') },
              { value: 'active', label: t('users.active') },
              { value: 'inactive', label: t('users.inactive') },
            ]}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            {t('users.showingStudents', { count: filteredStudents.length, total: students.length })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} icon={showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}>
              {showFilters ? t('users.hideFilters') : t('users.moreFilters')}
            </Button>
            <Button variant="outline" onClick={exportCSV} icon={<FiDownload size={16} />}>
              {t('common.export')}
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredStudents}
          pagination
          pageSize={10}
          onRowClick={(row) => handleView(row.id)}
        />
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('users.confirmDelete')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            {t('users.deleteStudentConfirm', { name: selectedStudent?.name })}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t('users.cancel')}
            </Button>
            <Button color="red" onClick={confirmDelete}>
              {t('users.deleteStudent')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
