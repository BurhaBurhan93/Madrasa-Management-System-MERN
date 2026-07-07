import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import Card from '../../../components/UIHelper/Card';
import { FiSettings, FiSave, FiGlobe, FiCalendar, FiClock, FiDollarSign, FiBell, FiShield, FiDatabase } from 'react-icons/fi';

const AdminGeneralSettings = () => {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('institution');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/madrasa-info");
      const data = res.data?.data || res.data || {};
      setSettings({
        institutionName: data.institutionName || 'Madrasa Education System',
        institutionCode: data.institutionCode || 'MES-2024',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        academicYear: data.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        semesterStart: data.semesterStart || '',
        semesterEnd: data.semesterEnd || '',
        classDuration: data.classDuration || '45',
        maxStudentsPerClass: data.maxStudentsPerClass || '30',
        currency: data.currency || 'PKR',
        currencySymbol: data.currencySymbol || 'Rs.',
        taxRate: data.taxRate || '0',
        lateFeePercentage: data.lateFeePercentage || '5',
        gracePeriodDays: data.gracePeriodDays || '7',
        timezone: data.timezone || 'Asia/Karachi',
        dateFormat: data.dateFormat || 'DD/MM/YYYY',
        language: data.language || 'en',
        maintenanceMode: data.maintenanceMode || false,
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
        notificationSound: data.notificationSound ?? true,
        minPasswordLength: data.minPasswordLength || '8',
        passwordExpiryDays: data.passwordExpiryDays || '90',
        sessionTimeout: data.sessionTimeout || '30',
        maxLoginAttempts: data.maxLoginAttempts || '5',
      });
    } catch (e) {
      console.error('Failed to load settings', e);
      setMessage({ type: 'error', text: t('common.failedToLoad') });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/admin/madrasa-info", settings);
      setMessage({ type: 'success', text: t('settings.settingsSaved') });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: t('settings.errorSavingSettings') });
    } finally {
      setSaving(false);
    }
  };

  const SettingSection = ({ title, icon, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">{children}</div>
    </div>
  );

  const Field = ({ label, name, type = 'text', placeholder, options, note }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {type === 'select' ? (
        <select name={name} value={settings?.[name] || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input type="checkbox" name={name} checked={!!settings?.[name]} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
          <span className="ml-2 text-sm text-gray-700">{t('settings.enableLabel', { label })}</span>
        </div>
      ) : (
        <input type={type} name={name} value={settings?.[name] || ''} onChange={handleChange} placeholder={placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
      )}
      {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
    </div>
  );

  const tabs = [
    { id: 'institution', label: t('settings.institution'), icon: <FiGlobe size={18} /> },
    { id: 'academic', label: t('settings.academic'), icon: <FiCalendar size={18} /> },
    { id: 'financial', label: t('settings.financial'), icon: <FiDollarSign size={18} /> },
    { id: 'system', label: t('settings.system'), icon: <FiSettings size={18} /> },
    { id: 'notifications', label: t('settings.notificationSettings'), icon: <FiBell size={18} /> },
    { id: 'security', label: t('settings.securitySettings'), icon: <FiShield size={18} /> },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">{t('common.loading')}</p></div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.systemSettings')}</h1>
          <p className="text-gray-600 mt-1">{t('settings.configureAllSettings')}</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg disabled:opacity-50">
            <FiSave size={18} /> {saving ? t('common.saving') : t('common.saveSettings')}
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'institution' && (
            <SettingSection title={t('settings.institutionSettings')} icon={<FiGlobe size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('settings.institutionName')} name="institutionName" />
                <Field label={t('settings.institutionCode')} name="institutionCode" />
                <Field label={t('common.address')} name="address" />
                <Field label={t('common.phoneNumber')} name="phone" type="tel" />
                <Field label={t('common.emailAddress')} name="email" type="email" />
                <Field label={t('common.website')} name="website" type="url" />
              </div>
            </SettingSection>
          )}

          {activeTab === 'academic' && (
            <SettingSection title={t('settings.academicSettings')} icon={<FiCalendar size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('settings.academicYear')} name="academicYear" />
                <Field label={t('settings.semesterStartDate')} name="semesterStart" type="date" />
                <Field label={t('settings.semesterEndDate')} name="semesterEnd" type="date" />
                <Field label={t('settings.classDuration')} name="classDuration" type="number" />
                <Field label={t('settings.maxStudentsPerClass')} name="maxStudentsPerClass" type="number" />
              </div>
            </SettingSection>
          )}

          {activeTab === 'financial' && (
            <SettingSection title={t('settings.financialSettings')} icon={<FiDollarSign size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('settings.currency')} name="currency" type="select" options={[
                  { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
                  { value: 'USD', label: 'US Dollar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                ]} />
                <Field label={t('settings.currencySymbol')} name="currencySymbol" />
                <Field label={t('settings.taxRate')} name="taxRate" type="number" note={t('common.setToZeroNoTax')} />
                <Field label={t('settings.lateFeePercentage')} name="lateFeePercentage" type="number" />
                <Field label={t('settings.gracePeriod')} name="gracePeriodDays" type="number" />
              </div>
            </SettingSection>
          )}

          {activeTab === 'system' && (
            <SettingSection title={t('settings.systemSettingsSection')} icon={<FiSettings size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('settings.timezone')} name="timezone" type="select" options={[
                  { value: 'Asia/Karachi', label: 'Asia/Karachi (Pakistan)' },
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'America/New_York' },
                  { value: 'Europe/London', label: 'Europe/London' },
                ]} />
                <Field label={t('settings.dateFormat')} name="dateFormat" type="select" options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]} />
                <Field label={t('settings.language')} name="language" type="select" options={[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'Urdu' },
                  { value: 'ar', label: 'Arabic' },
                ]} />
                <Field label={t('settings.maintenanceMode')} name="maintenanceMode" type="checkbox" />
              </div>
            </SettingSection>
          )}

          {activeTab === 'notifications' && (
            <SettingSection title={t('settings.notificationSettings')} icon={<FiBell size={20} />}>
              <div className="space-y-4">
                <Field label={t('settings.emailNotifications')} name="emailNotifications" type="checkbox" note={t('settings.sendEmailNotifications')} />
                <Field label={t('settings.smsNotifications')} name="smsNotifications" type="checkbox" note={t('settings.sendSmsNotifications')} />
                <Field label={t('settings.pushNotifications')} name="pushNotifications" type="checkbox" note={t('settings.sendPushNotifications')} />
                <Field label={t('common.notificationSound')} name="notificationSound" type="checkbox" note={t('common.playSoundNotifications')} />
              </div>
            </SettingSection>
          )}

          {activeTab === 'security' && (
            <SettingSection title={t('settings.securitySettings')} icon={<FiShield size={20} />}>
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">{t('settings.securityRecommendations')}</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>{t('settings.recTwoFactorAuth')}</li>
                    <li>{t('settings.recUpdatePasswords')}</li>
                    <li>{t('settings.recReviewPermissions')}</li>
                    <li>{t('settings.recUpdateSoftware')}</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t('settings.passwordPolicy')}</h4>
                    <div className="space-y-3">
                      <Field label={t('settings.minPasswordLength')} name="minPasswordLength" type="number" />
                      <Field label={t('settings.passwordExpiryDays')} name="passwordExpiryDays" type="number" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t('settings.sessionManagement')}</h4>
                    <div className="space-y-3">
                      <Field label={t('settings.sessionTimeout')} name="sessionTimeout" type="number" />
                      <Field label={t('settings.maxLoginAttempts')} name="maxLoginAttempts" type="number" />
                    </div>
                  </div>
                </div>
              </div>
            </SettingSection>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><FiDatabase size={20} /></div><div><p className="text-sm text-gray-500">{t('settings.databaseStatus')}</p><p className="font-semibold text-gray-900">{t('common.connected')}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><FiSettings size={20} /></div><div><p className="text-sm text-gray-500">{t('settings.systemVersion')}</p><p className="font-semibold text-gray-900">v2.1.0</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><FiClock size={20} /></div><div><p className="text-sm text-gray-500">{t('common.uptime')}</p><p className="font-semibold text-gray-900">99.8%</p></div></div></Card>
      </div>
    </div>
  );
};

export default AdminGeneralSettings;
