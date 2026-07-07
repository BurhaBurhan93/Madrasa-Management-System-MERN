import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const TeacherLeaveApply = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-400';

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await apiFetch('/teacher/leave-types');
      const data = await parseJsonSafe(res);
      if (data.success) setLeaveTypes(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveType || !form.startDate || !form.endDate) {
      alert('Please fill all required fields');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert('End date must be after start date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/teacher/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
        }),
      });
      const data = await parseJsonSafe(res);
      if (data.success) {
        alert('Leave application submitted successfully');
        navigate('/teacher/leaves');
      } else {
        alert(data.message || 'Failed to submit leave application');
      }
    } catch (e) {
      alert('Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Apply for Leave</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Submit a new leave application</p>
          </div>
          <button
            onClick={() => navigate('/teacher/leaves')}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Back to Leaves
          </button>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Leave Type *</label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                className={fieldCls}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt._id} value={lt._id}>
                    {lt.leaveTypeName} {lt.leaveCode ? `(${lt.leaveCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className={fieldCls + ' dark:[color-scheme:dark]'}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className={fieldCls + ' dark:[color-scheme:dark]'}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                className={fieldCls}
                placeholder="Describe the reason for your leave..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/leaves')}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLeaveApply;
