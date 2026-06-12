import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const guardianManagementConfig = {
  title: 'Guardian / Guarantor Management',
  subtitle: 'Manage student guardians and guarantors information',
  endpoint: '/student/guardians',
  columns: [
    { key: 'name', header: 'Guardian Name' },
    { key: 'relationship', header: 'Relationship' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'occupation', header: 'Occupation' },
    { key: 'isPrimary', header: 'Primary', render: (value) => value ? '✅ Yes' : 'No' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/student/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'name', label: 'Guardian Name', required: true },
    { name: 'relationship', label: 'Relationship with Student', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'occupation', label: 'Occupation' },
    { name: 'address', label: 'Address' },
    { name: 'idNumber', label: 'ID Number' },
    { name: 'isPrimary', label: 'Primary Guardian', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ],
  initialForm: {
    student: '',
    name: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    idNumber: '',
    isPrimary: 'false'
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    name: row.name || '',
    relationship: row.relationship || '',
    phone: row.phone || '',
    email: row.email || '',
    occupation: row.occupation || '',
    address: row.address || '',
    idNumber: row.idNumber || '',
    isPrimary: row.isPrimary?.toString() || 'false'
  })
};

const GuardianManagement = () => {
  const [guardianStats, setGuardianStats] = useState({
    total: 0,
    primary: 0,
    secondary: 0,
    byRelationship: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuardianStats();
  }, []);

  const fetchGuardianStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/guardians`, config);
      const guardians = response.data || [];
      
      const total = guardians.length;
      const primary = guardians.filter(g => g.isPrimary).length;
      const secondary = total - primary;
      
      // Group by relationship
      const relMap = {};
      guardians.forEach(g => {
        const rel = g.relationship || 'Other';
        relMap[rel] = (relMap[rel] || 0) + 1;
      });
      const byRelationship = Object.entries(relMap)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      
      setGuardianStats({ total, primary, secondary, byRelationship });
    } catch (error) {
      console.error('[GuardianManagement] Error fetching stats:', error);
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
                <span className="text-xl">👨‍👩‍👧</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Guardians</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{guardianStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">All registered guardians</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Primary Guardians</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{guardianStats.primary}</p>
            <p className="text-sm text-slate-500 mt-1">Main contacts</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-xl">🤝</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Secondary</span>
            </div>
            <p className="text-3xl font-black text-gray-600">{guardianStats.secondary}</p>
            <p className="text-sm text-slate-500 mt-1">Additional contacts</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Relationship Types</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{guardianStats.byRelationship.length}</p>
            <p className="text-sm text-slate-500 mt-1">Different categories</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {guardianStats.byRelationship.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Guardians by Relationship">
            <PieChartComponent
              data={guardianStats.byRelationship}
              height={300}
            />
          </Card>

          <Card title="Relationship Distribution">
            <BarChartComponent
              data={guardianStats.byRelationship}
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </Card>
        </div>
      )}

      {/* Guardians List */}
      <ListPage {...guardianManagementConfig} />
    </div>
  );
};

export default GuardianManagement;
