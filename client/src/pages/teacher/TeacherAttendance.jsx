import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = { present: 'bg-green-500 text-white', absent: 'bg-red-500 text-white', late: 'bg-yellow-500 text-white', excused: 'bg-blue-500 text-white' };

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
      if (res.data.success) setSessions(res.data.data);
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

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-24">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-gray-500">Select a session to mark attendance</p>
        </div>
        <Button onClick={() => setShowCreateSession(true)}>+ New Session</Button>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Create Session</h2>
            <select value={sessionForm.class} onChange={e => setSessionForm({ ...sessionForm, class: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Class *</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </select>
            <input type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm({ ...sessionForm, sessionDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
            <select value={sessionForm.sessionType} onChange={e => setSessionForm({ ...sessionForm, sessionType: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="lecture">Lecture</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
            <input type="text" placeholder="Location (optional)" value={sessionForm.location} onChange={e => setSessionForm({ ...sessionForm, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreateSession(false)}>Cancel</Button>
              <Button onClick={createSession}>Create</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Sessions</h2>
          {sessions.length === 0 ? (
            <Card><p className="text-gray-500 text-sm text-center py-4">No sessions yet</p></Card>
          ) : sessions.map(s => (
            <div key={s._id} onClick={() => loadSessionAttendance(s)}
              className={`bg-white rounded-xl shadow p-4 cursor-pointer border-2 transition-all ${selectedSession?._id === s._id ? 'border-green-500' : 'border-transparent hover:border-green-200'}`}>
              <p className="font-semibold">{s.class?.name} {s.class?.section}</p>
              <p className="text-sm text-gray-500">{new Date(s.sessionDate).toLocaleDateString()}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{s.sessionType}</span>
            </div>
          ))}
        </div>

        {/* Attendance Marking */}
        <div className="lg:col-span-2">
          {!selectedSession ? (
            <Card><p className="text-center text-gray-500 py-12">Select a session from the left to mark attendance</p></Card>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Total', value: summary.total, color: 'text-gray-700' },
                  { label: 'Present', value: summary.present, color: 'text-green-600' },
                  { label: 'Absent', value: summary.absent, color: 'text-red-600' },
                  { label: 'Late', value: summary.late, color: 'text-yellow-600' },
                  { label: 'Rate', value: `${summary.rate}%`, color: 'text-purple-600' },
                ].map(c => (
                  <Card key={c.label} className="text-center">
                    <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                    <div className="text-xs text-gray-500">{c.label}</div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {['present', 'absent', 'late', 'excused'].map(s => (
                  <button key={s} onClick={() => markAll(s)} className="px-3 py-1.5 text-xs rounded-lg border hover:bg-gray-50 capitalize font-medium">{`All ${s}`}</button>
                ))}
              </div>

              {/* Table */}
              <Card>
                {loading ? <div className="p-8 text-center text-gray-500">Loading students...</div> : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Student</th>
                        <th className="p-3 text-left">Code</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr><td colSpan="3" className="p-8 text-center text-gray-500">No students in this class</td></tr>
                      ) : students.map(student => (
                        <tr key={student._id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{student.user?.name}</td>
                          <td className="p-3 text-gray-500">{student.studentCode}</td>
                          <td className="p-3">
                            <div className="flex justify-center gap-1">
                              {['present', 'absent', 'late', 'excused'].map(status => (
                                <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [student._id]: status }))}
                                  className={`px-2 py-1 text-xs rounded capitalize ${attendance[student._id] === status ? statusColors[status] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Save */}
      {selectedSession && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center shadow-lg z-10">
          <p className="text-sm text-gray-600">{summary.present} Present • {summary.absent} Absent • {summary.late} Late</p>
          <Button onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</Button>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
