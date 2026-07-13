import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FiUser, 
  FiBell, 
  FiLock, 
  FiGlobe, 
  FiMoon, 
  FiSmartphone, 
  FiSave,
  FiShield,
  FiMail,
  FiPhone,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';

const StudentSettings = () => {
  const { t } = useTranslation(['student', 'common']);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: t('student.settings.defaultLanguage'),
    timezone: t('student.settings.defaultTimezone'),
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    examReminders: true,
    darkMode: false,
  });

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE}/student/profile`, config);
      
      const userData = response.data;
      setSettings(prev => ({
        ...prev,
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phone || '',
        language: userData.language || t('student.settings.defaultLanguage'),
        timezone: userData.timezone || t('student.settings.defaultTimezone')
      }));
    } catch (err) {
      console.error('[StudentSettings] Error:', err);
      setError(t('student.settings.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const updateData = {
        name: `${settings.firstName} ${settings.lastName}`.trim(),
        email: settings.email,
        phone: settings.phone,
        language: settings.language,
        timezone: settings.timezone
      };
      
      await axios.put(`${API_BASE}/student/profile`, updateData, config);
      alert(t('student.settings.savedSuccess'));
    } catch (err) {
      console.error('[StudentSettings] Save Error:', err);
      alert(t('student.settings.saveError') + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('student.settings.tab.profile'), icon: <FiUser /> },
    { id: 'notifications', label: t('student.settings.tab.notifications'), icon: <FiBell /> },
    { id: 'security', label: t('student.settings.tab.security'), icon: <FiShield /> },
    { id: 'appearance', label: t('student.settings.tab.appearance'), icon: <FiMoon /> },
  ];

  if (loading && !settings.email) {
    return <PageSkeleton variant="form" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('student.settings.account')}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('student.settings.title')}</h1>
          <p className="text-slate-500 mt-1 font-medium italic">{t('student.settings.subtitle')}</p>
        </div>
        <Button 
          variant="primary" 
          className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
          onClick={handleSave}
          disabled={loading}
        >
          <FiSave /> {loading ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-2 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[32px] text-white shadow-xl shadow-cyan-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">{t('student.settings.needHelp')}</h4>
              <p className="text-cyan-100 text-xs font-medium mb-6 uppercase tracking-widest">{t('student.settings.support247')}</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest transition-all">
                {t('student.settings.contactSupport')}
              </Button>
            </div>
            <FiActivity className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="rounded-[40px] p-10 bg-white border-none shadow-2xl shadow-slate-200/50">
            {activeTab === 'profile' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('student.settings.profileInformation')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('student.settings.profileInfoDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label={t('student.settings.firstName')}
                    value={settings.firstName} 
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                  <Input 
                    label={t('student.settings.lastName')}
                    value={settings.lastName} 
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                  <Input 
                    label={t('student.settings.emailAddress')}
                    type="email"
                    value={settings.email} 
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                  <Input 
                    label={t('student.settings.phoneNumber')}
                    value={settings.phone} 
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                  <Select 
                    label={t('student.settings.language')}
                    value={settings.language} 
                    onChange={(e) => handleChange('language', e.target.value)}
                    options={[
                      { value: 'English', label: t('student.settings.langEnglish') },
                      { value: 'Arabic', label: t('student.settings.langArabic') },
                      { value: 'Urdu', label: t('student.settings.langUrdu') }
                    ]}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                  <Select 
                    label={t('student.settings.timezone')}
                    value={settings.timezone} 
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    options={[
                      { value: 'UTC+4:30', label: t('student.settings.tzKabul') },
                      { value: 'UTC+0', label: t('student.settings.tzLondon') },
                      { value: 'UTC+5', label: t('student.settings.tzIslamabad') }
                    ]}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('student.settings.notifications')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('student.settings.notificationsDesc')}</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'emailNotifications', label: t('student.settings.emailAlerts'), desc: t('student.settings.emailAlertsDesc') },
                    { id: 'pushNotifications', label: t('student.settings.pushNotifications'), desc: t('student.settings.pushNotificationsDesc') },
                    { id: 'assignmentReminders', label: t('student.settings.assignmentReminders'), desc: t('student.settings.assignmentRemindersDesc') },
                    { id: 'examReminders', label: t('student.settings.examNotifications'), desc: t('student.settings.examNotificationsDesc') }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm mb-1">{item.label}</h4>
                        <p className="text-xs font-medium text-slate-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings[item.id]}
                          onChange={(e) => handleChange(item.id, e.target.checked)}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('student.settings.securityPrivacy')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('student.settings.securityDesc')}</p>
                </div>

                <div className="space-y-6">
                  <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-lg font-black mb-2">{t('student.settings.twoFactorAuth')}</h4>
                      <p className="text-slate-400 text-sm font-medium mb-6">{t('student.settings.twoFactorAuthDesc')}</p>
                      <Button variant="primary" className="bg-cyan-600 hover:bg-cyan-700 rounded-2xl px-8 py-3 text-[10px] uppercase tracking-widest font-black">{t('student.settings.enable2FA')}</Button>
                    </div>
                    <FiShield className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 transform rotate-12" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl group-hover:bg-white group-hover:text-slate-900 transition-all">
                          <FiLock />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t('student.settings.changePassword')}</h4>
                          <p className="text-xs font-medium text-slate-400">{t('student.settings.changePasswordDesc')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">{t('student.settings.update')}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl group-hover:bg-white group-hover:text-slate-900 transition-all">
                          <FiSmartphone />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t('student.settings.activeSessions')}</h4>
                          <p className="text-xs font-medium text-slate-400">{t('student.settings.activeSessionsDesc')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">{t('student.settings.viewAll')}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('student.settings.appearance')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('student.settings.appearanceDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => handleChange('darkMode', false)}
                    className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all ${!settings.darkMode ? 'border-slate-900 bg-white shadow-2xl' : 'border-transparent bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video rounded-2xl bg-white border border-slate-100 shadow-sm mb-6 flex flex-col p-4 gap-2">
                      <div className="h-4 w-1/2 bg-slate-100 rounded-full"></div>
                      <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                      <div className="h-12 w-full bg-slate-100 rounded-xl mt-auto"></div>
                    </div>
                    <h4 className="font-black text-slate-900 text-center">{t('student.settings.lightMode')}</h4>
                  </div>

                  <div 
                    onClick={() => handleChange('darkMode', true)}
                    className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all ${settings.darkMode ? 'border-cyan-500 bg-slate-900 shadow-2xl' : 'border-transparent bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video rounded-2xl bg-slate-800 border border-slate-700 shadow-sm mb-6 flex flex-col p-4 gap-2">
                      <div className="h-4 w-1/2 bg-slate-700 rounded-full"></div>
                      <div className="h-4 w-3/4 bg-slate-700 rounded-full"></div>
                      <div className="h-12 w-full bg-slate-700 rounded-xl mt-auto"></div>
                    </div>
                    <h4 className={`font-black text-center ${settings.darkMode ? 'text-white' : 'text-slate-400'}`}>{t('student.settings.darkMode')}</h4>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="flex items-center gap-4 p-8 bg-rose-50 border border-rose-100 rounded-[32px]">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-rose-600 shrink-0">
              <FiAlertCircle />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-rose-900 mb-1">{t('student.settings.dangerZone')}</h4>
              <p className="text-rose-800/70 font-medium text-sm">{t('student.settings.dangerZoneDesc')}</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-100 font-black text-[10px] uppercase tracking-widest px-8">{t('student.settings.deactivate')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
