import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const MOCK = [
  { _id: '1', sessionDate: '2026-06-28T08:00:00Z', class: { name: 'Class 10', section: 'A' }, topic: 'Surah Al-Baqarah verses 1-10' },
  { _id: '2', sessionDate: '2026-06-27T08:00:00Z', class: { name: 'Class 9', section: 'B' }, topic: 'Hadith on Sincerity' },
  { _id: '3', sessionDate: '2026-06-26T08:00:00Z', class: { name: 'Class 10', section: 'A' }, topic: 'Fiqh of Salah review' },
  { _id: '4', sessionDate: '2026-06-25T08:00:00Z', class: { name: 'Class 8', section: 'A' }, topic: 'Arabic Grammar - Nouns' },
  { _id: '5', sessionDate: '2026-06-24T08:00:00Z', class: { name: 'Class 9', section: 'A' }, topic: 'Tafsir of Surah Al-Ikhlas' },
];

const TeacherSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/teacher/sessions');
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setSessions(data.data);
      else setSessions(MOCK);
    } catch (e) {
      console.error(e);
      setSessions(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
    </div>
  );

  const renderTable = () => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
            <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
            <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Topic</th>
            <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id} className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/30">
              <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{formatDate(s.sessionDate)}</td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                {s.class?.name ? (s.class.section ? `${s.class.name} - ${s.class.section}` : s.class.name) : '-'}
              </td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{s.topic || '-'}</td>
              <td className="px-5 py-4">
                <button
                  onClick={() => navigate('/teacher/attendance')}
                  className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50"
                >
                  Mark Attendance
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Attendance Sessions</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View all attendance sessions</p>
          </div>
          <button
            onClick={() => navigate('/teacher/attendance/create-session')}
            className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
          >
            + New Session
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Sessions: <span className="font-semibold text-slate-700 dark:text-slate-300">{sessions.length}</span>
          </p>
        </div>

        {loading ? renderLoading() : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-5xl">📅</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No sessions found</p>
            <button
              onClick={() => navigate('/teacher/attendance/create-session')}
              className="mt-4 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Create First Session
            </button>
          </div>
        ) : renderTable()}
      </div>
    </div>
  );
};

export default TeacherSessions;
