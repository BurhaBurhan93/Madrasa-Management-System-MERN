import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import { FiCopy, FiEye, FiEyeOff, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const AdminAPISettings = () => {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [showKey, setShowKey] = useState({});

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/api");
      const d = res.data?.data || {};
      setSettings({
        enableApi: d.enableApi ?? true,
        apiVersion: d.apiVersion || 'v1',
        baseUrl: d.baseUrl || '/api',
        rateLimitEnabled: d.rateLimitEnabled ?? true,
        rateLimitPerMinute: d.rateLimitPerMinute || 60,
        rateLimitPerHour: d.rateLimitPerHour || 1000,
        enableWebhooks: d.enableWebhooks ?? false,
        webhookSecret: d.webhookSecret || '',
        webhookRetryCount: d.webhookRetryCount || 3,
        webhookTimeout: d.webhookTimeout || 5000,
        enableIntegrations: d.enableIntegrations ?? false,
        allowedOrigins: d.allowedOrigins || '*',
        logApiCalls: d.logApiCalls ?? true,
        apiDocsEnabled: d.apiDocsEnabled ?? true,
      });
      setApiKeys(d.apiKeys || [
        { id: '1', name: 'Default App', key: 'sk_live_' + Math.random().toString(36).substring(2, 18), status: 'active', created: new Date().toISOString() },
      ]);
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
      await api.put("/admin/settings/api", { ...settings, apiKeys });
      setMessage('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const generateKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: 'sk_live_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18),
      status: 'active',
      created: new Date().toISOString(),
    };
    setApiKeys(prev => [...prev, newKey]);
  };

  const deleteKey = (id) => {
    if (!window.confirm(t('settings.deleteKeyConfirm'))) return;
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setMessage('copied');
    setTimeout(() => setMessage(null), 2000);
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
        <div><h1 className="text-2xl font-bold text-slate-900">{t('settings.apiManagement')}</h1><p className="mt-1 text-sm text-slate-500">{t('settings.manageApi')}</p></div>
        <div className="flex items-center gap-3">
          {message === 'success' && <span className="text-sm font-medium text-emerald-600">{t('common.saved')}</span>}
          {message === 'copied' && <span className="text-sm font-medium text-emerald-600">{t('settings.copied')}</span>}
          {message === 'error' && <span className="text-sm font-medium text-red-600">{t('common.error')}</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.saveSettings')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.apiConfiguration')}</h2>
          <Field label={t('settings.enableApi')} name="enableApi" type="checkbox" />
          <Field label={t('settings.apiVersion')} name="apiVersion" />
          <Field label={t('settings.baseUrl')} name="baseUrl" />
          <Field label={t('settings.allowedOrigins')} name="allowedOrigins" note={t('settings.allowedOriginsNote')} />
          <Field label={t('settings.logApiCalls')} name="logApiCalls" type="checkbox" />
          <Field label={t('settings.apiDocsEnabled')} name="apiDocsEnabled" type="checkbox" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.rateLimits')}</h2>
          <Field label={t('settings.enableRateLimits')} name="rateLimitEnabled" type="checkbox" />
          <Field label={t('settings.rateLimitPerMinute')} name="rateLimitPerMinute" type="number" />
          <Field label={t('settings.rateLimitPerHour')} name="rateLimitPerHour" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.webhooks')}</h2>
          <Field label={t('settings.enableWebhooks')} name="enableWebhooks" type="checkbox" />
          <Field label={t('settings.webhookSecret')} name="webhookSecret" />
          <Field label={t('settings.webhookRetryCount')} name="webhookRetryCount" type="number" />
          <Field label={t('settings.webhookTimeout')} name="webhookTimeout" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.integrations')}</h2>
          <Field label={t('settings.enableIntegrations')} name="enableIntegrations" type="checkbox" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">{t('settings.apiKeys')}</h2>
          <button onClick={generateKey} className="flex items-center gap-1 bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700"><FiRefreshCw size={14} /> {t('settings.generateKey')}</button>
        </div>
        {apiKeys.length === 0 ? (
          <p className="text-sm text-slate-400">{t('common.noData')}</p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{k.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-200 px-2 py-0.5 rounded font-mono">
                      {showKey[k.id] ? k.key : `${k.key.substring(0, 12)}...${k.key.slice(-4)}`}
                    </code>
                    <button onClick={() => copyToClipboard(k.key)} className="text-slate-400 hover:text-slate-600" title={t('settings.copyKey')}><FiCopy size={14} /></button>
                    <button onClick={() => setShowKey(prev => ({ ...prev, [k.id]: !prev[k.id] }))} className="text-slate-400 hover:text-slate-600">
                      {showKey[k.id] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{k.status}</span>
                  <button onClick={() => deleteKey(k.id)} className="text-red-400 hover:text-red-600" title={t('common.delete')}><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAPISettings;
