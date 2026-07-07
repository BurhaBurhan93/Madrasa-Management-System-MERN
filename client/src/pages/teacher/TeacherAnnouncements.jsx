import { useState, useEffect } from 'react';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const priorityColors = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const MOCK = [
  { _id: '1', title: 'Staff Meeting - Sunday', content: 'All teachers are requested to attend the staff meeting on Sunday at 10:00 AM in the conference room. Agenda includes curriculum review and exam schedule planning.', priority: 'high', createdBy: { name: 'Principal Office' }, createdAt: '2026-06-25T08:00:00Z', expiresAt: '2026-07-01T08:00:00Z', targetAudience: 'all', audienceRoles: ['teacher'] },
  { _id: '2', title: 'New Academic Year Schedule', content: 'The academic year 2026-2027 schedule has been released. Please check your assigned classes and timings on the portal.', priority: 'high', createdBy: { name: 'Academic Department' }, createdAt: '2026-06-20T10:00:00Z', expiresAt: null, targetAudience: 'all', audienceRoles: ['teacher'] },
  { _id: '3', title: 'Quran Competition Registration', content: 'Registration for the annual Quran competition is now open. Please encourage students to participate. Last date for registration is July 15th.', priority: 'medium', createdBy: { name: 'Activities Office' }, createdAt: '2026-06-18T09:00:00Z', expiresAt: '2026-07-15T23:59:00Z', targetAudience: 'all', audienceRoles: ['teacher'] },
  { _id: '4', title: 'Library New Arrivals', content: 'New books on Islamic jurisprudence and Arabic grammar have been added to the library. Teachers can borrow them for classroom use.', priority: 'low', createdBy: { name: 'Library Department' }, createdAt: '2026-06-15T14:00:00Z', expiresAt: null, targetAudience: 'all', audienceRoles: ['teacher'] },
  { _id: '5', title: 'Exam Paper Submission Deadline', content: 'All exam papers for the upcoming mid-term exams must be submitted to the academic office by July 5th. Please use the standard template.', priority: 'medium', createdBy: { name: 'Examination Board' }, createdAt: '2026-06-22T11:00:00Z', expiresAt: '2026-07-05T17:00:00Z', targetAudience: 'all', audienceRoles: ['teacher'] },
];

const TeacherAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/communications/announcements');
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setAnnouncements(data.data);
      else setAnnouncements(MOCK);
    } catch { setAnnouncements(MOCK); } finally { setLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  const filtered = announcements.filter(a => {
    if (filter === 'high') return a.priority === 'high';
    if (filter === 'medium') return a.priority === 'medium';
    if (filter === 'low') return a.priority === 'low';
    if (filter === 'expired') return isExpired(a.expiresAt);
    if (filter === 'active') return !isExpired(a.expiresAt);
    return true;
  });

  const stats = {
    total: announcements.length,
    high: announcements.filter(a => a.priority === 'high').length,
    medium: announcements.filter(a => a.priority === 'medium').length,
    low: announcements.filter(a => a.priority === 'low').length,
    expired: announcements.filter(a => isExpired(a.expiresAt)).length,
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Announcements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">School announcements and notices</p>
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, accent: 'bg-cyan-500', filter: 'all' },
            { label: 'High Priority', value: stats.high, accent: 'bg-rose-500', filter: 'high' },
            { label: 'Medium', value: stats.medium, accent: 'bg-amber-500', filter: 'medium' },
            { label: 'Low', value: stats.low, accent: 'bg-sky-500', filter: 'low' },
            { label: 'Expired', value: stats.expired, accent: 'bg-slate-400', filter: 'expired' },
          ].map(c => (
            <button key={c.label} onClick={() => setFilter(c.filter)} className={`relative overflow-hidden rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800/50 ${filter === c.filter ? 'border-cyan-300 ring-2 ring-cyan-100 dark:border-cyan-600 dark:ring-cyan-900/30 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </button>
          ))}
        </section>

        {/* Announcements */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const expired = isExpired(a.expiresAt);
              return (
                <div
                  key={a._id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800/50 ${expired ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{a.title}</h3>
                        {expired && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">Expired</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.content}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[a.priority] || ''}`}>
                      {a.priority}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    <span>By: {a.createdBy?.name || 'Unknown'}</span>
                    <span>Posted: {formatDate(a.createdAt)}</span>
                    {a.expiresAt && <span>Expires: {formatDate(a.expiresAt)}</span>}
                    {a.targetAudience && <span>Audience: {a.targetAudience}</span>}
                    {a.audienceRoles?.length > 0 && <span>Roles: {a.audienceRoles.join(', ')}</span>}
                    {a.attachments?.length > 0 && <span className="text-cyan-500 dark:text-cyan-400">{a.attachments.length} attachment(s)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAnnouncements;
