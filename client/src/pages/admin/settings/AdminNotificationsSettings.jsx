import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";

const AdminNotificationsSettings = () => {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/notifications");
      const d = res.data?.data || {};
      setSettings({
        enableEmail: d.enableEmail ?? true,
        smtpHost: d.smtpHost || '',
        smtpPort: d.smtpPort || '587',
        smtpUser: d.smtpUser || '',
        smtpPass: d.smtpPass || '',
        fromEmail: d.fromEmail || 'noreply@madrasa.edu',
        enableSms: d.enableSms ?? false,
        smsProvider: d.smsProvider || 'twilio',
        smsApiKey: d.smsApiKey || '',
        smsSenderId: d.smsSenderId || '',
        enablePush: d.enablePush ?? true,
        pushProvider: d.pushProvider || 'firebase',
        pushApiKey: d.pushApiKey || '',
        enableWhatsApp: d.enableWhatsApp ?? false,
        whatsAppBusinessId: d.whatsAppBusinessId || '',
        enableAlertRules: d.enableAlertRules ?? true,
        alertAbsentThreshold: d.alertAbsentThreshold || 3,
        alertFeeDueDays: d.alertFeeDueDays || 7,
        alertExamReminderDays: d.alertExamReminderDays || 2,
        notificationSound: d.notificationSound ?? true,
        quietHoursStart: d.quietHoursStart || '22:00',
        quietHoursEnd: d.quietHoursEnd || '07:00',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/admin/settings/notifications", settings);
      setMessage('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, options, note }) => (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {type === 'select' ? (
        <select name={name} value={settings?.[name] || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-3"><input type="checkbox" name={name} checked={!!settings?.[name]} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">{note || label}</span></label>
      ) : (
        <input type={type} name={name} value={settings?.[name] || ''} onChange={handleChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">{t('common.loading')}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">{t('settings.notificationSettings')}</h1><p className="mt-1 text-sm text-slate-500">{t('settings.configureNotifications')}</p></div>
        <div className="flex items-center gap-3">
          {message === 'success' && <span className="text-sm font-medium text-emerald-600">{t('common.saved')}</span>}
          {message === 'error' && <span className="text-sm font-medium text-red-600">{t('common.error')}</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.saveSettings')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.emailNotifications')}</h2>
          <Field label={t('settings.enableEmailNotifications')} name="enableEmail" type="checkbox" />
          <Field label={t('settings.smtpHost')} name="smtpHost" />
          <Field label={t('settings.smtpPort')} name="smtpPort" />
          <Field label={t('settings.smtpUser')} name="smtpUser" />
          <Field label={t('settings.smtpPassword')} name="smtpPass" type="password" />
          <Field label={t('common.emailAddress')} name="fromEmail" type="email" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.smsNotifications')}</h2>
          <Field label={t('settings.enableSmsNotifications')} name="enableSms" type="checkbox" />
          <Field label={t('settings.smsProvider')} name="smsProvider" type="select" options={[{ value: 'twilio', label: t('settings.smsTwilio') }, { value: 'nexmo', label: t('settings.smsVonage') }, { value: 'plivo', label: t('settings.smsPlivo') }]} />
          <Field label={t('settings.apiKey')} name="smsApiKey" />
          <Field label={t('settings.smsSenderId')} name="smsSenderId" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.pushNotifications')}</h2>
          <Field label={t('settings.enablePushNotifications')} name="enablePush" type="checkbox" />
          <Field label={t('settings.pushProvider')} name="pushProvider" type="select" options={[{ value: 'firebase', label: t('settings.pushFcm') }, { value: 'onesignal', label: t('settings.pushOneSignal') }]} />
          <Field label={t('settings.apiKey')} name="pushApiKey" />
          <Field label={t('settings.enableWhatsApp')} name="enableWhatsApp" type="checkbox" />
          <Field label={t('settings.whatsappBusinessId')} name="whatsAppBusinessId" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.alertRules')}</h2>
          <Field label={t('settings.enableAlertRules')} name="enableAlertRules" type="checkbox" />
          <Field label={t('settings.alertAbsentThreshold')} name="alertAbsentThreshold" type="number" />
          <Field label={t('settings.alertFeeDueDays')} name="alertFeeDueDays" type="number" />
          <Field label={t('settings.alertExamReminderDays')} name="alertExamReminderDays" type="number" />
          <Field label={t('common.notificationSound')} name="notificationSound" type="checkbox" />
          <Field label={t('settings.quietHoursStart')} name="quietHoursStart" type="time" />
          <Field label={t('settings.quietHoursEnd')} name="quietHoursEnd" type="time" />
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsSettings;
