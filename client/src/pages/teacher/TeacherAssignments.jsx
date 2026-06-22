import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-sky-100 text-sky-700',
  cancelled: 'bg-rose-100 text-rose-700'
};

const TeacherAssignments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAssignments(); fetchSubjects(); }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/assignments', api());
      if (res.data.success) setAssignments(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/subjects', api());
      if (res.data.success) setSubjects(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
   if (!window.confirm(t('teacher.assignments.deleteConfirm'))) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/assignments/${id}`, api());
      fetchAssignments();
    } catch (e) { alert(t('teacher.assignments.deleteFailed')); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/assignments/${id}`, { status }, api());
      fetchAssignments();
    } catch (e) { alert(t('teacher.assignments.updateFailed')); }
  };

  const filtered = assignments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSubject = filterSubject === 'all' || a.courseId?._id === filterSubject;
    return matchStatus && matchSubject;
  });

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => new Date(a.dueDate) < new Date() && a.status === 'active').length,
  };

  const statCards = [
  {
    label: t('teacher.assignments.total'),
    value: stats.total,
    accent: 'bg-cyan-500'
  },
  {
    label: t('teacher.assignments.active'),
    value: stats.active,
    accent: 'bg-emerald-500'
  },
  {
    label: t('teacher.assignments.completed'),
    value: stats.completed,
    accent: 'bg-violet-500'
  },
  {
    label: t('teacher.assignments.overdue'),
    value: stats.overdue,
    accent: 'bg-rose-500'
  }
];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('teacher.assignments.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('teacher.assignments.subtitle')}</p>
          </div>
          <button onClick={() => navigate('/teacher/create-assignments')} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md">
            + {t('teacher.assignments.createAssignment')}
          </button>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {statCards.map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">
  {t('teacher.assignments.allStatus')}
</option>
              <option value="active">
  {t('teacher.common.active')}
</option>
              <option value="completed">
  {t('teacher.common.completed')}
</option>
              <option value="cancelled">
  {t('teacher.assignments.cancelled')}
</option>
            </select>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">
  {t('teacher.assignments.allSubjects')}
</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-500">{t('teacher.assignments.loading')}</div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-3 rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
                {t('teacher.assignments.noAssignmentsFound')}
              </div>
            ) : filtered.map(a => {
              const isOverdue = new Date(a.dueDate) < new Date() && a.status === 'active';
              return (
                <div key={a._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{a.courseId?.name || t('teacher.assignments.noSubject')}</p>
                    </div>
                    <span
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    statusColors[a.status] || 'bg-slate-100 text-slate-600'
  }`}
>
  {a.status === 'active'
    ? t('teacher.common.active')
    : a.status === 'completed'
    ? t('teacher.common.completed')
    : a.status === 'cancelled'
    ? t('teacher.assignments.cancelled')
    : a.status}
</span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600 line-clamp-2">{a.description}</p>

                  <div className="mt-3 space-y-1 text-sm">
                    <p className={`font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                      {t('teacher.assignments.due')}: {new Date(a.dueDate).toLocaleDateString()} {isOverdue && (
  <> ⚠️ {t('teacher.assignments.overdueLabel')}</>
)}
                    </p>
                    <p className="text-slate-500">{t('teacher.assignments.maxPoints')}: {a.maxPoints}</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {a.status === 'active' && (
                      <button onClick={() => handleStatusChange(a._id, 'completed')} className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-all duration-200 hover:bg-sky-100">
                        {t('teacher.assignments.markComplete')}
                      </button>
                    )}
                    <button onClick={() => handleDelete(a._id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-all duration-200 hover:bg-rose-100">
                      {t('teacher.assignments.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

      </div>
    </div>
  );
};

export default TeacherAssignments;
