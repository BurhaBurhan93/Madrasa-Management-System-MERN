import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  createPath: '/staff/registrar/documents/create',
  editPathForRow: (row) => `/staff/registrar/documents/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/documents/view/${row._id}`,
  columns: [
    { key: 'student', header: 'Student', render: (value, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.user?.name || '-' },
    { key: 'type', header: 'Document Type' },
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'createdAt', header: 'Upload Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status' }
  ],
  extraActionItemsForRow: (row) => [
    {
      label: 'View File',
      onClick: () => {
        const raw = row.filePath;
        const path = typeof raw === 'object' ? raw.url : raw;
        if (!path) return;
        if (path.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = path;
          a.download = row.title || 'document';
          a.click();
        } else if (path.startsWith('http')) {
          window.open(path, '_blank');
        } else {
          window.open(`${API_BASE.replace(/\/api$/, '')}${path}`, '_blank');
        }
      },
      className: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'
    }
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
    student: row.student?._id || row.student || row.user?._id || row.user || '',
    type: row.type || '',
    title: row.title || '',
    description: row.description || '',
    filePath: row.filePath || '',
    status: row.status || 'active'
  })
};

const DocumentsManagement = () => {
  const { t } = useTranslation(['staff', 'common']);
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
      const documents = response.data?.data || response.data || [];
      
      const total = documents.length;
      const active = documents.filter(d => d.status === 'active').length;
      const archived = documents.filter(d => d.status === 'archived').length;
      
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

  const columns = documentsManagementConfig.columns.map(col => ({
    ...col,
    header: t(`registrar.documentsManagement.columns.${col.key}`)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.documentsManagement.stats.totalDocuments')}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{docStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.documentsManagement.stats.allUploadedFiles')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.documentsManagement.stats.active')}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{docStats.active}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.documentsManagement.stats.currentDocuments')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.documentsManagement.stats.archived')}</span>
            </div>
            <p className="text-3xl font-black text-gray-600">{docStats.archived}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.documentsManagement.stats.storedDocuments')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('registrar.documentsManagement.stats.documentTypes')}</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{docStats.byType.length}</p>
            <p className="text-sm text-slate-500 mt-1">{t('registrar.documentsManagement.stats.differentCategories')}</p>
          </div>
        </Card>
      </div>

      {docStats.byType.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('registrar.documentsManagement.charts.documentsByType')}>
            <PieChartComponent data={docStats.byType} height={300} />
          </Card>
          <Card title={t('registrar.documentsManagement.charts.documentDistribution')}>
            <BarChartComponent data={docStats.byType} dataKey="value" nameKey="name" height={300} />
          </Card>
        </div>
      )}

      <ListPage {...documentsManagementConfig} title={t('registrar.documentsManagement.title')} subtitle={t('registrar.documentsManagement.subtitle')} columns={columns} extraActionItemsForRow={(row) => documentsManagementConfig.extraActionItemsForRow(row).map(item => ({ ...item, label: t('registrar.documentsManagement.view.viewDownloadFile') }))} />
    </div>
  );
};

export default DocumentsManagement;
