import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from '../shared/StaffPageLayout';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { staffApi } from '../../../api/staffApi';

export const supportTicketsConfig = {
  title: 'Support Tickets',
  subtitle: 'Manage student support tickets',
  endpoint: '/support/tickets',
  columns: [
    { key: 'ticketNumber', header: 'Ticket #' },
    { key: 'subject', header: 'Subject' },
    { key: 'category', header: 'Category' },
    { key: 'priority', header: 'Priority' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created' },
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/staff/students', relationLabel: (r) => `${r.fullName || r.name} (${r.studentCode || ''})` },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'select', options: [
      { value: 'academic', label: 'Academic' },
      { value: 'discipline', label: 'Discipline' },
      { value: 'facilities', label: 'Facilities' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ]},
    { name: 'assignedTo', label: 'Assign To', type: 'relation', relationEndpoint: '/payroll/employees', relationLabel: (r) => `${r.fullName || r.name || ''} (${r.employeeCode || ''})` },
  ],
  initialForm: {
    student: '', subject: '', description: '', category: 'other', priority: 'medium', assignedTo: '',
  },
  mapFormToPayload: (form) => form,
};

const SupportTickets = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${supportTicketsConfig.endpoint}?limit=500`);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || t('staff.support.tickets.loadError', 'Failed to load tickets'));
        setTickets(Array.isArray(data.data) ? data.data : []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, []);

  const insights = useMemo(() => {
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const highUrgent = tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
    return { openTickets, inProgress, resolved, highUrgent };
  }, [tickets]);

  const translatedColumns = useMemo(() =>
    supportTicketsConfig.columns.map(col => ({
      ...col,
      header: t(`staff.support.tickets.columns.${col.key}`, col.header),
    })),
    [t]
  );

  if (loading) {
    return (
      <StaffPageLayout eyebrow={t('staff.support.tickets.eyebrow', 'Support')} title={t('staff.support.tickets.title', 'Support Tickets')} subtitle={t('staff.support.tickets.subtitle', 'Manage student support tickets.')}>
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('staff.support.tickets.statOpen', 'Open Tickets'), value: insights.openTickets, icon: FiClock, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700 dark:bg-slate-700 dark:text-slate-200' },
          { label: t('staff.support.tickets.statInProgress', 'In Progress'), value: insights.inProgress, icon: FiTrendingUp, tone: 'from-blue-50 to-cyan-50', chip: 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-slate-200' },
          { label: t('staff.support.tickets.statResolved', 'Resolved'), value: insights.resolved, icon: FiCheckCircle, tone: 'from-green-50 to-emerald-50', chip: 'bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-200' },
          { label: t('staff.support.tickets.statHighUrgent', 'High / Urgent'), value: insights.highUrgent, icon: FiAlertCircle, tone: 'from-red-50 to-rose-50', chip: 'bg-red-100 text-red-700 dark:bg-slate-700 dark:text-slate-200' },
        ].map((item) => (
          <Card key={item.label} className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-none dark:border-slate-700 dark:bg-none dark:bg-slate-800/50`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip}`}><item.icon size={22} /></span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );

  return (
    <ListPage
      title={t('staff.support.tickets.title', supportTicketsConfig.title)}
      subtitle={t('staff.support.tickets.subtitle', supportTicketsConfig.subtitle)}
      endpoint={supportTicketsConfig.endpoint}
      columns={translatedColumns}
      createPath="/staff/support/tickets/create"
      editPathForRow={(row) => `/staff/support/tickets/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/support/tickets/view/${row._id}`}
      searchPlaceholder={t('staff.support.tickets.searchPlaceholder', 'Search tickets...')}
      eyebrow={t('staff.support.tickets.eyebrow', 'Support')}
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default SupportTickets;
