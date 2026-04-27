import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', courseId: '', description: '', dueDate: '', maxPoints: 100, status: 'active' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/teacher/subjects', api())
      .then(res => { if (res.data.success) setSubjects(res.data.data); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.dueDate) { alert('Please fill required fields'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/teacher/assignments', form, api());
      if (res.data.success) { alert('Assignment created!'); navigate('/teacher/assignments'); }
    } catch (e) { alert(e.response?.data?.message || 'Failed to create assignment'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Assignment</h1>
          <p className="mt-1 text-sm text-slate-500">Add a new assignment for your students</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Title <span className="text-rose-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputCls} placeholder="Assignment title" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Subject <span className="text-rose-500">*</span></label>
              <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required className={inputCls}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Due Date <span className="text-rose-500">*</span></label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Max Points</label>
                <input type="number" value={form.maxPoints} onChange={e => setForm({ ...form, maxPoints: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
              <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Assignment instructions..." />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={loading} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
