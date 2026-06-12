import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAttendanceSettings = () => {
  const [settings, setSettings] = useState({
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    schoolStartTime: '08:00', schoolEndTime: '14:00',
    lateThreshold: 15, absenceThreshold: 3,
    autoNotification: true, notificationEmail: '',
    periodDuration: 45, breakDuration: 15,
    allowManualOverride: true, requireApproval: false,
  });
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try { const { data } = await api.get('/attendance/settings'); if (data?.data) setSettings(prev => ({ ...prev, ...data.data })); } catch {}
  };
  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    try { await api.put('/attendance/settings', settings); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (err) { console.error(err); }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({ ...prev, workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day] }));
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure attendance rules, working hours, and policies</p>
        </div>
        <button onClick={handleSave} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{saved ? '✓ Saved' : 'Save Settings'}</button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Working Days</h2>
          <div className="flex flex-wrap gap-2">{DAYS.map(day => (<button key={day} onClick={() => toggleDay(day)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${settings.workingDays.includes(day) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{day}</button>))}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">School Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Start Time</label><input type="time" value={settings.schoolStartTime} onChange={e => setSettings({ ...settings, schoolStartTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">End Time</label><input type="time" value={settings.schoolEndTime} onChange={e => setSettings({ ...settings, schoolEndTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Period Duration (min)</label><input type="number" value={settings.periodDuration} onChange={e => setSettings({ ...settings, periodDuration: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Break Duration (min)</label><input type="number" value={settings.breakDuration} onChange={e => setSettings({ ...settings, breakDuration: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Policies</h2>
          <div className="space-y-4">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Late Threshold (minutes)</label><input type="number" value={settings.lateThreshold} onChange={e => setSettings({ ...settings, lateThreshold: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Absence Warning Threshold (days)</label><input type="number" value={settings.absenceThreshold} onChange={e => setSettings({ ...settings, absenceThreshold: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.autoNotification} onChange={e => setSettings({ ...settings, autoNotification: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Auto-notify on absence</span></label>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Notification Email</label><input type="email" value={settings.notificationEmail} onChange={e => setSettings({ ...settings, notificationEmail: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="admin@madrasa.edu" /></div>
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.allowManualOverride} onChange={e => setSettings({ ...settings, allowManualOverride: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Allow manual override</span></label>
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.requireApproval} onChange={e => setSettings({ ...settings, requireApproval: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Require approval for corrections</span></label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceSettings;
