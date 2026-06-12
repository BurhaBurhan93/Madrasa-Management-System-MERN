import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const documentsManagementConfig = {
  title: 'Student Documents Management',
  subtitle: 'Upload, manage, and track student documents and certificates',
  endpoint: '/student/documents',
  columns: [
    { key: 'student', header: 'Student', render: (value, row) => row.student?.user?.name || '-' },
    { key: 'type', header: 'Document Type' },
    { key: 'title', header: 'Title' },
    { key: 'uploadDate', header: 'Upload Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', render: (value, row, actions) => (
      <div className="flex gap-2">
        <button 
          onClick={() => window.open(row.filePath, '_blank')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          📄 View
        </button>
        <button 
          onClick={() => actions.onDelete(row)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          🗑️ Delete
        </button>
      </div>
    )}
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/student/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'type', label: 'Document Type', type: 'select', options: [
      { value: 'passport', label: 'Passport Photo' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'transcript', label: 'Transcript' },
      { value: 'id_card', label: 'ID Card' },
      { value: 'birth_certificate', label: 'Birth Certificate' },
      { value: 'other', label: 'Other' }
    ], required: true },
    { name: 'title', label: 'Document Title', required: true },
    { name: 'description', label: 'Description' },
    { name: 'filePath', label: 'Upload File', type: 'file', accept: '.pdf,.jpg,.jpeg,.png' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' }
    ]}
  ],
  initialForm: {
    student: '',
    type: 'passport',
    title: '',
    description: '',
    filePath: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    type: row.type || '',
    title: row.title || '',
    description: row.description || '',
    filePath: row.filePath || '',
    status: row.status || 'active'
  })
};

const DocumentsManagement = () => {
  const [docStats, setDocStats] = useState({
    total: 0,
    byType: [],
    active: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocStats();
  }, []);

  const fetchDocStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/documents`, config);
      const documents = response.data || [];
      
      const total = documents.length;
      const active = documents.filter(d => d.status === 'active').length;
      const archived = documents.filter(d => d.status === 'archived').length;
      
      // Group by type
      const typeMap = {};
      documents.forEach(d => {
        const type = d.type || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const byType = Object.entries(typeMap).map(([name, count]) => ({ name, value: count }));
      
      setDocStats({ total, byType, active, archived });
    } catch (error) {
      console.error('[DocumentsManagement] Error fetching stats:', error);
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
                <span className="text-xl">📄</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Documents</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{docStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">All uploaded files</p>
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
            <p className="text-3xl font-black text-emerald-600">{docStats.active}</p>
            <p className="text-sm text-slate-500 mt-1">Current documents</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Archived</span>
            </div>
            <p className="text-3xl font-black text-gray-600">{docStats.archived}</p>
            <p className="text-sm text-slate-500 mt-1">Stored documents</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Document Types</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{docStats.byType.length}</p>
            <p className="text-sm text-slate-500 mt-1">Different categories</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {docStats.byType.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Documents by Type">
            <PieChartComponent
              data={docStats.byType}
              height={300}
            />
          </Card>

          <Card title="Document Distribution">
            <BarChartComponent
              data={docStats.byType}
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </Card>
        </div>
      )}

      {/* Documents List */}
      <ListPage {...documentsManagementConfig} />
    </div>
  );
};

export default DocumentsManagement;
