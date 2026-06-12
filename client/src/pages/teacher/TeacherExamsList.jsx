import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  finished: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-rose-100 text-rose-700',
};

const TeacherExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/exams', api());
      if (res.data.success) setExams(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/exams/${id}`, api());
      fetchExams();
    } catch (e) { alert('Failed to delete'); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/exams/${id}/publish`, {}, api());
      if (res.data.success) { alert('Exam published!'); fetchExams(); }
    } catch (e) { alert(e.response?.data?.message || 'Failed to publish'); }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/exams/${id}/close`, {}, api());
      fetchExams();
    } catch (e) { alert('Failed to close'); }
  };

  const filtered = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: exams.length,
    published: exams.filter(e => e.status === 'published').length,
    draft: exams.filter(e => e.status === 'draft').length,
    finished: exams.filter(e => e.status === 'finished').length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, accent: 'bg-cyan-500' },
    { label: 'Draft', value: stats.draft, accent: 'bg-amber-500' },
    { label: 'Published', value: stats.published, accent: 'bg-emerald-500' },
    { label: 'Finished', value: stats.finished, accent: 'bg-sky-500' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Exams</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and monitor your exams</p>
          </div>
          <button onClick={() => navigate('/teacher/exams/create')} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md">
            + Create Exam
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
          <div className="flex gap-4">
            <input type="text" placeholder="Search exam..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Title</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Subject</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Class</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Duration</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Marks</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-500">No exams found</td></tr>
                ) : filtered.map(exam => (
                  <tr key={exam._id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{exam.title}</td>
                    <td className="p-4 text-slate-600">{exam.subject?.name || '-'}</td>
                    <td className="p-4 text-slate-600">{exam.class?.name || '-'}</td>
                    <td className="p-4 text-slate-600">{exam.duration} min</td>
                    <td className="p-4 text-slate-600">{exam.totalMarks}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[exam.status]}`}>{exam.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate(`/teacher/exams/${exam._id}`)} className="rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">View</button>
                        {exam.status === 'draft' && <button onClick={() => handlePublish(exam._id)} className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Publish</button>}
                        {exam.status === 'published' && <button onClick={() => handleClose(exam._id)} className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Close</button>}
                        {(exam.status === 'published' || exam.status === 'finished') && <button onClick={() => navigate(`/teacher/exams/${exam._id}/submissions`)} className="rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100">Submissions</button>}
                        {exam.status === 'draft' && <button onClick={() => handleDelete(exam._id)} className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherExamsList;
