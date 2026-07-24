import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusColors = {
 present: 'bg-emerald-500 text-white',
 absent: 'bg-rose-500 text-white',
 late: 'bg-amber-500 text-white',
 excused: 'bg-sky-500 text-white'
};

const TeacherAttendance = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [sessions, setSessions] = useState([]);
 const [students, setStudents] = useState([]);
 const [selectedSession, setSelectedSession] = useState(null);
 const [attendance, setAttendance] = useState({});
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);

 useEffect(() => { fetchSessions(); }, []);

 const fetchSessions = async () => {
 try {
 const res = await apiFetch('/teacher/sessions');
 const data = await parseJsonSafe(res);
 if (data.success) {
 setSessions(data.data);
 if (data.data.length > 0) loadSessionAttendance(data.data[0]);
 }
 } catch (e) { console.error(e); }
 };

 const fetchStudents = async (classId) => {
 setLoading(true);
 try {
 const res = await apiFetch(`/teacher/students?classId=${classId}`);
 const data = await parseJsonSafe(res);
 if (data.success) {
 setStudents(data.data);
 const defaults = {};
 data.data.forEach(s => { defaults[s._id] = 'present'; });
 setAttendance(defaults);
 }
 } catch (e) { console.error(e); } finally { setLoading(false); }
 };

 const loadSessionAttendance = async (session) => {
 setSelectedSession(session);
 await fetchStudents(session.class?._id);
 try {
 const res = await apiFetch(`/teacher/attendance/session/${session._id}`);
 const data = await parseJsonSafe(res);
 if (data.success && data.data.length > 0) {
 const existing = {};
 data.data.forEach(r => { existing[r.student?._id] = r.status; });
 setAttendance(prev => ({ ...prev, ...existing }));
 }
 } catch (e) { console.error(e); }
 };

 const saveAttendance = async () => {
 if (!selectedSession) return;
 setSaving(true);
 try {
 const records = students.map(s => ({ student: s._id, status: attendance[s._id] || 'present' }));
 const res = await apiFetch('/teacher/attendance', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ sessionId: selectedSession._id, records })
 });
 const data = await parseJsonSafe(res);
 if (!res.ok) throw new Error(data.message || t('attendance.failedSaveAttendance'));
 if (data.success) alert(t('attendance.attendanceSaved'));
 } catch (e) { alert(t('attendance.failedSaveAttendance')); } finally { setSaving(false); }
 };

 const markAll = (status) => {
 const updated = {};
 students.forEach(s => { updated[s._id] = status; });
 setAttendance(updated);
 };

 const summary = useMemo(() => {
 const values = Object.values(attendance);
 return {
 total: students.length,
 present: values.filter(v => v === 'present').length,
 absent: values.filter(v => v === 'absent').length,
 late: values.filter(v => v === 'late').length,
 rate: students.length > 0 ? Math.round((values.filter(v => v === 'present').length / students.length) * 100) : 0
 };
 }, [attendance, students]);

 const   actionBtnCls = 'rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:';
 const   primaryBtnCls = 'rounded-2xl bg-cyan-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md';

 return (
 <div className={PANEL_PAGE_BG}>
  <div className="px-3 py-4 sm:px-6 lg:px-8">

  <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
  <div>
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('attendance.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('attendance.subtitle')}</p>
  </div>
  <button onClick={() => navigate('/teacher/attendance/create-session')} className={primaryBtnCls + ' w-full sm:w-auto'}>
  + {t('attendance.newSession')}
  </button>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
  <div className="space-y-2 sm:space-y-3">
  <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">{t('attendance.sessions')}</p>
  {sessions.length === 0 ? (
  <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 p-4 sm:p-6 text-center text-xs sm:text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{t('attendance.noSessions')}</div>
  ) : sessions.map(s => (
  <div
  key={s._id}
  onClick={() => loadSessionAttendance(s)}
  className={`cursor-pointer rounded-2xl sm:rounded-3xl border-2 bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selectedSession?._id === s._id ? 'border-cyan-400 bg-cyan-50/50 dark:border-cyan-500 dark:bg-cyan-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
  >
  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{s.class?.name} {s.class?.section}</p>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{new Date(s.sessionDate).toLocaleDateString()}</p>
  <span className="mt-2 inline-block rounded-full bg-cyan-100 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-cyan-700 capitalize dark:bg-cyan-900/30 dark:text-cyan-300">{s.sessionType}</span>
  </div>
  ))}
  </div>

  <div className="lg:col-span-2">
  {!selectedSession ? (
  <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center text-xs sm:text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
  {t('attendance.selectSession')}
  </div>
  ) : (
  <div className="space-y-4 sm:space-y-5">
  <div className="grid grid-cols-5 gap-2 sm:gap-3">
  {[
  { label: t('attendance.total'), value: summary.total, accent: '' },
  { label: t('attendance.present'), value: summary.present, accent: 'bg-emerald-500' },
  { label: t('attendance.absent'), value: summary.absent, accent: 'bg-rose-500' },
  { label: t('attendance.late'), value: summary.late, accent: 'bg-amber-500' },
  { label: t('attendance.rate'), value: `${summary.rate}%`, accent: 'bg-violet-500' }
  ].map(c => (
  <div key={c.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-2 sm:p-3 text-center shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
  <p className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{c.value}</p>
  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
  </div>
  ))}
  </div>

  <div className="flex flex-wrap gap-1.5 sm:gap-2">
  {['present', 'absent', 'late', 'excused'].map(s => (
  <button key={s} onClick={() => markAll(s)} className={actionBtnCls + ' capitalize text-[10px] sm:text-xs'}>
  {s === 'present' ? t('attendance.allPresent')
  : s === 'absent' ? t('attendance.allAbsent')
  : s === 'late' ? t('attendance.allLate')
  : t('attendance.allExcused')}
  </button>
  ))}
  </div>

  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  {loading ? (
  <div className="flex h-32 items-center justify-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('attendance.loadingStudents')}</div>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-100 dark:border-slate-700/50 ">
  <th className="p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('attendance.student')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('attendance.code')}</th>
  <th className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('attendance.status')}</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
  {students.length === 0 ? (
  <tr><td colSpan="3" className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('attendance.noStudents')}</td></tr>
  ) : students.map(student => (
  <tr key={student._id} className="transition-colors duration-150 dark:border-slate-700/50 dark:">
  <td className="p-3 sm:p-4 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[100px] sm:max-w-none">{student.user?.name}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-slate-500 dark:text-slate-100">{student.studentCode}</td>
  <td className="p-3 sm:p-4">
  <div className="flex justify-center gap-0.5 sm:gap-1">
  {['present', 'absent', 'late', 'excused'].map(status => (
  <button
  key={status}
  onClick={() => setAttendance(prev => ({ ...prev, [student._id]: status }))}
  className={`rounded-lg sm:rounded-xl px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium capitalize transition-all duration-150 ${attendance[student._id] === status ? statusColors[status] : ' text-slate-600 dark:text-slate-300 dark:'}`}
  >
  {status === 'present' ? t('attendance.present')
  : status === 'absent' ? t('attendance.absent')
  : status === 'late' ? t('attendance.late')
  : t('attendance.excused')}
  </button>
  ))}
  </div>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>
  </div>
  )}
  </div>
  </div>

 </div>

  {selectedSession && (
  <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/90 p-3 sm:p-4 backdrop-blur-xl dark:border-slate-700 ">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 lg:px-8">
  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{summary.present} {t('common.present')} &bull; {summary.absent} {t('common.absent')} &bull; {summary.late} {t('common.late')}</p>
  <button onClick={saveAttendance} disabled={saving} className={'w-full sm:w-auto ' + primaryBtnCls + ' disabled:opacity-60'}>
  {saving ? t('attendance.saving') : t('attendance.saveAttendance')}
  </button>
 </div>
 </div>
 )}
 </div>
 );
};

export default TeacherAttendance;
