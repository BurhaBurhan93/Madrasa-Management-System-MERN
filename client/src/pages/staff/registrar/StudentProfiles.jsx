import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const studentProfilesConfig = {
  title: 'Student Profile Management',
  subtitle: 'Manage complete student profiles, personal information, and academic records',
  endpoint: '/student/all',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'currentLevel', header: 'Level' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value || 'N/A'}
      </span>
    )},
    { key: 'admissionDate', header: 'Admission Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    // Basic Information
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}`, required: true, group: 'Basic Information' },
    { name: 'studentCode', label: 'Student Code', required: true, group: 'Basic Information' },
    { name: 'firstName', label: 'First Name', required: true, group: 'Basic Information' },
    { name: 'lastName', label: 'Last Name', group: 'Basic Information' },
    { name: 'fatherName', label: 'Father Name', required: true, group: 'Basic Information' },
    { name: 'grandfatherName', label: 'Grandfather Name', group: 'Basic Information' },
    { name: 'dob', label: 'Date of Birth', type: 'date', group: 'Basic Information' },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: [
      { value: '', label: 'Select' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' }
    ], group: 'Basic Information' },
    
    // Contact Information
    { name: 'phone', label: 'Phone Number', required: true, group: 'Contact Information' },
    { name: 'whatsapp', label: 'WhatsApp Number', group: 'Contact Information' },
    { name: 'email', label: 'Email Address', type: 'email', group: 'Contact Information' },
    
    // Address Information
    { name: 'permanentAddress_province', label: 'Province (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_district', label: 'District (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_village', label: 'Village (Permanent)', group: 'Address Information' },
    { name: 'currentAddress_province', label: 'Province (Current)', group: 'Address Information' },
    { name: 'currentAddress_district', label: 'District (Current)', group: 'Address Information' },
    { name: 'currentAddress_village', label: 'Village (Current)', group: 'Address Information' },
    
    // Academic Information
    { name: 'currentClass', label: 'Current Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name, group: 'Academic Information' },
    { name: 'currentLevel', label: 'Current Level', group: 'Academic Information' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', group: 'Academic Information' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ], group: 'Academic Information' },
    
    // Guardian Information
    { name: 'guardianName', label: 'Guardian Name', group: 'Guardian Information' },
    { name: 'guardianRelationship', label: 'Relationship with Guardian', group: 'Guardian Information' },
    { name: 'guardianPhone', label: 'Guardian Phone', group: 'Guardian Information' },
    { name: 'guardianEmail', label: 'Guardian Email', type: 'email', group: 'Guardian Information' }
  ],
  initialForm: {
    // Basic
    user: '',
    studentCode: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    grandfatherName: '',
    dob: '',
    bloodType: '',
    
    // Contact
    phone: '',
    whatsapp: '',
    email: '',
    
    // Address
    permanentAddress_province: '',
    permanentAddress_district: '',
    permanentAddress_village: '',
    currentAddress_province: '',
    currentAddress_district: '',
    currentAddress_village: '',
    
    // Academic
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'active',
    
    // Guardian
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: ''
  },
  mapRowToForm: (row) => ({
    // Basic
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    firstName: row.firstName || row.user?.name?.split(' ')[0] || '',
    lastName: row.lastName || row.user?.name?.split(' ')[1] || '',
    fatherName: row.fatherName || '',
    grandfatherName: row.grandfatherName || '',
    dob: row.dob ? row.dob.split('T')[0] : '',
    bloodType: row.bloodType || '',
    
    // Contact
    phone: row.phone || row.user?.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || row.user?.email || '',
    
    // Address
    permanentAddress_province: row.permanentAddress?.province || '',
    permanentAddress_district: row.permanentAddress?.district || '',
    permanentAddress_village: row.permanentAddress?.village || '',
    currentAddress_province: row.currentAddress?.province || '',
    currentAddress_district: row.currentAddress?.district || '',
    currentAddress_village: row.currentAddress?.village || '',
    
    // Academic
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'active',
    
    // Guardian
    guardianName: row.guardianName || '',
    guardianRelationship: row.guardianRelationship || '',
    guardianPhone: row.guardianPhone || '',
    guardianEmail: row.guardianEmail || ''
  })
};

const StudentProfiles = () => {
  const [profileStats, setProfileStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byClass: [],
    recentAdmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/all`, config);
      const students = response.data || [];
      
      // Calculate statistics
      const total = students.length;
      const active = students.filter(s => s.status === 'active').length;
      const inactive = students.filter(s => s.status === 'inactive').length;
      
      // Group by class
      const classMap = {};
      students.forEach(s => {
        const className = s.currentClass?.className || 'Not Assigned';
        classMap[className] = (classMap[className] || 0) + 1;
      });
      const byClass = Object.entries(classMap)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 classes
      
      // Recent admissions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAdmissions = students.filter(s => {
        const admissionDate = new Date(s.admissionDate || s.createdAt);
        return admissionDate >= thirtyDaysAgo;
      }).length;
      
      setProfileStats({ total, active, inactive, byClass, recentAdmissions });
    } catch (error) {
      console.error('[StudentProfiles] Error fetching stats:', error);
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
            <p className="text-3xl font-black text-slate-900">{profileStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">All registered students</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{profileStats.active}</p>
            <p className="text-sm text-slate-500 mt-1">Currently enrolled</p>
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
            <p className="text-3xl font-black text-gray-600">{profileStats.inactive}</p>
            <p className="text-sm text-slate-500 mt-1">Not currently active</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">🆕</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">New (30 Days)</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{profileStats.recentAdmissions}</p>
            <p className="text-sm text-slate-500 mt-1">Recent admissions</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {profileStats.byClass.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Student Distribution by Class">
            <BarChartComponent
              data={profileStats.byClass}
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </Card>

          <Card title="Enrollment Status">
            <PieChartComponent
              data={[
                { name: 'Active', value: profileStats.active },
                { name: 'Inactive', value: profileStats.inactive }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>
        </div>
      )}

      {/* Student Profiles List */}
      <ListPage {...studentProfilesConfig} />
    </div>
  );
};

export default StudentProfiles;
