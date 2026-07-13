import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiClipboard, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const complaintActionsConfig = {
  title: 'Complaint Actions',
  subtitle: 'Manage complaint actions using the same consistent complaints workflow design.',
  endpoint: '/staff/complaint-actions',
  columns: [
    { key: 'complaint', header: 'Complaint', render: (value) => value?.complaintCode || value?.subject || '-' },
    { key: 'actionType', header: 'Action Type' },
    { key: 'actionDescription', header: 'Action Description' },
    { key: 'actionResult', header: 'Action Result' },
    { key: 'actionDate', header: 'Action Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'followUpDate', header: 'Follow Up Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'nextActionRequired', header: 'Next Action', render: (value) => value ? 'Yes' : 'No' },
    { key: 'visibilityScope', header: 'Visibility' }
  ],
  formFields: [
    { name: 'complaint', label: 'Complaint', type: 'relation', relationEndpoint: '/staff/complaints', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.complaintCode || 'No Code'} - ${row.subject || 'Complaint'}` },
    { name: 'actionType', label: 'Action Type' },
    { name: 'actionDescription', label: 'Action Description', type: 'textarea', rows: 3 },
    { name: 'actionResult', label: 'Action Result', type: 'textarea', rows: 3 },
    { name: 'followUpDate', label: 'Follow Up Date', type: 'date' },
    { name: 'nextActionRequired', label: 'Next Action Required', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { name: 'visibilityScope', label: 'Visibility', type: 'select', options: [
      { value: 'public', label: 'Public' },
      { value: 'private', label: 'Private' }
    ] },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 2 }
  ],
  initialForm: { complaint: '', actionType: '', actionDescription: '', actionResult: '', followUpDate: '', nextActionRequired: 'false', visibilityScope: 'private', remarks: '' },
  mapFormToPayload: (form) => ({ 
    ...form, 
    followUpDate: form.followUpDate || null, 
    nextActionRequired: String(form.nextActionRequired) === 'true',
    visibilityScope: form.visibilityScope || 'private'
  }),
  mapRowToForm: (row) => ({ 
    complaint: row.complaint?._id || row.complaint || '', 
    actionType: row.actionType || '',
    actionDescription: row.actionDescription || '', 
    actionResult: row.actionResult || '', 
    followUpDate: row.followUpDate ? new Date(row.followUpDate).toISOString().slice(0, 10) : '', 
    nextActionRequired: String(row.nextActionRequired ?? false),
    visibilityScope: row.visibilityScope || 'private',
    remarks: row.remarks || ''
  })
};

const StaffComplaintActions = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [stats, setStats] = useState({
    totalActions: 0,
    completed: 0,
    pending: 0,
    followUpScheduled: 0,
    byMonth: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchActionsStats();
  }, []);

  const fetchActionsStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/complaint-actions`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const actions = data.data || [];
        
        const totalActions = actions.length;
        const completed = actions.filter(a => a.actionResult).length;
        const pending = actions.filter(a => !a.actionResult).length;
        const followUpScheduled = actions.filter(a => a.followUpDate).length;
        
        // Monthly Trend
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        actions.forEach(a => {
          const date = new Date(a.createdAt || a.followUpDate);
          if (!isNaN(date.getTime())) {
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const byMonth = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalActions,
          completed,
          pending,
          followUpScheduled,
          byMonth
        });
      }
    } catch (err) {
      console.error('Error fetching actions stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const headerContent = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.actions.totalActions')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalActions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiClipboard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.actions.completed')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.actions.pending')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.complaints.actions.followups')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.followUpScheduled}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.complaints.actions.monthlyTrend')}</h3>
          {stats.byMonth.length > 0 ? (
            <BarChartComponent data={stats.byMonth} dataKey="value" nameKey="name" height={250} />
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
        eyebrow={t('staff.complaints.actions.eyebrow')} title={t('staff.complaints.actions.title')} subtitle={t('staff.complaints.actions.subtitle')}
        endpoint={complaintActionsConfig.endpoint} columns={complaintActionsConfig.columns}
        createPath="/staff/complaints/actions/create"
        editPathForRow={(row) => `/staff/complaints/actions/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/complaints/actions/view/${getId(row)}`}
        searchPlaceholder={t('common.search', 'Search complaint actions...')} clientSidePagination={true}
        headerContent={<PageSkeleton type="dashboard" />}
      />
    );
  }

  return (
    <ListPage
      eyebrow={t('staff.complaints.actions.eyebrow')} title={t('staff.complaints.actions.title')} subtitle={t('staff.complaints.actions.subtitle')}
      endpoint={complaintActionsConfig.endpoint} columns={complaintActionsConfig.columns}
      createPath="/staff/complaints/actions/create"
      editPathForRow={(row) => `/staff/complaints/actions/edit/${getId(row)}`}
      viewPathForRow={(row) => `/staff/complaints/actions/view/${getId(row)}`}
      searchPlaceholder={t('common.search', 'Search complaint actions...')} clientSidePagination={true}
      headerContent={headerContent}
    />
  );
};

export default StaffComplaintActions;
