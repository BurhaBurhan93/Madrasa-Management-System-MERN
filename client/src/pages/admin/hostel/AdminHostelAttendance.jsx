import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Pagination from '../../../components/UIHelper/Pagination';
import Modal from '../../../components/UIHelper/Modal';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const ATTENDANCE_STATUSES = ['present', 'absent', 'excused'];

const AdminHostelAttendance = () => {
  const { t } = useTranslation('admin');
  const commonT = useTranslation('common').t;

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [mealIdFilter, setMealIdFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [meals, setMeals] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentRooms, setStudentRooms] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ meal: '', student: '', status: 'present', notes: '' });
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchRecords = async (p, mealId, status, date) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (mealId) params.mealId = mealId;
      if (status) params.status = status;
      if (date) params.date = date;
      const { data } = await api.get('/hostel/meal-attendance', { params });
      setRecords(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    const safe = async (fn) => { try { return await fn(); } catch (e) { console.warn(e?.response?.data?.message || e.message); return null; } };
    const [mealsRes, attRes, allocRes, meRes] = await Promise.all([
      safe(() => api.get('/hostel/meals', { params: { limit: 200 } })),
      safe(() => api.get('/hostel/meal-attendance', { params: { limit: 200 } })),
      safe(() => api.get('/hostel/allocations', { params: { limit: 200, status: 'active' } })),
      safe(() => api.get('/auth/me'))
    ]);
    if (mealsRes) setMeals(mealsRes.data.data || []);
    if (attRes) setAllRecords(attRes.data.data || []);
    if (allocRes) {
      const allocations = allocRes.data.data || [];
      const roomMap = {};
      const residentList = [];
      allocations.forEach(a => {
        const s = a.student;
        if (s?._id) {
          residentList.push(s);
          if (a.room?.roomNumber) roomMap[s._id] = a.room;
        }
      });
      setStudents(residentList);
      setStudentRooms(roomMap);
    }
    if (meRes?.data?.user) setCurrentUser(meRes.data.user);
  };

  useEffect(() => {
    fetchRecords(1, '', '', '');
    fetchAll();
  }, []);

  const stats = (() => {
    const total = allRecords.length;
    const present = allRecords.filter(r => r.status === 'present').length;
    const absent = allRecords.filter(r => r.status === 'absent').length;
    const excused = allRecords.filter(r => r.status === 'excused').length;
    return { total, present, absent, excused };
  })();

  const handleDateChange = (date) => {
    setDateFilter(date || '');
    setPage(1);
    fetchRecords(1, mealIdFilter, statusFilter, date || '');
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    fetchRecords(1, mealIdFilter, val, dateFilter);
  };

  const handleMealChange = (val) => {
    setMealIdFilter(val);
    setPage(1);
    fetchRecords(1, val, statusFilter, dateFilter);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchRecords(p, mealIdFilter, statusFilter, dateFilter);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ meal: '', student: '', status: 'present', notes: '' });
    setSelectedMeal(null);
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingId(r._id);
    setForm({
      meal: r.meal?._id || '',
      student: r.student?._id || '',
      status: r.status || 'present',
      notes: r.notes || ''
    });
    setSelectedMeal(r.meal || null);
    setSelectedStudent(r.student || null);
    setModalOpen(true);
  };

  const handleFormMealChange = (id) => {
    setForm({ ...form, meal: id });
    setSelectedMeal(meals.find(m => m._id === id) || null);
  };

  const handleFormStudentChange = (id) => {
    setForm({ ...form, student: id });
    setSelectedStudent(students.find(s => s._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        meal: form.meal,
        student: form.student,
        status: form.status,
        notes: form.notes || undefined
      };
      await api.post('/hostel/meal-attendance', payload);
      setModalOpen(false);
      setEditingId(null);
      fetchRecords(page, mealIdFilter, statusFilter, dateFilter);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      present: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      absent: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
      excused: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    };
    return `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700'}`;
  };

  const mealTypeLabel = (type) => {
    const labels = { breakfast: t('kitchen.breakfast'), lunch: t('kitchen.lunch'), dinner: t('kitchen.dinner'), snack: t('kitchen.snacks') };
    return labels[type] || type || t('common.na');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
  const menuDisplay = (m) => {
    if (!m) return '-';
    if (typeof m === 'string') return m;
    return Object.values(m).filter(Boolean).join(', ') || '-';
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hostel.hostelAttendance')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('hostel.trackHostelAttendance')}</p>
        </div>
        <button onClick={openAddModal} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all">
          + {t('hostel.addAttendance')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('hostel.totalAttendance'), value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { label: t('hostel.present'), value: stats.present, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'M5 13l4 4L19 7' },
          { label: t('hostel.absent'), value: stats.absent, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: 'M6 18L18 6M6 6l12 12' },
          { label: t('hostel.excused'), value: stats.excused, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'M12 9v2m0 4h.01' }
        ].map((card, i) => (
          <div key={i} className={`rounded-2xl border p-5 shadow-sm ${card.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className={`mt-1.5 text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <svg className={`w-8 h-8 ${card.color} opacity-40`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{commonT('date')}</label>
          <CalendarDatePicker value={dateFilter} onChange={handleDateChange} placeholder={t('hostel.selectDate')} />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('kitchen.mealType')}</label>
          <select value={mealIdFilter} onChange={e => handleMealChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100">
            <option value="">{t('hostel.allMealTypes')}</option>
            {meals.map(m => (
              <option key={m._id} value={m._id}>{mealTypeLabel(m.mealType)} - {formatDate(m.date)}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{commonT('status')}</label>
          <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100">
            <option value="">{t('hostel.allStatuses')}</option>
            {ATTENDANCE_STATUSES.map(s => (
              <option key={s} value={s}>{t(`hostel.${s}`)}</option>
            ))}
          </select>
        </div>
        {(dateFilter || mealIdFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(''); setMealIdFilter(''); setStatusFilter(''); fetchRecords(1, '', '', ''); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
            {commonT('clear')}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('hostel.resident')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('hostel.studentId')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('hostel.room')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('kitchen.mealType')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('hostel.menu')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('common.date')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{commonT('status')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{t('common.markedBy')}</th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600">{commonT('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-16"><LoadingSpinner size="lg" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-400">{t('common.noData')}</td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                        {((r.student?.firstName?.[0] || r.student?.name?.[0] || '?')).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{r.student?.firstName && r.student?.lastName ? `${r.student.firstName} ${r.student.lastName}` : r.student?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-500">{r.student?.studentCode || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {r.student?._id && studentRooms[r.student._id] ? `${studentRooms[r.student._id].roomNumber} (${studentRooms[r.student._id].building || ''})` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 capitalize text-slate-600">{r.meal ? mealTypeLabel(r.meal.mealType) : '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={menuDisplay(r.meal?.menu)}>{r.meal ? menuDisplay(r.meal.menu) : '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{r.meal?.date ? formatDate(r.meal.date) : '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className={statusBadge(r.status)}>
                      <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'present' ? 'bg-emerald-500' : r.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {t(`hostel.${r.status}`)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{r.markedBy?.name || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <button onClick={() => openEditModal(r)} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-all">{commonT('edit')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} title={editingId ? commonT('edit') + ' ' + t('hostel.hostelAttendance') : t('hostel.addAttendance')} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('kitchen.mealType')} <span className="text-rose-500">*</span></label>
                <select value={form.meal} onChange={e => handleFormMealChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required>
                  <option value="">{t('hostel.allMealTypes')} ({meals.length})</option>
                  {meals.map(m => {
                    const menuStr = menuDisplay(m.menu);
                    return <option key={m._id} value={m._id}>
                      {mealTypeLabel(m.mealType)} — {formatDate(m.date)}{menuStr !== '-' ? ` (${menuStr})` : ''}
                    </option>;
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('hostel.residentName')} <span className="text-rose-500">*</span></label>
                <select value={form.student} onChange={e => handleFormStudentChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required>
                  <option value="">{t('hostel.resident')}... ({students.length})</option>
                  {students.map(s => {
                    const roomInfo = studentRooms[s._id];
                    return <option key={s._id} value={s._id}>
                      {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} — {s.studentCode || s._id.slice(-6)}{roomInfo ? ` [${t('hostel.room')} ${roomInfo.roomNumber}]` : ''}
                    </option>;
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{commonT('status')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {ATTENDANCE_STATUSES.map(s => {
                    const activeColors = { present: 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', absent: 'border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-200', excused: 'border-amber-300 bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
                    const icons = { present: 'M5 13l4 4L19 7', absent: 'M6 18L18 6M6 6l12 12', excused: 'M12 9v2m0 4h.01' };
                    return (
                      <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${form.status === s ? activeColors[s] : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[s]} />
                        </svg>
                        {t(`hostel.${s}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('hostel.notes')}</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder={t('common.optionalNotes') || 'Optional notes...'} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{commonT('details')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                      {selectedStudent ? (selectedStudent.name?.[0] || selectedStudent.firstName?.[0] || '?').toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{selectedStudent ? (selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()) : t('hostel.resident')}</p>
                      <p className="text-xs text-slate-500">{selectedStudent?.studentCode || '—'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">{t('hostel.room')}:</span>
                        <p className="font-medium text-slate-800">{selectedStudent?._id && studentRooms[selectedStudent._id] ? `${studentRooms[selectedStudent._id].roomNumber} (${studentRooms[selectedStudent._id].building || ''})` : '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t('hostel.roomType')}:</span>
                        <p className="font-medium text-slate-800 capitalize">{selectedStudent?._id && studentRooms[selectedStudent._id] ? (studentRooms[selectedStudent._id].roomType || '—') : '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">{t('kitchen.mealType')}:</span>
                        <p className="font-medium text-slate-800 capitalize">{selectedMeal ? mealTypeLabel(selectedMeal.mealType) : '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t('common.date')}:</span>
                        <p className="font-medium text-slate-800">{selectedMeal ? formatDate(selectedMeal.date) : '—'}</p>
                      </div>
                    </div>
                    {selectedMeal && (
                      <div className="mt-2 text-xs">
                        <span className="text-slate-500">{t('hostel.menu')}:</span>
                        <p className="font-medium text-slate-800">{menuDisplay(selectedMeal.menu)}</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-xs">
                      <span className="text-slate-500">{commonT('status')}:</span>
                      <div className="mt-1">
                        <span className={statusBadge(form.status)}>
                          <span className={`h-1.5 w-1.5 rounded-full ${form.status === 'present' ? 'bg-emerald-500' : form.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          {t(`hostel.${form.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-xs">
                      <span className="text-slate-500">{t('common.markedBy')}:</span>
                      <p className="mt-0.5 font-medium text-slate-800">
                        {editingId && selectedStudent ? (selectedStudent.markedBy?.name || currentUser?.name || '—') : (currentUser?.name || '—')}
                        {!editingId && currentUser ? t('common.youSuffix') || ' (you)' : ''}
                      </p>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <span className="text-slate-500">{t('common.time')}:</span>
                      <p className="mt-0.5 font-medium text-slate-800">{editingId ? formatTime(new Date()) : t('common.now') || 'Now'}</p>
                    </div>
                  </div>
                  {form.notes && (
                    <div className="border-t border-slate-200 pt-3">
                      <div className="text-xs">
                        <span className="text-slate-500">{t('hostel.notes')}:</span>
                        <p className="mt-0.5 font-medium text-slate-800">{form.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">{commonT('cancel')}</button>
            <button type="submit" className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200">{editingId ? commonT('update') : t('hostel.addAttendance')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHostelAttendance;
