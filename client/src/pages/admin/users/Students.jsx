import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiFilter, FiDownload, FiPlus, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { Table, Button, Card, Input, Select, Badge, Modal, Loading } from '../../../components/UIHelper';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    // Mock data - replace with API call
    const mockStudents = [
      { id: 1, name: 'Ahmed Khan', rollNo: '2024001', class: '10th', section: 'A', status: 'Active', guardian: 'Mr. Khan', phone: '0300-1234567' },
      { id: 2, name: 'Fatima Ali', rollNo: '2024002', class: '9th', section: 'B', status: 'Active', guardian: 'Mr. Ali', phone: '0300-7654321' },
      { id: 3, name: 'Usman Ahmed', rollNo: '2024003', class: '11th', section: 'A', status: 'Inactive', guardian: 'Mr. Ahmed', phone: '0300-9876543' },
      { id: 4, name: 'Sara Khan', rollNo: '2024004', class: '10th', section: 'C', status: 'Active', guardian: 'Mrs. Khan', phone: '0300-4567890' },
      { id: 5, name: 'Bilal Raza', rollNo: '2024005', class: '8th', section: 'A', status: 'Active', guardian: 'Mr. Raza', phone: '0300-2345678' },
    ];
    setStudents(mockStudents);
    setLoading(false);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm) ||
                         student.guardian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

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

  const confirmDelete = () => {
    // API call to delete student
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  const columns = [
    { key: 'rollNo', label: 'Roll No', sortable: true },
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'class', label: 'Class', sortable: true },
    { key: 'section', label: 'Section' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <Badge 
          color={value === 'Active' ? 'green' : 'red'}
          variant="subtle"
        >
          {value}
        </Badge>
      )
    },
    { key: 'guardian', label: 'Guardian' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(row.id)}
            icon={<FiEye size={14} />}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.id)}
            icon={<FiEdit size={14} />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="red"
            onClick={() => handleDelete(row)}
            icon={<FiTrash2 size={14} />}
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
          <h1 className="text-2xl font-bold text-slate-900">Students Management</h1>
          <p className="text-slate-600">Manage all student records and information</p>
        </div>
        <Button
          onClick={() => navigate('/admin/users/register')}
          icon={<FiPlus size={18} />}
        >
          Add New Student
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by name, roll no, or guardian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '', label: 'All Classes' },
              { value: '8th', label: '8th Class' },
              { value: '9th', label: '9th Class' },
              { value: '10th', label: '10th Class' },
              { value: '11th', label: '11th Class' },
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={<FiFilter size={16} />}>
              More Filters
            </Button>
            <Button variant="outline" icon={<FiDownload size={16} />}>
              Export
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
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete student <strong>{selectedStudent?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
