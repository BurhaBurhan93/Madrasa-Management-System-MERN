import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import Badge from '../../../components/UIHelper/Badge';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const studentAdmissionsConfig = {
  title: 'Student Admissions',
  subtitle: 'Manage new student admissions - Complete registration with all required information',
  endpoint: '/student/admissions',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'degree', header: 'Degree', render: (value) => value?.degreeName || '-' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'accepted' ? 'bg-green-100 text-green-800' :
        value === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value || 'pending'}
      </span>
    )},
    { key: 'createdAt', header: 'Applied Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    // ===== BASIC INFORMATION =====
    { name: 'user', label: 'User Account (if exists)', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}`, group: 'Basic Information' },
    { name: 'studentCode', label: 'Student Code', required: true, group: 'Basic Information', placeholder: 'e.g., STU-2024-001' },
    { name: 'firstName', label: 'First Name', required: true, group: 'Basic Information' },
    { name: 'lastName', label: 'Last Name', group: 'Basic Information' },
    { name: 'fatherName', label: 'Father Name', required: true, group: 'Basic Information' },
    { name: 'grandfatherName', label: 'Grandfather Name', group: 'Basic Information' },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true, group: 'Basic Information' },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: [
      { value: '', label: 'Select' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-'}
    ], group: 'Basic Information' },
      
    // ===== CONTACT INFORMATION =====
    { name: 'phone', label: 'Phone Number', required: true, group: 'Contact Information' },
    { name: 'whatsapp', label: 'WhatsApp Number', group: 'Contact Information' },
    { name: 'email', label: 'Email Address', type: 'email', group: 'Contact Information' },
      
    // ===== ADDRESS INFORMATION =====
    { name: 'permanentAddress_province', label: 'Province (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_district', label: 'District (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_village', label: 'Village/Street (Permanent)', group: 'Address Information' },
    { name: 'currentAddress_province', label: 'Province (Current)', group: 'Address Information' },
    { name: 'currentAddress_district', label: 'District (Current)', group: 'Address Information' },
    { name: 'currentAddress_village', label: 'Village/Street (Current)', group: 'Address Information' },
      
    // ===== GUARDIAN INFORMATION =====
    { name: 'guardianName', label: 'Guardian Name', required: true, group: 'Guardian Information' },
    { name: 'guardianRelationship', label: 'Relationship with Guardian', required: true, group: 'Guardian Information', placeholder: 'e.g., Father, Mother, Uncle' },
    { name: 'guardianPhone', label: 'Guardian Phone', required: true, group: 'Guardian Information' },
    { name: 'guardianEmail', label: 'Guardian Email', type: 'email', group: 'Guardian Information' },
      
    // ===== ACADEMIC INFORMATION =====
    { name: 'degree', label: 'Enrolled Degree', type: 'relation', relationEndpoint: '/academic/degrees', relationLabel: (row) => row.degreeName || row.name, required: true, group: 'Academic Information' },
    { name: 'currentClass', label: 'Assigned Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name, group: 'Academic Information' },
    { name: 'currentLevel', label: 'Academic Level', group: 'Academic Information', placeholder: 'e.g., Level 1, Beginner' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true, group: 'Academic Information' },
    { name: 'status', label: 'Admission Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' }
    ], required: true, group: 'Academic Information' },
      
    // ===== PREVIOUS EDUCATION =====
    { name: 'previousDegree', label: 'Previous Degree/Certificate', group: 'Previous Education' },
    { name: 'previousInstitution', label: 'Previous Institution', group: 'Previous Education' },
    { name: 'locationOfInstitution', label: 'Institution Location', group: 'Previous Education' }
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
    
    // Guardian
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    
    // Academic
    degree: '',
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'pending',
    
    // Previous Education
    previousDegree: '',
    previousInstitution: '',
    locationOfInstitution: ''
  },
  mapRowToForm: (row) => ({
    // Basic
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    fatherName: row.fatherName || '',
    grandfatherName: row.grandfatherName || '',
    dob: row.dob ? row.dob.split('T')[0] : '',
    bloodType: row.bloodType || '',
    
    // Contact
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    
    // Address
    permanentAddress_province: row.permanentAddress?.province || '',
    permanentAddress_district: row.permanentAddress?.district || '',
    permanentAddress_village: row.permanentAddress?.village || '',
    currentAddress_province: row.currentAddress?.province || '',
    currentAddress_district: row.currentAddress?.district || '',
    currentAddress_village: row.currentAddress?.village || '',
    
    // Guardian
    guardianName: row.guardianName || '',
    guardianRelationship: row.guardianRelationship || '',
    guardianPhone: row.guardianPhone || '',
    guardianEmail: row.guardianEmail || '',
    
    // Academic
    degree: row.degree?._id || row.degree || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'pending',
    
    // Previous Education
    previousDegree: row.previousDegree || '',
    previousInstitution: row.previousInstitution || '',
    locationOfInstitution: row.locationOfInstitution || ''
  })
};

const StudentAdmissions = () => {
  const [admissionStats, setAdmissionStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    byDegree: [],
    byMonth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissionStats();
  }, []);

  const fetchAdmissionStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/admissions`, config);
      const admissions = response.data || [];
      
      // Calculate statistics
      const total = admissions.length;
      const pending = admissions.filter(a => a.status === 'pending').length;
      const accepted = admissions.filter(a => a.status === 'accepted').length;
      const rejected = admissions.filter(a => a.status === 'rejected').length;
      
      // Group by degree
      const degreeMap = {};
      admissions.forEach(a => {
        const degreeName = a.degree?.degreeName || 'Not Assigned';
        degreeMap[degreeName] = (degreeMap[degreeName] || 0) + 1;
      });
      const byDegree = Object.entries(degreeMap).map(([name, count]) => ({ name, value: count }));
      
      // Group by month (last 6 months)
      const monthMap = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = 0;
      }
      admissions.forEach(a => {
        if (a.createdAt) {
          const date = new Date(a.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap.hasOwnProperty(key)) {
            monthMap[key]++;
          }
        }
      });
      const byMonth = Object.entries(monthMap).map(([month, count]) => ({
        name: month,
        value: count
      }));
      
      setAdmissionStats({ total, pending, accepted, rejected, byDegree, byMonth });
    } catch (error) {
      console.error('[StudentAdmissions] Error fetching stats:', error);
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
                <span className="text-xl">📚</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{admissionStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">All time admissions</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{admissionStats.pending}</p>
            <p className="text-sm text-slate-500 mt-1">Awaiting decision</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accepted</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{admissionStats.accepted}</p>
            <p className="text-sm text-slate-500 mt-1">Approved admissions</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-xl">❌</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            </div>
            <p className="text-3xl font-black text-red-600">{admissionStats.rejected}</p>
            <p className="text-sm text-slate-500 mt-1">Declined applications</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {(admissionStats.byDegree.length > 0 || admissionStats.byMonth.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Admissions by Degree">
            {admissionStats.byDegree.length > 0 ? (
              <PieChartComponent
                data={admissionStats.byDegree}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No degree data available
              </div>
            )}
          </Card>

          <Card title="Monthly Admissions Trend">
            {admissionStats.byMonth.length > 0 ? (
              <BarChartComponent
                data={admissionStats.byMonth}
                dataKey="value"
                nameKey="name"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No monthly data available
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Admissions List */}
      <ListPage {...studentAdmissionsConfig} />
    </div>
  );
};

export default StudentAdmissions;
