import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  createPath: '/staff/registrar/admissions/create',
  editPathForRow: (row) => `/staff/registrar/admissions/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/admissions/view/${row._id}`,
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'degree', header: 'Degree', render: (value) => value?.degreeName || '-' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.name || value?.className || '-' },
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
    { name: 'phone', label: 'Phone Number', required: true, group: 'Contact Information' },
    { name: 'whatsapp', label: 'WhatsApp Number', group: 'Contact Information' },
    { name: 'email', label: 'Email Address', type: 'email', group: 'Contact Information' },
    { name: 'permanentAddress_province', label: 'Province (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_district', label: 'District (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_village', label: 'Village/Street (Permanent)', group: 'Address Information' },
    { name: 'currentAddress_province', label: 'Province (Current)', group: 'Address Information' },
    { name: 'currentAddress_district', label: 'District (Current)', group: 'Address Information' },
    { name: 'currentAddress_village', label: 'Village/Street (Current)', group: 'Address Information' },
    { name: 'guardianName', label: 'Guardian Name', required: true, group: 'Guardian Information' },
    { name: 'guardianRelationship', label: 'Relationship with Guardian', required: true, group: 'Guardian Information', placeholder: 'e.g., Father, Mother, Uncle' },
    { name: 'guardianPhone', label: 'Guardian Phone', required: true, group: 'Guardian Information' },
    { name: 'guardianEmail', label: 'Guardian Email', type: 'email', group: 'Guardian Information' },
    { name: 'degree', label: 'Enrolled Degree', type: 'relation', relationEndpoint: '/academic/degrees', relationLabel: (row) => row.degreeName || row.name, required: true, group: 'Academic Information' },
    { name: 'currentClass', label: 'Assigned Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.name, group: 'Academic Information' },
    { name: 'currentLevel', label: 'Academic Level', group: 'Academic Information', placeholder: 'e.g., Level 1, Beginner' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true, group: 'Academic Information' },
    { name: 'status', label: 'Admission Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' }
    ], required: true, group: 'Academic Information' },
    { name: 'previousDegree', label: 'Previous Degree/Certificate', group: 'Previous Education' },
    { name: 'previousInstitution', label: 'Previous Institution', group: 'Previous Education' },
    { name: 'locationOfInstitution', label: 'Institution Location', group: 'Previous Education' }
  ],
  initialForm: {
    user: '',
    studentCode: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    grandfatherName: '',
    dob: '',
    bloodType: '',
    phone: '',
    whatsapp: '',
    email: '',
    permanentAddress_province: '',
    permanentAddress_district: '',
    permanentAddress_village: '',
    currentAddress_province: '',
    currentAddress_district: '',
    currentAddress_village: '',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    degree: '',
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'pending',
    previousDegree: '',
    previousInstitution: '',
    locationOfInstitution: ''
  },
  mapRowToForm: (row) => ({
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    fatherName: row.fatherName || '',
    grandfatherName: row.grandfatherName || '',
    dob: row.dob ? row.dob.split('T')[0] : '',
    bloodType: row.bloodType || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    permanentAddress_province: row.permanentAddress?.province || '',
    permanentAddress_district: row.permanentAddress?.district || '',
    permanentAddress_village: row.permanentAddress?.village || '',
    currentAddress_province: row.currentAddress?.province || '',
    currentAddress_district: row.currentAddress?.district || '',
    currentAddress_village: row.currentAddress?.village || '',
    guardianName: row.guardianName || '',
    guardianRelationship: row.guardianRelationship || '',
    guardianPhone: row.guardianPhone || '',
    guardianEmail: row.guardianEmail || '',
    degree: row.degree?._id || row.degree || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'pending',
    previousDegree: row.previousDegree || '',
    previousInstitution: row.previousInstitution || '',
    locationOfInstitution: row.locationOfInstitution || ''
  })
};

const StudentAdmissions = () => {
  const { t } = useTranslation(['staff', 'common']);
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
      const admissions = response.data?.data || response.data || [];
      
      const total = admissions.length;
      const pending = admissions.filter(a => a.status === 'pending').length;
      const accepted = admissions.filter(a => a.status === 'accepted').length;
      const rejected = admissions.filter(a => a.status === 'rejected').length;
      
      const degreeMap = {};
      admissions.forEach(a => {
        const degreeName = a.degree?.degreeName || t('registrar.studentAdmissions.charts.notAssigned');
        degreeMap[degreeName] = (degreeMap[degreeName] || 0) + 1;
      });
      const byDegree = Object.entries(degreeMap).map(([name, count]) => ({ name, value: count }));
      
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

  const columns = studentAdmissionsConfig.columns.map(col => ({
    ...col,
    header: t(`registrar.studentAdmissions.columns.${col.key}`)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.studentAdmissions.stats.totalApplications')}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{admissionStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.studentAdmissions.stats.allTimeAdmissions')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.studentAdmissions.stats.pendingReview')}</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{admissionStats.pending}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.studentAdmissions.stats.awaitingDecision')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.studentAdmissions.stats.accepted')}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{admissionStats.accepted}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.studentAdmissions.stats.approvedAdmissions')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-xl">❌</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.studentAdmissions.stats.rejected')}</span>
            </div>
            <p className="text-3xl font-black text-red-600">{admissionStats.rejected}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.studentAdmissions.stats.declinedApplications')}</p>
          </div>
        </Card>
      </div>

      {(admissionStats.byDegree.length > 0 || admissionStats.byMonth.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('registrar.studentAdmissions.charts.admissionsByDegree')}>
            {admissionStats.byDegree.length > 0 ? (
              <PieChartComponent data={admissionStats.byDegree} height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                {t('registrar.studentAdmissions.charts.noDegreeData')}
              </div>
            )}
          </Card>
          <Card title={t('registrar.studentAdmissions.charts.monthlyAdmissionsTrend')}>
            {admissionStats.byMonth.length > 0 ? (
              <BarChartComponent data={admissionStats.byMonth} dataKey="value" nameKey="name" height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                {t('registrar.studentAdmissions.charts.noMonthlyData')}
              </div>
            )}
          </Card>
        </div>
      )}

      <ListPage {...studentAdmissionsConfig} title={t('registrar.studentAdmissions.title')} subtitle={t('registrar.studentAdmissions.subtitle')} columns={columns} />
    </div>
  );
};

export default StudentAdmissions;
