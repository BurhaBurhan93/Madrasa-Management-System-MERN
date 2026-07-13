import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiCalendar, FiGrid, FiList } from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-01:00', '01:00-02:00', '02:00-03:00'];

const AdminTimetable = () => {
  const { t } = useTranslation('admin');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [form, setForm] = useState({ day: 'Monday', period: '08:00-09:00', subject: '', teacher: '', room: '' });

  const DAY_ORDER = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5 };
  const sortedSlots = [...timetable].sort((a, b) => (DAY_ORDER[a.day] || 0) - (DAY_ORDER[b.day] || 0) || a.period.localeCompare(b.period));

  const fetchClasses = async () => {
    try { const { data } = await api.get('/academic/classes'); setClasses(Array.isArray(data) ? data : data.data || []); } catch { setClasses([]); }
  };

  const fetchSubjects = async () => {
    try { const res = await api.get('/academic/subjects'); setSubjects(Array.isArray(res.data) ? res.data : res.data?.data || []); } catch { setSubjects([]); }
  };

  const fetchTeachers = async () => {
    try { const res = await api.get('/hr/employees?employeeType=teacher&status=active'); setTeachers(Array.isArray(res.data) ? res.data : res.data?.data || []); } catch { setTeachers([]); }
  };

  const fetchRooms = async () => {
    try { const res = await api.get('/hostel/rooms/available'); setRooms(Array.isArray(res.data) ? res.data : res.data?.data || []); } catch { setRooms([]); }
  };

  const fetchTimetable = async () => {
    if (!selectedClass) { setTimetable([]); setLoading(false); return; }
    try { const { data } = await api.get(`/academic/timetable?classId=${selectedClass}`); setTimetable(Array.isArray(data) ? data : data.data || []); }
    catch { setTimetable([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); fetchSubjects(); fetchTeachers(); fetchRooms(); }, []);
  useEffect(() => { fetchTimetable(); }, [selectedClass]);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academic/timetable', { ...form, classId: selectedClass });
      setShowForm(false); fetchTimetable();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.removeSlotConfirm'))) return;
    try { await api.delete(`/academic/timetable/${id}`); fetchTimetable(); } catch (err) { console.error(err); }
  };

  const getSlot = (day, period) => timetable.find(s => s.day === day && s.period === period);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6"><div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('academic.timetableManagement')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('academic.manageTimetable')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
            <option value="">{t('academic.selectClass')}</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {selectedClass && (
            <>
              <div className="flex overflow-hidden rounded-lg border border-slate-300">
                <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><FiGrid size={14} />{t('academic.grid')}</button>
                <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><FiList size={14} />{t('academic.list')}</button>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
                {showForm ? t('common.cancel') : '+ ' + t('academic.addSlot')}
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.day')}</label><select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{DAYS.map(d => <option key={d}>{t('academic.' + d.toLowerCase())}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.period')}</label><select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{PERIODS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.subject')}</label><select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required><option value="">{t('academic.select')}</option>{subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.teacher')}</label><select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">{t('academic.select')}</option>{teachers.map(t => <option key={t._id} value={t.fullName}>{t.fullName}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.room')}</label><select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">{t('academic.select')}</option>{rooms.map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber}</option>)}</select></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{t('academic.addSlot')}</button>
        </form>
      )}

      {!selectedClass ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
          <div className="text-5xl text-slate-400"><FiCalendar size={48} /></div>
          <h2 className="text-xl font-semibold text-slate-700">{t('academic.selectClass')}</h2>
          <p className="text-sm">{t('academic.selectClassDesc')}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">{t('academic.loading')}</div>
      ) : viewMode === 'grid' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className="px-4 py-3 font-semibold text-slate-600">{t('academic.period')}</th>{DAYS.map(d => <th key={d} className="px-4 py-3 text-center font-semibold text-slate-600">{t('academic.' + d.toLowerCase())}</th>)}</tr>
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
                            <button onClick={() => handleDelete(slot._id)} aria-label={t('common.delete')} className="absolute -right-1 -top-1 hidden rounded-full bg-rose-500 px-1.5 text-[10px] text-white group-hover:block">×</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">{t('common.na')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {sortedSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FiCalendar size={40} />
              <p className="mt-3 text-sm">{t('academic.noSlots')}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.day')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.period')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.subject')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.teacher')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.room')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('academic.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedSlots.map(slot => (
                  <tr key={slot._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{t('academic.' + slot.day.toLowerCase())}</td>
                    <td className="px-4 py-3 text-slate-600">{slot.period}</td>
                    <td className="px-4 py-3 text-slate-700">{slot.subject}</td>
                    <td className="px-4 py-3 text-slate-600">{slot.teacher}</td>
                    <td className="px-4 py-3 text-slate-600">{slot.room}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(slot._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminTimetable;
