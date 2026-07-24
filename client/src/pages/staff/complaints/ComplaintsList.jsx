import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFlag, FiTrendingUp } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const complaintsConfig = {
  title: 'Complaints',
  subtitle: 'Track complaint records with the same clean table, filters, and status workflow.',
  endpoint: '/staff/complaints',
  columns: [
    { key: 'complaintCode', header: 'Complaint Code' },
    { key: 'subject', header: 'Subject' },
    { key: 'category', header: 'Category' },
    { key: 'priority', header: 'Priority' },
    { key: 'status', header: 'Status' },
    { key: 'submittedBy', header: 'Submitted By', render: (value) => value?.name || '-' },
    { key: 'assignedTo', header: 'Assigned To', render: (value) => value?.name || '-' },
    { key: 'createdAt', header: 'Submitted Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
  ],
  formFields: [
    { name: 'complaintCode', label: 'Complaint Code', required: true },
    { name: 'complainantType', label: 'Complainant Type', type: 'select', options: [
      { value: 'student', label: 'Student' },
      { value: 'staff', label: 'Staff' },
      { value: 'other', label: 'Other' }
    ], required: true },
    { name: 'complaintCategory', label: 'Category' },
    { name: 'subject', label: 'Subject' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ] },
    { name: 'complaintStatus', label: 'Status', type: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'closed', label: 'Closed' }
    ] },
    { name: 'confidentialityLevel', label: 'Confidentiality Level', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]}
  ],
  initialForm: { complaintCode: '', complainantType: 'student', complaintCategory: '', subject: '', description: '', priorityLevel: 'medium', complaintStatus: 'open', confidentialityLevel: 'low' },
  mapFormToPayload: (form) => ({ ...form }),
  mapRowToForm: (row) => ({
    complaintCode: row.complaintCode || '',
    complainantType: row.complainantType || 'student',
    complaintCategory: row.complaintCategory || '',
    subject: row.subject || '',
    description: row.description || '',
    priorityLevel: row.priorityLevel || 'medium',
    complaintStatus: row.complaintStatus || 'open',
    confidentialityLevel: row.confidentialityLevel || 'low'
  })
};

const StaffComplaintsList = () => {
  const { t } = useTranslation(['staff', 'common']);
  const columns = complaintsConfig.columns.map(col => ({
    ...col,
    header: t(`staff.complaints.list.columns.${col.key}`)
  }));
  const formFields = complaintsConfig.formFields.map(field => ({
    ...field,
    label: t(`staff.complaints.list.fields.${field.name}`),
    options: field.options?.map(opt => ({ ...opt, label: t(`staff.complaints.list.options.${field.name}.${opt.value}`) }))
  }));
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    closedComplaints: 0,
    highPriority: 0,
    byCategory: [],
    byPriority: [],
    byType: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchComplaintStats();
  }, []);

  const fetchComplaintStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/complaints`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const complaints = data.data || [];
        
        const totalComplaints = complaints.length;
        const openComplaints = complaints.filter(c => c.complaintStatus === 'open').length;
        const inProgressComplaints = complaints.filter(c => c.complaintStatus === 'in_progress').length;
        const closedComplaints = complaints.filter(c => c.complaintStatus === 'closed').length;
        const highPriority = complaints.filter(c => c.priorityLevel === 'high').length;
        
        // By Category
        const categoryMap = {};
        complaints.forEach(c => {
          const cat = c.complaintCategory || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // By Priority
        const priorityMap = {};
        complaints.forEach(c => {
          const priority = c.priorityLevel || 'medium';
          priorityMap[priority] = (priorityMap[priority] || 0) + 1;
        });
        const byPriority = Object.entries(priorityMap)
          .map(([name, value]) => ({ name, value }));
        
        // By Type
        const typeMap = {};
        complaints.forEach(c => {
          const type = c.complainantType || 'unknown';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });
        const byType = Object.entries(typeMap)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalComplaints,
          openComplaints,
          inProgressComplaints,
          closedComplaints,
          highPriority,
          byCategory,
          byPriority,
          byType
        });
      }
    } catch (err) {
      console.error('Error fetching complaint stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const headerContent = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.list.total')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-gray-50 to-slate-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.list.open')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.openComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.list.inProgress')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.inProgressComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.list.closed')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.closedComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.list.highPriority')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiFlag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.complaints.list.byCategory')}</h3>
          {stats.byCategory.length > 0 ? (
            <PieChartComponent data={stats.byCategory} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{t('common.noData')}</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.complaints.list.byPriority')}</h3>
          {stats.byPriority.length > 0 ? (
            <BarChartComponent data={stats.byPriority} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{t('common.noData')}</p>
          )}
        </Card>
      </div>
    </>
  );

  if (loading) {
    return (
      <ListPage
        eyebrow={t('staff.complaints.list.title')} title={t('staff.complaints.list.title')}
        endpoint={complaintsConfig.endpoint} columns={columns}
        viewPathForRow={(row) => `/staff/complaints/view/${getId(row)}`}
        editPathForRow={(row) => `/staff/complaints/edit/${getId(row)}`}
        searchPlaceholder={t('staff.complaints.list.searchPlaceholder')}
        clientSidePagination={true}
        deleteEnabled={false}
        extraActionItemsForRow={(row, refetch) => [
          row.status !== 'in_progress' && row.status !== 'in-progress' ? { label: t('staff.complaints.list.markInProgress'), className: 'text-amber-700 hover:bg-amber-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'in_progress' }) }); refetch(); } } : null,
          row.status !== 'closed' && row.status !== 'resolved' ? { label: t('staff.complaints.list.closeComplaint'), className: 'text-rose-700 hover:bg-rose-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'resolved' }) }); refetch(); } } : null
        ].filter(Boolean)}
        headerContent={<PageSkeleton type="dashboard" />}
      />
    );
  }

  return (
    <ListPage
      eyebrow={t('staff.complaints.list.title')} title={t('staff.complaints.list.title')} subtitle={t('staff.complaints.list.subtitle')}
      endpoint={complaintsConfig.endpoint} columns={columns}
      viewPathForRow={(row) => `/staff/complaints/view/${getId(row)}`}
      editPathForRow={(row) => `/staff/complaints/edit/${getId(row)}`}
      searchPlaceholder={t('common.search', 'Search complaints...')}
      clientSidePagination={true}
      deleteEnabled={false}
      extraActionItemsForRow={(row, refetch) => [
        row.status !== 'in_progress' && row.status !== 'in-progress' ? { label: t('staff.complaints.list.markInProgress'), className: 'text-amber-700 hover:bg-amber-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'in_progress' }) }); refetch(); } } : null,
        row.status !== 'closed' && row.status !== 'resolved' ? { label: t('staff.complaints.list.closeComplaint'), className: 'text-rose-700 hover:bg-rose-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'resolved' }) }); refetch(); } } : null
      ].filter(Boolean)}
      headerContent={headerContent}
    />
  );
};

export default StaffComplaintsList;
