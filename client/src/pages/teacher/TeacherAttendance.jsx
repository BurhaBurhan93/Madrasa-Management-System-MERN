import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  present: 'bg-emerald-500 text-white',
  absent: 'bg-rose-500 text-white',
  late: 'bg-amber-500 text-white',
  excused: 'bg-sky-500 text-white'
};

const TeacherAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionForm, setSessionForm] = useState({ class: '', sessionDate: new Date().toISOString().split('T')[0], sessionType: 'lecture', location: '' });

  useEffect(() => { fetchSessions(); fetchClasses(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/sessions', api());
      if (res.data.success) {
        setSessions(res.data.data);
        if (res.data.data.length > 0) loadSessionAttendance(res.data.data[0]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/classes', api());
      if (res.data.success) setClasses(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/students?classId=${classId}`, api());
      if (res.data.success) {
        setStudents(res.data.data);
        const defaults = {};
        res.data.data.forEach(s => { defaults[s._id] = 'present'; });
        setAttendance(defaults);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadSessionAttendance = async (session) => {
    setSelectedSession(session);
    await fetchStudents(session.class?._id);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/attendance/session/${session._id}`, api());
      if (res.data.success && res.data.data.length > 0) {
        const existing = {};
        res.data.data.forEach(r => { existing[r.student?._id] = r.status; });
        setAttendance(prev => ({ ...prev, ...existing }));
      }
    } catch (e) { console.error(e); }
  };

  const createSession = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/teacher/sessions', sessionForm, api());
      if (res.data.success) {
        fetchSessions();
        setShowCreateSession(false);
        setSessionForm({ class: '', sessionDate: new Date().toISOString().split('T')[0], sessionType: 'lecture', location: '' });
      }
    } catch (e) { alert(e.response?.data?.message || 'Failed to create session'); }
  };

  const saveAttendance = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      const records = students.map(s => ({ student: s._id, status: attendance[s._id] || 'present' }));
      const res = await axios.post('http://localhost:5000/api/teacher/attendance', { sessionId: selectedSession._id, records }, api());
      if (res.data.success) alert('Attendance saved successfully!');
    } catch (e) { alert('Failed to save attendance'); } finally { setSaving(false); }
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

  const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">Select a session to mark attendance</p>
          </div>
          <button onClick={() => setShowCreateSession(true)} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md">
            + New Session
          </button>
        </div>

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">Create Session</h2>
              <div className="space-y-3">
                <select value={sessionForm.class} onChange={e => setSessionForm({ ...sessionForm, class: e.target.value })} className={inputCls}>
                  <option value="">Select Class *</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
                </select>
                <input type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm({ ...sessionForm, sessionDate: e.target.value })} className={inputCls} />
                <select value={sessionForm.sessionType} onChange={e => setSessionForm({ ...sessionForm, sessionType: e.target.value })} className={inputCls}>
                  <option value="lecture">Lecture</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" placeholder="Location (optional)" value={sessionForm.location} onChange={e => setSessionForm({ ...sessionForm, location: e.target.value })} className={inputCls} />
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setShowCreateSession(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                <button onClick={createSession} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">Create</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sessions List */}
          <div className="space-y-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sessions</p>
            {sessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No sessions yet</div>
            ) : sessions.map(s => (
              <div
                key={s._id}
                onClick={() => loadSessionAttendance(s)}
                className={`cursor-pointer rounded-3xl border-2 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selectedSession?._id === s._id ? 'border-cyan-400 bg-cyan-50/50' : 'border-transparent hover:border-slate-200'}`}
              >
                <p className="font-semibold text-slate-900">{s.class?.name} {s.class?.section}</p>
                <p className="mt-1 text-sm text-slate-500">{new Date(s.sessionDate).toLocaleDateString()}</p>
                <span className="mt-2 inline-block rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 capitalize">{s.sessionType}</span>
              </div>
            ))}
          </div>

          {/* Attendance Marking */}
          <div className="lg:col-span-2">
            {!selectedSession ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Select a session from the left to mark attendance
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Total', value: summary.total, accent: 'bg-slate-500' },
                    { label: 'Present', value: summary.present, accent: 'bg-emerald-500' },
                    { label: 'Absent', value: summary.absent, accent: 'bg-rose-500' },
                    { label: 'Late', value: summary.late, accent: 'bg-amber-500' },
                    { label: 'Rate', value: `${summary.rate}%`, accent: 'bg-violet-500' },
                  ].map(c => (
                    <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                      <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
                      <p className="mt-1 text-lg font-bold text-slate-900">{c.value}</p>
                      <p className="text-xs text-slate-500">{c.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {['present', 'absent', 'late', 'excused'].map(s => (
                    <button key={s} onClick={() => markAll(s)} className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 capitalize transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                      All {s}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  {loading ? (
                    <div className="flex h-32 items-center justify-center text-slate-500">Loading students...</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Student</th>
                          <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Code</th>
                          <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length === 0 ? (
                          <tr><td colSpan="3" className="p-8 text-center text-slate-500">No students in this class</td></tr>
                        ) : students.map(student => (
                          <tr key={student._id} className="transition-colors duration-150 hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-900">{student.user?.name}</td>
                            <td className="p-4 text-slate-500">{student.studentCode}</td>
                            <td className="p-4">
                              <div className="flex justify-center gap-1">
                                {['present', 'absent', 'late', 'excused'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => setAttendance(prev => ({ ...prev, [student._id]: status }))}
                                    className={`rounded-xl px-2.5 py-1 text-xs font-medium capitalize transition-all duration-150 ${attendance[student._id] === status ? statusColors[status] : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Save */}
      {selectedSession && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-sm text-slate-600">{summary.present} Present • {summary.absent} Absent • {summary.late} Late</p>
            <button onClick={saveAttendance} disabled={saving} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
