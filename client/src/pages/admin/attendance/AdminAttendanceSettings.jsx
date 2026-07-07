import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiSave, FiCheckCircle, FiClock, FiMail, FiUsers, FiCalendar } from 'react-icons/fi';

const AdminAttendanceSettings = () => {
  const [settings, setSettings] = useState({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    schoolStartTime: '08:00', schoolEndTime: '14:00',
    lateThreshold: 15, absenceThreshold: 3,
    autoNotification: true, notificationEmail: '',
    hrEmail: '', adminEmails: [],
    periodDuration: 45, breakDuration: 15,
    allowManualOverride: true, requireApproval: false,
  });
  const [adminEmailsInput, setAdminEmailsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const { t } = useTranslation('admin');

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/settings');
      if (data?.data) {
        const s = data.data;
        setSettings(prev => ({ ...prev, ...s }));
        setAdminEmailsInput(Array.isArray(s.adminEmails) ? s.adminEmails.join(', ') : '');
      }
    } catch { /* use defaults */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload = {
        ...settings,
        adminEmails: adminEmailsInput.split(',').map(e => e.trim()).filter(Boolean),
      };
      const { data } = await api.put('/attendance/settings', payload);
      if (data?.data) setSettings(prev => ({ ...prev, ...data.data }));
      setSaveMsg('saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('error');
      setTimeout(() => setSaveMsg(''), 3000);
    } finally { setSaving(false); }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: t('attendance.monday'), tuesday: t('attendance.tuesday'),
    wednesday: t('attendance.wednesday'), thursday: t('attendance.thursday'),
    friday: t('attendance.friday'), saturday: t('attendance.saturday'),
    sunday: t('attendance.sunday'),
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-lg text-gray-500">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance.settings')}</h1>
          <p className="mt-1 text-gray-600">{t('attendance.manageSettings')}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg === 'saved' && (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <FiCheckCircle size={16} /> {t('attendance.saved')}
            </span>
          )}
          {saveMsg === 'error' && (
            <span className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
              {t('common.serverError')}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700 disabled:opacity-50">
            <FiSave size={16} /> {saving ? t('common.saving') : t('attendance.saveSettings')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"><FiCalendar size={20} /></div>
            <h2 className="text-lg font-semibold text-gray-800">{t('attendance.workingDays')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  settings.workingDays.includes(day)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {dayLabels[day]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><FiClock size={20} /></div>
            <h2 className="text-lg font-semibold text-gray-800">{t('attendance.schoolHours')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.startTime')}</label>
              <input type="time" value={settings.schoolStartTime}
                onChange={e => setSettings({ ...settings, schoolStartTime: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.endTime')}</label>
              <input type="time" value={settings.schoolEndTime}
                onChange={e => setSettings({ ...settings, schoolEndTime: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.periodDuration')}</label>
              <input type="number" value={settings.periodDuration}
                onChange={e => setSettings({ ...settings, periodDuration: +e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.breakDuration')}</label>
              <input type="number" value={settings.breakDuration}
                onChange={e => setSettings({ ...settings, breakDuration: +e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><FiUsers size={20} /></div>
            <h2 className="text-lg font-semibold text-gray-800">{t('attendance.policies')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.lateThreshold')}</label>
              <input type="number" value={settings.lateThreshold}
                onChange={e => setSettings({ ...settings, lateThreshold: +e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.absenceWarningThreshold')}</label>
              <input type="number" value={settings.absenceThreshold}
                onChange={e => setSettings({ ...settings, absenceThreshold: +e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><FiMail size={20} /></div>
            <h2 className="text-lg font-semibold text-gray-800">{t('attendance.notifications')}</h2>
          </div>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={settings.autoNotification}
                onChange={e => setSettings({ ...settings, autoNotification: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">{t('attendance.autoNotifyOnAbsence')}</span>
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.notificationEmail')}</label>
              <input type="email" value={settings.notificationEmail}
                onChange={e => setSettings({ ...settings, notificationEmail: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder={t('attendance.emailPlaceholder')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.hrEmail')}</label>
              <input type="email" value={settings.hrEmail}
                onChange={e => setSettings({ ...settings, hrEmail: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder={t('attendance.hrEmailPlaceholder')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('attendance.adminEmails')}</label>
              <input type="text" value={adminEmailsInput}
                onChange={e => setAdminEmailsInput(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder={t('attendance.adminEmailsPlaceholder')} />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={settings.allowManualOverride}
                onChange={e => setSettings({ ...settings, allowManualOverride: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">{t('attendance.allowManualOverride')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={settings.requireApproval}
                onChange={e => setSettings({ ...settings, requireApproval: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">{t('attendance.requireApproval')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceSettings;
