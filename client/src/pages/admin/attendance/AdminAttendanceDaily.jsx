import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import { FiCalendar, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiDownload, FiX, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiUser } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_COLORS = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-yellow-500',
  'half-day': 'bg-orange-500',
  'on-leave': 'bg-purple-500',
};

const AdminAttendanceDaily = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTakeAttendance, setShowTakeAttendance] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [employeeRecords, setEmployeeRecords] = useState([]);
  const [empRecordsLoading, setEmpRecordsLoading] = useState(false);
  const [empViewMode, setEmpViewMode] = useState('calendar');
  const { t } = useTranslation('admin');

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/date/${selectedDate}`);
      setAttendance(Array.isArray(data) ? data : data.data || []);
    } catch { setAttendance([]); } finally { setLoading(false); }
  }, [selectedDate]);

  const fetchAllEmployees = useCallback(async () => {
    try {
      const res = await api.get('/hr/employees?status=active');
      setEmployees(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); fetchAllEmployees(); }, [fetchData, fetchAllEmployees]);

  const fetchEmployeeRecords = useCallback(async () => {
    if (!selectedEmployee) return;
    setEmpRecordsLoading(true);
    try {
      const { data } = await api.get(`/attendance/employee/${selectedEmployee}?month=${calendarMonth + 1}&year=${calendarYear}`);
      setEmployeeRecords(Array.isArray(data) ? data : data.data || []);
    } catch { setEmployeeRecords([]); } finally { setEmpRecordsLoading(false); }
  }, [selectedEmployee, calendarMonth, calendarYear]);

  useEffect(() => { fetchEmployeeRecords(); }, [fetchEmployeeRecords]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?status=active');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setEmployees(list);
      setAttendanceForm(list.map(emp => {
        const existing = attendance.find(a => a.employee?._id === emp._id);
        return {
          employee: emp._id,
          status: existing?.status || 'present',
          checkIn: existing?.checkIn || '',
          checkOut: existing?.checkOut || '',
          lateMinutes: existing?.lateMinutes || 0,
          remarks: existing?.remarks || '',
        };
      }));
    } catch { setEmployees([]); setAttendanceForm([]); }
  };

  const openTakeAttendance = async () => {
    await fetchEmployees();
    setShowTakeAttendance(true);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/attendance', { date: selectedDate, records: attendanceForm });
      setShowTakeAttendance(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || err.message); } finally { setSaving(false); }
  };

  const updateFormRecord = (index, field, value) => {
    const updated = [...attendanceForm];
    updated[index] = { ...updated[index], [field]: value };
    setAttendanceForm(updated);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageTitle = `${t('attendance.dailyAttendance')} - ${new Date(selectedDate).toLocaleDateString()}`;
    doc.setFontSize(16);
    doc.text(pageTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`${t('attendance.todaysDate')}: ${new Date().toLocaleDateString()}`, 14, 28);
    const rows = attendance.map(r => [
      r.employee?.fullName || '-', r.employee?.employeeCode || '-', r.status || '-',
      r.checkIn || '-', r.checkOut || '-', r.lateMinutes != null ? `${r.lateMinutes}m` : '-', r.remarks || '-',
    ]);
    autoTable(doc, {
      startY: 35,
      head: [[t('attendance.employee'), t('attendance.employeeCode'), t('attendance.status'), t('attendance.checkIn'), t('attendance.checkOut'), t('attendance.lateMinutes'), t('attendance.remarks')]],
      body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [59, 130, 246] },
    });
    const fy = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.text(`${t('attendance.presentToday')}: ${attendance.filter(r => r.status === 'present').length}`, 14, fy + 10);
    doc.text(`${t('attendance.absentToday')}: ${attendance.filter(r => r.status === 'absent').length}`, 14, fy + 18);
    doc.text(`${t('attendance.late')}: ${attendance.filter(r => r.status === 'late').length}`, 14, fy + 26);
    doc.save(`Attendance_${selectedDate}.pdf`);
  };

  const statusBadgeClass = (status) => {
    const map = { present: 'bg-green-100 text-green-800', absent: 'bg-red-100 text-red-800', late: 'bg-yellow-100 text-yellow-800', 'half-day': 'bg-orange-100 text-orange-800', 'on-leave': 'bg-purple-100 text-purple-800' };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAttendance = attendance.filter(r => {
    const n = (r.employee?.fullName || '').toLowerCase();
    const c = (r.employee?.employeeCode || '').toLowerCase();
    return (n.includes(searchTerm.toLowerCase()) || c.includes(searchTerm.toLowerCase())) && (statusFilter === 'all' || r.status === statusFilter);
  });

  const totalPresent = attendance.filter(r => r.status === 'present').length;
  const totalAbsent = attendance.filter(r => r.status === 'absent').length;
  const totalLate = attendance.filter(r => r.status === 'late').length;
  const totalStudents = attendance.length;
  const overallPercentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;

  const selectedEmp = employees.find(e => e._id === selectedEmployee);

  const buildCalendar = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const weeks = [];
    let day = 1;
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        if ((w === 0 && d < firstDay) || day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day++);
        }
      }
      weeks.push(week);
      if (day > daysInMonth) break;
    }
    return weeks;
  };

  const getDayStatus = (day) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rec = employeeRecords.find(r => {
      if (!r.date) return false;
      const d = new Date(r.date);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return ds === dateStr;
    });
    return rec?.status || null;
  };

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };

  const presentCount = employeeRecords.filter(r => r.status === 'present').length;
  const absentCount = employeeRecords.filter(r => r.status === 'absent').length;
  const lateCount = employeeRecords.filter(r => r.status === 'late').length;
  const halfDayCount = employeeRecords.filter(r => r.status === 'half-day').length;
  const leaveCount = employeeRecords.filter(r => r.status === 'on-leave').length;

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  const AttendanceCard = ({ record }) => {
    const pct = record.status === 'present' ? 100 : record.status === 'late' ? 50 : 0;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{record.employee?.fullName || '-'}</h3>
            <p className="text-gray-600">{record.employee?.employeeCode || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('attendance.attendanceRate')}</p>
            <p className={`text-2xl font-bold ${record.status === 'present' ? 'text-green-600' : record.status === 'late' ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</p>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {record.status === 'present' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
            </div>
            <div><p className="text-sm text-gray-500">{t('attendance.status')}</p><p className="font-semibold capitalize text-gray-900">{record.status}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><FiClock size={20} /></div>
            <div><p className="text-sm text-gray-500">{t('attendance.checkIn')}</p><p className="font-semibold text-gray-900">{record.checkIn || '-'}</p></div>
          </div>
        </div>
        {record.remarks && <p className="mb-2 text-sm text-gray-500">{t('attendance.remarks')}: {record.remarks}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance.dailyAttendance')}</h1>
          <p className="mt-1 text-gray-600">{t('attendance.manageDailyAttendance')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-300"><FiDownload size={18} /> {t('attendance.exportReport')}</button>
          <button onClick={openTakeAttendance} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800">{t('attendance.takeAttendance')}</button>
        </div>
      </div>

      {showTakeAttendance && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" onClick={() => setShowTakeAttendance(false)}>
          <div className="flex min-h-0 flex-1 flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">{t('attendance.takeAttendance')} - {selectedDate}</h2>
              <button onClick={() => setShowTakeAttendance(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleAttendanceSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-auto px-6 py-4">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.employee')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.status')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.checkIn')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.checkOut')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.lateMinutes')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('attendance.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceForm.map((rec, i) => (
                      <tr key={rec.employee} className="border-t border-gray-100">
                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-800">{employees.find(e => e._id === rec.employee)?.fullName || '-'}</td>
                        <td className="px-4 py-2">
                          <select value={rec.status} onChange={e => updateFormRecord(i, 'status', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs">
                            <option value="present">{t('attendance.present')}</option>
                            <option value="absent">{t('attendance.absent')}</option>
                            <option value="late">{t('attendance.late')}</option>
                            <option value="half-day">{t('attendance.halfDay')}</option>
                            <option value="on-leave">{t('attendance.onLeave')}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2"><input type="time" value={rec.checkIn} onChange={e => updateFormRecord(i, 'checkIn', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs" /></td>
                        <td className="px-4 py-2"><input type="time" value={rec.checkOut} onChange={e => updateFormRecord(i, 'checkOut', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs" /></td>
                        <td className="px-4 py-2"><input type="number" min="0" value={rec.lateMinutes} onChange={e => updateFormRecord(i, 'lateMinutes', Number(e.target.value))} className="w-20 rounded border border-gray-300 px-2 py-1 text-xs" /></td>
                        <td className="px-4 py-2">
                          <select value={rec.remarks} onChange={e => updateFormRecord(i, 'remarks', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs">
                            <option value="">--</option>
                            <option value="On Time">{t('attendance.remarkOnTime')}</option>
                            <option value="Late Due to Traffic">{t('attendance.remarkLateTraffic')}</option>
                            <option value="Late (Personal Reason)">{t('attendance.remarkLatePersonal')}</option>
                            <option value="Medical Appointment">{t('attendance.remarkMedical')}</option>
                            <option value="Emergency">{t('attendance.remarkEmergency')}</option>
                            <option value="Personal Leave">{t('attendance.remarkPersonalLeave')}</option>
                            <option value="Official Duty">{t('attendance.remarkOfficialDuty')}</option>
                            <option value="No Reason Given">{t('attendance.remarkNoReason')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button type="button" onClick={() => setShowTakeAttendance(false)} className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">{t('common.cancel')}</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><FiCalendar size={20} /></div>
            <div><p className="text-sm text-gray-500">{t('attendance.selectedDate')}</p><CalendarDatePicker value={selectedDate} onChange={(d) => setSelectedDate(d)} placeholder={t('attendance.selectDate')} /></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><FiUser size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">{t('attendance.employee')}</p>
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800">
                  <option value="">-- {t('attendance.allEmployees')} --</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeCode || ''})</option>)}
                </select>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('attendance.todaysDate')}</p>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('attendance.presentToday')}</p><p className="text-2xl font-bold">{totalPresent}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiCheckCircle size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('attendance.absentToday')}</p><p className="text-2xl font-bold">{totalAbsent}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiXCircle size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('attendance.late')}</p><p className="text-2xl font-bold">{totalLate}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiClock size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('common.totalEmployees')}</p><p className="text-2xl font-bold">{totalStudents}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiUsers size={24} /></div></div></Card>
      </div>

      {selectedEmployee ? (
        <div className="space-y-6">
          {selectedEmp && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 translate-y-12 rounded-full bg-white/5" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold backdrop-blur-sm">
                    {selectedEmp.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEmp.fullName}</h2>
                    <p className="text-sm text-white/80">{selectedEmp.employeeCode}{selectedEmp.department ? ` | ${selectedEmp.department.departmentName || selectedEmp.department}` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-bold">{presentCount}</p><p className="text-xs text-white/80">{t('attendance.present')}</p></div>
                  <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-bold">{absentCount}</p><p className="text-xs text-white/80">{t('attendance.absent')}</p></div>
                  <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-bold">{lateCount}</p><p className="text-xs text-white/80">{t('attendance.late')}</p></div>
                  <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-bold">{halfDayCount}</p><p className="text-xs text-white/80">{t('attendance.halfDay')}</p></div>
                  <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-bold">{leaveCount}</p><p className="text-xs text-white/80">{t('attendance.onLeave')}</p></div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"><FiChevronLeft size={18} /></button>
                <h3 className="min-w-[200px] text-center text-xl font-bold text-gray-900">{new Date(calendarYear, calendarMonth).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={nextMonth} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"><FiChevronRight size={18} /></button>
              </div>
              <div className="flex overflow-hidden rounded-xl border border-gray-300">
                <button onClick={() => setEmpViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${empViewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><FiGrid size={15} /> {t('academic.grid')}</button>
                <button onClick={() => setEmpViewMode('list')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${empViewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><FiList size={15} /> {t('academic.list')}</button>
              </div>
            </div>

            {empRecordsLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">{t('common.loading')}</div>
            ) : empViewMode === 'calendar' ? (
              <div>
                <div className="mb-3 grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(d => <div key={d} className="py-2 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">{d}</div>)}
                </div>
                {buildCalendar().map((week, wi) => (
                  <div key={wi} className="mb-2 grid grid-cols-7 gap-2">
                    {week.map((day, di) => {
                      if (!day) return <div key={di} />;
                      const status = getDayStatus(day);
                      return (
                        <div key={di} className={`relative flex h-20 flex-col items-center justify-center rounded-xl text-sm font-bold transition-all ${status ? 'text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                          style={status ? { background: status === 'present' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : status === 'absent' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : status === 'late' ? 'linear-gradient(135deg, #eab308, #ca8a04)' : status === 'half-day' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #a855f7, #9333ea)' } : {}}>
                          <span className="text-lg">{day}</span>
                          {status && (
                            <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium capitalize opacity-90">
                              {status === 'present' ? <FiCheckCircle size={10} /> : status === 'absent' ? <FiXCircle size={10} /> : status === 'late' ? <FiClock size={10} /> : status === 'half-day' ? <FiClock size={10} /> : <FiXCircle size={10} />}
                              {status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{background: 'linear-gradient(135deg, #22c55e, #16a34a)'}} /> {t('attendance.present')}</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}} /> {t('attendance.absent')}</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{background: 'linear-gradient(135deg, #eab308, #ca8a04)'}} /> {t('attendance.late')}</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}} /> {t('attendance.halfDay')}</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{background: 'linear-gradient(135deg, #a855f7, #9333ea)'}} /> {t('attendance.onLeave')}</span>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.date')}</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.status')}</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.checkIn')}</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.checkOut')}</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.lateMinutes')}</th>
                      <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeRecords.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">{t('attendance.noRecords')}</td></tr>
                    )}
                    {employeeRecords.map(r => (
                      <tr key={r._id} className="border-t border-gray-100 transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">{r.date ? new Date(r.date).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(r.status)}`}>{r.status === 'present' ? <FiCheckCircle size={12} /> : r.status === 'absent' ? <FiXCircle size={12} /> : r.status === 'late' ? <FiClock size={12} /> : r.status === 'half-day' ? <FiClock size={12} /> : <FiXCircle size={12} />}{r.status}</span></td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{r.checkIn || '-'}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{r.checkOut || '-'}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{r.lateMinutes != null ? <span className="rounded-md bg-orange-50 px-2 py-0.5 text-orange-700">{r.lateMinutes}m</span> : '-'}</td>
                        <td className="max-w-[200px] truncate px-5 py-4 text-gray-600" title={r.remarks}>{r.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder={t('attendance.searchClassTeacher')} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select className="rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">{t('finance.allStatus')}</option>
                  <option value="present">{t('attendance.present')}</option>
                  <option value="absent">{t('attendance.absent')}</option>
                  <option value="late">{t('attendance.late')}</option>
                  <option value="half-day">{t('attendance.halfDay')}</option>
                  <option value="on-leave">{t('attendance.onLeave')}</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAttendance.map(record => <AttendanceCard key={record._id} record={record} />)}
          </div>

          <Card className="mb-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">{t('attendance.dailyAttendance')} - {new Date(selectedDate).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.employee')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.checkIn')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.checkOut')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.lateMinutes')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">{t('attendance.remarks')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {attendance.map(r => (
                    <tr key={r._id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{r.employee?.fullName || '-'}<br /><span className="text-xs text-gray-400">{r.employee?.employeeCode || ''}</span></td>
                      <td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(r.status)}`}>{r.status}</span></td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.checkIn || '-'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.checkOut || '-'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.lateMinutes != null ? `${r.lateMinutes}m` : '-'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-lg font-bold text-gray-900">{t('attendance.attendanceSummary')}</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between"><span className="text-sm text-gray-500">{t('attendance.overallRate')}</span><span className="text-sm font-medium text-gray-900">{overallPercentage}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200"><div className={`h-full rounded-full ${overallPercentage >= 90 ? 'bg-green-500' : overallPercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${overallPercentage}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-600">{totalPresent}</p><p className="text-sm text-green-700">{t('attendance.presentStudents')}</p></div>
                  <div className="rounded-lg bg-red-50 p-4 text-center"><p className="text-2xl font-bold text-red-600">{totalAbsent}</p><p className="text-sm text-red-700">{t('attendance.absentStudents')}</p></div>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="mb-4 text-lg font-bold text-gray-900">{t('attendance.quickActions')}</h3>
              <div className="space-y-3">
                <button className="w-full rounded-lg bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100"><p className="font-medium text-blue-900">{t('attendance.sendAbsenceNotifications')}</p><p className="text-sm text-blue-700">{t('attendance.notifyParents')}</p></button>
                <button className="w-full rounded-lg bg-green-50 p-4 text-left transition-colors hover:bg-green-100"><p className="font-medium text-green-900">{t('attendance.generateMonthlyReport')}</p><p className="text-sm text-green-700">{t('attendance.createReportForMonth')}</p></button>
                <button className="w-full rounded-lg bg-purple-50 p-4 text-left transition-colors hover:bg-purple-100"><p className="font-medium text-purple-900">{t('attendance.viewTrends')}</p><p className="text-sm text-purple-700">{t('attendance.analyzePatterns')}</p></button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAttendanceDaily;