import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

const TeacherCreateExam = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', class: '', duration: 60, startDate: '', endDate: '', academicYear: new Date().getFullYear().toString() });

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/teacher/subjects', api()),
      axios.get('http://localhost:5000/api/teacher/classes', api()),
    ]).then(([s, c]) => {
      if (s.data.success) setSubjects(s.data.data);
      if (c.data.success) setClasses(c.data.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/teacher/exams', form, api());
      if (res.data.success) navigate(`/teacher/exams/${res.data.data._id}`);
    } catch (e) { alert(e.response?.data?.message || 'Failed to create exam'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create New Exam</h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details then add questions</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Exam Title <span className="text-rose-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputCls} placeholder="e.g. Midterm Exam" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inputCls}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
                <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} className={inputCls}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Duration (minutes) <span className="text-rose-500">*</span></label>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required min="1" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Academic Year</label>
                <input type="text" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={loading} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {loading ? 'Creating...' : 'Create & Add Questions'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateExam;
