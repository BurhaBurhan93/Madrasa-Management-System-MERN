import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicPageTemplate from '../../templates/BasicPageTemplate';
import { Badge } from '../../components/UIHelper';

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTeachers = [
      { id: 1, name: 'Dr. Ali Ahmed', employeeId: 'T001', department: 'Science', subjects: 'Physics, Chemistry', qualification: 'PhD', status: 'Active', joinDate: '2022-01-15' },
      { id: 2, name: 'Ms. Fatima Khan', employeeId: 'T002', department: 'Mathematics', subjects: 'Math, Calculus', qualification: 'MSc', status: 'Active', joinDate: '2021-03-20' },
      { id: 3, name: 'Mr. Usman Raza', employeeId: 'T003', department: 'Languages', subjects: 'English, Urdu', qualification: 'MA', status: 'Active', joinDate: '2023-06-10' },
      { id: 4, name: 'Mrs. Sara Ali', employeeId: 'T004', department: 'Computer Science', subjects: 'Programming, IT', qualification: 'MCS', status: 'On Leave', joinDate: '2020-11-05' },
      { id: 5, name: 'Mr. Bilal Hassan', employeeId: 'T005', department: 'Islamic Studies', subjects: 'Quran, Hadith', qualification: 'MA Islamic Studies', status: 'Active', joinDate: '2022-08-30' },
    ];
    setTeachers(mockTeachers);
    setLoading(false);
  }, []);

  const columns = [
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'name', label: 'Teacher Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'subjects', label: 'Subjects' },
    { key: 'qualification', label: 'Qualification' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <Badge 
          color={value === 'Active' ? 'green' : value === 'On Leave' ? 'yellow' : 'red'}
          variant="subtle"
        >
          {value}
        </Badge>
      )
    },
    { key: 'joinDate', label: 'Join Date', sortable: true },
  ];

  const filters = [
    {
      key: 'department',
      label: 'Department',
      options: [
        { value: 'Science', label: 'Science' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Languages', label: 'Languages' },
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Islamic Studies', label: 'Islamic Studies' },
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'On Leave', label: 'On Leave' },
        { value: 'Inactive', label: 'Inactive' },
      ]
    }
  ];

  const handleView = (teacher) => {
    navigate(`/admin/users/teachers/view/${teacher.id}`);
  };

  const handleEdit = (teacher) => {
    navigate(`/admin/users/teachers/edit/${teacher.id}`);
  };

  const handleDelete = (teacher) => {
    setTeachers(teachers.filter(t => t.id !== teacher.id));
  };

  const handleCreate = () => {
    navigate('/admin/users/register');
  };

  return (
    <BasicPageTemplate
      title="Teachers Management"
      description="Manage all teacher records, assignments, and information"
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
      emptyMessage="No teachers found"
    />
  );
};

export default Teachers;