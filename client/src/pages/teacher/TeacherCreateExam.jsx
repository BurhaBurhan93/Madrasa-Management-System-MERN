import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CalendarDatePicker from '../../components/UIHelper/CalendarDatePicker';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-400';

const TeacherCreateExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editId = query.get('id');

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    class: '',
    duration: 60,
    startDate: '',
    endDate: '',
    academicYear: new Date().getFullYear().toString()
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/teacher/subjects'),
      apiFetch('/teacher/classes'),
    ])
      .then(async ([sRes, cRes]) => {
        const sData = await parseJsonSafe(sRes);
        const cData = await parseJsonSafe(cRes);
        if (sData.success) setSubjects(sData.data);
        if (cData.success) setClasses(cData.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!editId) return;
    apiFetch(`/teacher/exams/${editId}`)
      .then(parseJsonSafe)
      .then((data) => {
        if (data.success) {
          const exam = data.data;
          setForm({
            title: exam.title || '',
            subject: exam.subject?._id || exam.subject || '',
            class: exam.class?._id || exam.class || '',
            duration: exam.duration || 60,
            startDate: exam.startDate || '',
            endDate: exam.endDate || '',
            academicYear: exam.academicYear || new Date().getFullYear().toString()
          });
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editId ? 'PUT' : 'POST';
      const path = editId ? `/teacher/exams/${editId}` : '/teacher/exams';

      const res = await apiFetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const json = await parseJsonSafe(res);

      if (json.success) {
        navigate(`/teacher/exams/${json.data._id}`);
      } else {
        alert(json.message || 'Something went wrong');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {editId ? 'Edit Exam' : 'Create New Exam'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {editId ? 'Update the exam details below.' : 'Fill in the details to create a new exam.'}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Exam Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className={fieldCls}
              placeholder="e.g. Midterm Exam"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={fieldCls}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Class
              </label>
              <select
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className={fieldCls}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Duration (minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
                min="1"
                className={fieldCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Academic Year
              </label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className={fieldCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Start Date
              </label>
              <CalendarDatePicker
                value={form.startDate}
                onChange={(date) => setForm({ ...form, startDate: date })}
                placeholder="Select start date"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                End Date
              </label>
              <CalendarDatePicker
                value={form.endDate}
                onChange={(date) => setForm({ ...form, endDate: date })}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60"
            >
              {loading ? (editId ? 'Updating...' : 'Creating...') : (editId ? 'Update Exam' : 'Create & Add Questions')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default TeacherCreateExam;
