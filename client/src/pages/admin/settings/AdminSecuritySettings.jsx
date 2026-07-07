import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";

const AdminSecuritySettings = () => {
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
      const res = await api.get("/admin/settings/security");
      const d = res.data?.data || {};
      setSettings({
        enablePasswordPolicy: d.enablePasswordPolicy ?? true,
        minPasswordLength: d.minPasswordLength || 8,
        requireUppercase: d.requireUppercase ?? true,
        requireLowercase: d.requireLowercase ?? true,
        requireNumbers: d.requireNumbers ?? true,
        requireSpecialChars: d.requireSpecialChars ?? false,
        passwordExpiryDays: d.passwordExpiryDays || 90,
        passwordHistoryCount: d.passwordHistoryCount || 5,
        enable2FA: d.enable2FA ?? false,
        twoFAMethod: d.twoFAMethod || 'email',
        enableSessionManagement: d.enableSessionManagement ?? true,
        sessionTimeout: d.sessionTimeout || 30,
        maxConcurrentSessions: d.maxConcurrentSessions || 3,
        maxLoginAttempts: d.maxLoginAttempts || 5,
        lockoutDuration: d.lockoutDuration || 15,
        enableIpRestrictions: d.enableIpRestrictions ?? false,
        allowedIps: d.allowedIps || '',
        enableAuditLogging: d.enableAuditLogging ?? true,
        auditLogRetentionDays: d.auditLogRetentionDays || 365,
        enableDataEncryption: d.enableDataEncryption ?? true,
        encryptionMethod: d.encryptionMethod || 'aes-256',
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
      await api.put("/admin/settings/security", settings);
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
        <div><h1 className="text-2xl font-bold text-slate-900">{t('settings.securitySettings')}</h1><p className="mt-1 text-sm text-slate-500">{t('settings.securitySettingsDesc')}</p></div>
        <div className="flex items-center gap-3">
          {message === 'success' && <span className="text-sm font-medium text-emerald-600">{t('common.saved')}</span>}
          {message === 'error' && <span className="text-sm font-medium text-red-600">{t('common.error')}</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.saveSettings')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.passwordPolicy')}</h2>
          <Field label={t('settings.enablePasswordPolicy')} name="enablePasswordPolicy" type="checkbox" />
          <Field label={t('settings.minPasswordLength')} name="minPasswordLength" type="number" />
          <Field label={t('settings.requireUppercase')} name="requireUppercase" type="checkbox" />
          <Field label={t('settings.requireLowercase')} name="requireLowercase" type="checkbox" />
          <Field label={t('settings.requireNumbers')} name="requireNumbers" type="checkbox" />
          <Field label={t('settings.requireSpecialChars')} name="requireSpecialChars" type="checkbox" />
          <Field label={t('settings.passwordExpiryDays')} name="passwordExpiryDays" type="number" />
          <Field label={t('settings.passwordHistoryCount')} name="passwordHistoryCount" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.twoFactorAuth')}</h2>
          <Field label={t('settings.enableTwoFactorAuth')} name="enable2FA" type="checkbox" />
          <Field label={t('settings.twoFAMethod')} name="twoFAMethod" type="select" options={[{ value: 'email', label: 'Email OTP' }, { value: 'sms', label: 'SMS OTP' }, { value: 'app', label: 'Authenticator App' }]} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.sessionManagement')}</h2>
          <Field label={t('settings.enableSessionManagement')} name="enableSessionManagement" type="checkbox" />
          <Field label={t('settings.sessionTimeout')} name="sessionTimeout" type="number" />
          <Field label={t('settings.maxConcurrentSessions')} name="maxConcurrentSessions" type="number" />
          <Field label={t('settings.maxLoginAttempts')} name="maxLoginAttempts" type="number" />
          <Field label={t('settings.lockoutDuration')} name="lockoutDuration" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.ipRestrictions')}</h2>
          <Field label={t('settings.enableIpRestrictions')} name="enableIpRestrictions" type="checkbox" />
          <Field label={t('settings.allowedIps')} name="allowedIps" note={t('settings.allowedIpsNote')} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.auditLogging')}</h2>
          <Field label={t('settings.enableAuditLogging')} name="enableAuditLogging" type="checkbox" />
          <Field label={t('settings.auditLogRetentionDays')} name="auditLogRetentionDays" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.dataEncryption')}</h2>
          <Field label={t('settings.enableDataEncryption')} name="enableDataEncryption" type="checkbox" />
          <Field label={t('settings.encryptionMethod')} name="encryptionMethod" type="select" options={[{ value: 'aes-256', label: 'AES-256' }, { value: 'aes-128', label: 'AES-128' }, { value: 'rsa-2048', label: 'RSA-2048' }]} />
        </div>
      </div>
    </div>
  );
};

export default AdminSecuritySettings;
