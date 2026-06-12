import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicPageTemplate from '../../../templates/BasicPageTemplate';
import { Badge } from '../../../components/UIHelper';

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockStaff = [
      { id: 1, name: 'Mr. Ahmed Khan', employeeId: 'S001', designation: 'Registrar', department: 'Administration', phone: '0300-1234567', email: 'ahmed@madrasa.edu', status: 'Active', joinDate: '2021-02-10' },
      { id: 2, name: 'Ms. Fatima Ali', employeeId: 'S002', designation: 'Accountant', department: 'Finance', phone: '0300-7654321', email: 'fatima@madrasa.edu', status: 'Active', joinDate: '2022-05-15' },
      { id: 3, name: 'Mr. Usman Raza', employeeId: 'S003', designation: 'Librarian', department: 'Library', phone: '0300-9876543', email: 'usman@madrasa.edu', status: 'Active', joinDate: '2020-11-20' },
      { id: 4, name: 'Mrs. Sara Khan', employeeId: 'S004', designation: 'Hostel Warden', department: 'Hostel', phone: '0300-4567890', email: 'sara@madrasa.edu', status: 'Active', joinDate: '2023-01-05' },
      { id: 5, name: 'Mr. Bilal Ahmed', employeeId: 'S005', designation: 'IT Support', department: 'IT', phone: '0300-2345678', email: 'bilal@madrasa.edu', status: 'On Leave', joinDate: '2022-08-30' },
    ];
    setStaff(mockStaff);
    setLoading(false);
  }, []);

  const columns = [
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'name', label: 'Staff Name', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
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
        { value: 'Administration', label: 'Administration' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Library', label: 'Library' },
        { value: 'Hostel', label: 'Hostel' },
        { value: 'IT', label: 'IT' },
      ]
    },
    {
      key: 'designation',
      label: 'Designation',
      options: [
        { value: 'Registrar', label: 'Registrar' },
        { value: 'Accountant', label: 'Accountant' },
        { value: 'Librarian', label: 'Librarian' },
        { value: 'Hostel Warden', label: 'Hostel Warden' },
        { value: 'IT Support', label: 'IT Support' },
      ]
    }
  ];

  const handleView = (staffMember) => {
    navigate(`/admin/users/staff/view/${staffMember.id}`);
  };

  const handleEdit = (staffMember) => {
    navigate(`/admin/users/staff/edit/${staffMember.id}`);
  };

  const handleDelete = (staffMember) => {
    setStaff(staff.filter(s => s.id !== staffMember.id));
  };

  const handleCreate = () => {
    navigate('/admin/users/register');
  };

  return (
    <BasicPageTemplate
      title="Staff Management"
      description="Manage all non-teaching staff records and information"
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
      emptyMessage="No staff members found"
    />
  );
};

export default Staff;
