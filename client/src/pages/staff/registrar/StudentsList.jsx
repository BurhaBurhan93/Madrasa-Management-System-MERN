import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const studentsConfig = {
  title: 'All Students',
  subtitle: 'Manage enrolled students and their information',
  endpoint: '/student/all',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'currentLevel', header: 'Level' },
    { key: 'status', header: 'Status' },
    { key: 'admissionDate', header: 'Admission Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}` },
    { name: 'studentCode', label: 'Student Code', required: true },
    { name: 'currentClass', label: 'Current Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name },
    { name: 'currentLevel', label: 'Current Level' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    user: '',
    studentCode: '',
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'active'
  })
};

const StudentsList = () => {
  const [studentStats, setStudentStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    hostelResidents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/all`, config);
      const students = response.data || [];
      
      setStudentStats({
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        inactive: students.filter(s => s.status === 'inactive').length,
        hostelResidents: students.filter(s => s.isHostelResident).length
      });
    } catch (error) {
      console.error('[StudentsList] Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{studentStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">All students</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{studentStats.active}</p>
            <p className="text-sm text-slate-500 mt-1">Currently active</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-xl">⏸️</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Inactive</span>
            </div>
            <p className="text-3xl font-black text-gray-600">{studentStats.inactive}</p>
            <p className="text-sm text-slate-500 mt-1">Not active</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Hostel Residents</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{studentStats.hostelResidents}</p>
            <p className="text-sm text-slate-500 mt-1">Living in hostel</p>
          </div>
        </Card>
      </div>

      {/* Status Distribution Chart */}
      <Card title="Student Status Distribution" className="max-w-2xl">
        <PieChartComponent
          data={[
            { name: 'Active', value: studentStats.active },
            { name: 'Inactive', value: studentStats.inactive }
          ].filter(item => item.value > 0)}
          height={250}
        />
      </Card>

      {/* Students List */}
      <ListPage {...studentsConfig} />
    </div>
  );
};

export default StudentsList;
