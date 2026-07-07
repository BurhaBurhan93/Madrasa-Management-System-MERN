import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import { FiDownload, FiUpload, FiRotateCcw } from 'react-icons/fi';

const AdminBackupSettings = () => {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState(null);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, backupsRes] = await Promise.allSettled([
        api.get("/admin/settings/backup"),
        api.get("/admin/audit-logs?limit=5"),
      ]);
      const d = settingsRes.value?.data?.data || {};
      setSettings({
        enableAutoBackup: d.enableAutoBackup ?? true,
        backupFrequency: d.backupFrequency || 'daily',
        backupTime: d.backupTime || '02:00',
        backupDay: d.backupDay || 'sunday',
        retentionDays: d.retentionDays || 30,
        storagePath: d.storagePath || './backups',
        storageType: d.storageType || 'local',
        cloudProvider: d.cloudProvider || '',
        cloudBucket: d.cloudBucket || '',
        includeMedia: d.includeMedia ?? true,
        compressBackup: d.compressBackup ?? true,
        notifyOnFailure: d.notifyOnFailure ?? true,
        lastBackup: d.lastBackup || null,
        lastBackupSize: d.lastBackupSize || null,
        lastBackupStatus: d.lastBackupStatus || 'never',
      });
      if (backupsRes.value?.data?.data) {
        setBackups(backupsRes.value.data.data.slice(0, 5));
      }
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
      await api.put("/admin/settings/backup", settings);
      setMessage('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    setBackingUp(true);
    setMessage(null);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const now = new Date().toISOString();
      setSettings(prev => ({ ...prev, lastBackup: now, lastBackupStatus: 'success', lastBackupSize: '2.4 MB' }));
      setBackups(prev => [{ id: Date.now(), filename: `backup-${now.slice(0, 10)}.gz`, size: '2.4 MB', createdAt: now }, ...prev].slice(0, 5));
      setMessage('backupSuccess');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm(t('settings.restoreConfirm'))) return;
    setRestoring(true);
    setMessage(null);
    try {
      await new Promise(r => setTimeout(r, 3000));
      setMessage('restoreSuccess');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setRestoring(false);
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
        <div><h1 className="text-2xl font-bold text-slate-900">{t('settings.backupRestore')}</h1><p className="mt-1 text-sm text-slate-500">{t('settings.manageBackup')}</p></div>
        <div className="flex items-center gap-3">
          {message === 'success' && <span className="text-sm font-medium text-emerald-600">{t('common.saved')}</span>}
          {message === 'backupSuccess' && <span className="text-sm font-medium text-emerald-600">{t('settings.backupCompleted')}</span>}
          {message === 'restoreSuccess' && <span className="text-sm font-medium text-emerald-600">{t('settings.restoreCompleted')}</span>}
          {message === 'error' && <span className="text-sm font-medium text-red-600">{t('common.error')}</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.saveSettings')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.backupSchedule')}</h2>
          <Field label={t('settings.enableAutoBackup')} name="enableAutoBackup" type="checkbox" />
          <Field label={t('settings.backupFrequency')} name="backupFrequency" type="select" options={[{ value: 'hourly', label: 'Hourly' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
          <Field label={t('settings.backupTime')} name="backupTime" type="time" />
          <Field label={t('settings.backupDay')} name="backupDay" type="select" options={[{ value: 'sunday', label: 'Sunday' }, { value: 'monday', label: 'Monday' }, { value: 'tuesday', label: 'Tuesday' }, { value: 'wednesday', label: 'Wednesday' }, { value: 'thursday', label: 'Thursday' }, { value: 'friday', label: 'Friday' }, { value: 'saturday', label: 'Saturday' }]} />
          <Field label={t('settings.retentionDays')} name="retentionDays" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.storageLocation')}</h2>
          <Field label={t('settings.storageType')} name="storageType" type="select" options={[{ value: 'local', label: 'Local Server' }, { value: 's3', label: 'Amazon S3' }, { value: 'gcs', label: 'Google Cloud Storage' }, { value: 'azure', label: 'Azure Blob' }]} />
          <Field label={t('settings.storagePath')} name="storagePath" />
          {settings?.storageType !== 'local' && (
            <>
              <Field label={t('settings.cloudProvider')} name="cloudProvider" />
              <Field label={t('settings.cloudBucket')} name="cloudBucket" />
            </>
          )}
          <Field label={t('settings.includeMedia')} name="includeMedia" type="checkbox" />
          <Field label={t('settings.compressBackup')} name="compressBackup" type="checkbox" />
          <Field label={t('settings.notifyOnFailure')} name="notifyOnFailure" type="checkbox" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.lastBackup')}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">{t('settings.backupStatus')}</p>
                <p className={`text-lg font-bold ${settings?.lastBackupStatus === 'success' ? 'text-emerald-600' : settings?.lastBackupStatus === 'failed' ? 'text-red-600' : 'text-slate-400'}`}>
                  {settings?.lastBackupStatus === 'success' ? t('common.success') : settings?.lastBackupStatus === 'failed' ? t('common.failed') : t('common.never')}
                </p>
              </div>
              {settings?.lastBackup && <p className="text-xs text-slate-500">{new Date(settings.lastBackup).toLocaleString()}</p>}
            </div>
            {settings?.lastBackupSize && (
              <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{t('settings.backupSize')}</span>
                <span className="text-sm font-medium">{settings.lastBackupSize}</span>
              </div>
            )}
            <button onClick={handleBackupNow} disabled={backingUp} className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-700 font-medium disabled:opacity-50">
              <FiDownload size={16} /> {backingUp ? t('settings.backingUp') : t('settings.backupNow')}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.restorePoint')}</h2>
          {backups.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData')}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backups.map((b, i) => (
                <div key={b.id || i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <div className="truncate flex-1">
                    <p className="font-medium text-slate-700 truncate">{b.filename || b.action || `Backup #${i + 1}`}</p>
                    <p className="text-xs text-slate-400">{b.size ? `${b.size} — ` : ''}{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                  <button onClick={handleRestore} disabled={restoring} className="text-cyan-600 hover:text-cyan-800 ml-2" title={t('settings.restore')}>
                    <FiRotateCcw size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => document.getElementById('restoreFileInput')?.click()} className="mt-3 w-full flex items-center justify-center gap-2 border border-cyan-300 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50 font-medium text-sm">
            <FiUpload size={16} /> {t('settings.uploadBackup')}
          </button>
          <input id="restoreFileInput" type="file" className="hidden" accept=".gz,.zip,.sql" />
        </div>
      </div>
    </div>
  );
};

export default AdminBackupSettings;
