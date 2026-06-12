import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-01:00', '01:00-02:00', '02:00-03:00'];

const AdminTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', period: '08:00-09:00', subject: '', teacher: '', room: '' });

  const fetchClasses = async () => {
    try { const { data } = await api.get('/academic/classes'); setClasses(Array.isArray(data) ? data : data.data || []); } catch { setClasses([]); }
  };

  const fetchTimetable = async () => {
    if (!selectedClass) { setTimetable([]); setLoading(false); return; }
    try { const { data } = await api.get(`/academic/timetable?classId=${selectedClass}`); setTimetable(Array.isArray(data) ? data : data.data || []); }
    catch { setTimetable([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchTimetable(); }, [selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academic/timetable', { ...form, classId: selectedClass });
      setShowForm(false); fetchTimetable();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this slot?')) return;
    try { await api.delete(`/academic/timetable/${id}`); fetchTimetable(); } catch (err) { console.error(err); }
  };

  const getSlot = (day, period) => timetable.find(s => s.day === day && s.period === period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage weekly class schedules and period assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {selectedClass && (
            <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
              {showForm ? 'Cancel' : '+ Add Slot'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Day</label><select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{DAYS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Period</label><select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{PERIODS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Teacher</label><input value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Room</label><input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">Add Slot</button>
        </form>
      )}

      {!selectedClass ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
          <div className="text-5xl">📅</div>
          <h2 className="text-xl font-semibold text-slate-700">Select a Class</h2>
          <p className="text-sm">Choose a class from the dropdown to view or manage its timetable.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className="px-4 py-3 font-semibold text-slate-600">Period</th>{DAYS.map(d => <th key={d} className="px-4 py-3 text-center font-semibold text-slate-600">{d}</th>)}</tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{period}</td>
                  {DAYS.map(day => {
                    const slot = getSlot(day, period);
                    return (
                      <td key={day} className="px-3 py-2 text-center">
                        {slot ? (
                          <div className="group relative rounded-lg bg-cyan-50 p-2">
                            <p className="text-xs font-semibold text-cyan-800">{slot.subject}</p>
                            <p className="text-[10px] text-cyan-600">{slot.teacher}</p>
                            <p className="text-[10px] text-slate-400">{slot.room}</p>
                            <button onClick={() => handleDelete(slot._id)} className="absolute -right-1 -top-1 hidden rounded-full bg-rose-500 px-1.5 text-[10px] text-white group-hover:block">×</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTimetable;
