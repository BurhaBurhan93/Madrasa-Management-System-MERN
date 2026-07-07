import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { readStoredLanguage } from '../../lib/languageStorage';
import Card from '../../components/UIHelper/Card';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit2, FiSave, FiX, FiBriefcase } from 'react-icons/fi';
import { getUser } from '../../lib/auth';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-orange-100 text-orange-800',
};

const AdminProfile = () => {
  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/me');
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        setProfile(data.user);
        setFormData(data.user);
      } else {
        const stored = getUser();
        if (stored) { setProfile(stored); setFormData(stored); }
      }
    } catch {
      const stored = getUser();
      if (stored) { setProfile(stored); setFormData(stored); }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.phone }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        setProfile(prev => ({ ...prev, ...formData }));
        setIsEditing(false);
      } else {
        setError(data.message || t('profile.failedToSave'));
      }
    } catch {
      setError(t('profile.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setFormData({ ...profile }); setIsEditing(false); setError(''); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">{t('profile.noProfileData')}</div>;
  }

  const avatarSrc = profile.photo || profile.image;
  const displayName = profile.fullName || profile.name || '—';
  const role = profile.role;

  const InfoRow = ({ icon, label, value, field, type = 'text' }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {isEditing && field ? (
          <input
            type={type}
            value={formData[field] || ''}
            onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <p className="mt-0.5 font-medium text-gray-900 truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg disabled:opacity-50">
                <FiSave size={18} /> {saving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
              <button onClick={handleCancel} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">
                <FiX size={18} /> {t('profile.cancel')}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg">
              <FiEdit2 size={18} /> {t('profile.editProfile')}
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold border-4 border-white shadow-lg ${avatarSrc ? 'hidden' : 'flex'}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-800'}`}>
                    {role}
                  </span>
                  {profile.employeeType && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full capitalize">
                      {profile.employeeType}
                    </span>
                  )}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
{profile.status || t('users.active')}
                  </span>
                  {profile.employeeId && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {t('common.id')}: {profile.employeeId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-0">
              <InfoRow icon={<FiUser size={18} />} label={t('profile.fullName')} value={displayName} field="name" />
              <InfoRow icon={<FiMail size={18} />} label={t('profile.emailAddress')} value={profile.email} />
              <InfoRow icon={<FiPhone size={18} />} label={t('profile.phoneNumber')} value={profile.phoneNumber || profile.phone} field="phone" type="tel" />
              <InfoRow icon={<FiShield size={18} />} label={t('profile.systemRole')} value={role?.charAt(0).toUpperCase() + role?.slice(1)} />
              {profile.department && <InfoRow icon={<FiBriefcase size={18} />} label={t('profile.department')} value={profile.department} />}
              {profile.designation && <InfoRow icon={<FiBriefcase size={18} />} label={t('profile.designation')} value={profile.designation} />}
              {profile.joinDate && <InfoRow icon={<FiCalendar size={18} />} label={t('profile.joinDate')} value={new Date(profile.joinDate).toLocaleDateString()} />}
              {profile.currentAddress && <InfoRow icon={<FiMapPin size={18} />} label={t('profile.address')} value={profile.currentAddress} />}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('profile.accountInfo')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t('profile.role')}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>
              </div>
              {profile.employeeType && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{t('profile.type')}</span>
                  <span className="font-medium capitalize">{profile.employeeType}</span>
                </div>
              )}
              {profile.employeeId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{t('profile.employeeId')}</span>
                  <span className="font-medium">{profile.employeeId}</span>
                </div>
              )}
              {profile.department && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{t('profile.department')}</span>
                  <span className="font-medium">{profile.department}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t('profile.status')}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {profile.status || t('users.active')}
                </span>
              </div>
              {profile.staffModules?.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-2">{t('profile.accessModules')}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.staffModules.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs capitalize">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
