import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit3, FiCheckCircle, FiHash, FiBriefcase, FiAward } from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';

const StudentProfile = () => {
  const { t } = useTranslation(['student', 'common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/student/profile');
      const data = await parseJsonSafe(res);
      if (res.ok) {
        setProfile(data);
      } else {
        setError(data.message || t('student.profile.loadFailed'));
      }
    } catch (err) {
      setError(t('student.profile.loadFailedRetry'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSkeleton variant="form" />;

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || t('student.profile.notFound')}</p>
        <button onClick={fetchProfile} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">{t('common.retry')}</button>
      </div>
    );
  }

  const avatarSrc = profile.image;
  const displayName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || t('common.na');
  const addressStr = (addr) => addr ? [addr.province, addr.district, addr.village].filter(Boolean).join(', ') || t('common.na') : t('common.na');

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-600 mb-1">{t('student.profile.personal')}</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('student.profile.title')}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t('student.profile.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/student/complaints')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <FiEdit3 size={14} /> {t('student.profile.requestDataChange')}
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
          <FiShield size={22} />
        </div>
        <div>
          <h3 className="font-black text-blue-900 mb-1">{t('student.profile.institutionalVerification')}</h3>
          <p className="text-blue-800/80 text-sm leading-relaxed">
            {t('student.profile.verificationBanner')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Summary Card */}
        <div className="space-y-6">
          <Card className="rounded-[32px] p-8 text-center shadow-xl shadow-slate-100 border-none">
            {/* Avatar */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="w-full h-full rounded-[40px] bg-gradient-to-tr from-cyan-400 to-blue-600 p-1 shadow-xl">
                <div className="w-full h-full rounded-[36px] bg-white overflow-hidden flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <span className={`text-4xl font-black text-slate-900 ${avatarSrc ? 'hidden' : 'flex'}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center shadow">
                <FiCheckCircle className="text-white" size={16} />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 mb-1">{displayName}</h2>

            {/* Role badge */}
            <div className="flex justify-center mb-2">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full uppercase tracking-wide capitalize">
                {profile.role || t('common.student')}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{profile.studentCode || t('common.na')}</p>

            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">{t('common.status')}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {(profile.status || 'active').toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">{t('common.class')}</span>
                <span className="font-black text-slate-900">{profile.currentClass || t('common.na')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">{t('common.level')}</span>
                <span className="font-black text-slate-900">{profile.currentLevel || t('common.na')}</span>
              </div>
              {profile.admissionDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">{t('student.profile.admitted')}</span>
                  <span className="font-black text-slate-900">{new Date(profile.admissionDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Contact */}
          <Card className="rounded-[28px] p-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">{t('student.profile.contact')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0"><FiMail size={16} /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{t('common.email')}</p><p className="font-black text-slate-900 text-sm">{profile.email || t('common.na')}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><FiPhone size={16} /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{t('common.phone')}</p><p className="font-black text-slate-900 text-sm">{profile.phone || t('common.na')}</p></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right — Detail Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-cyan-600 uppercase tracking-widest mb-5">
              <FiUser size={14} /> {t('student.profile.personalDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label={t('student.profile.fullName')} value={displayName} />
              <InfoItem label={t('common.role')} value={<span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold capitalize">{profile.role || t('common.student')}</span>} />
              <InfoItem label={t('student.profile.fatherName')} value={profile.fatherName} />
              <InfoItem label={t('student.profile.grandfatherName')} value={profile.grandfatherName} />
              <InfoItem label={t('student.profile.dateOfBirth')} value={profile.dob ? new Date(profile.dob).toLocaleDateString() : null} />
              <InfoItem label={t('student.profile.bloodType')} value={profile.bloodType} />
              <InfoItem label={t('common.gender')} value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
              <InfoItem label={t('student.profile.studentCode')} value={profile.studentCode || t('common.na')} />
            </div>
          </Card>

          {/* Guardian */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest mb-5">
              <FiShield size={14} /> {t('student.profile.guardianInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label={t('student.profile.guardianName')} value={profile.guardianName} />
              <InfoItem label={t('student.profile.relationship')} value={profile.guardianRelationship} />
              <InfoItem label={t('student.profile.guardianPhone')} value={profile.guardianPhone} />
              <InfoItem label={t('student.profile.guardianEmail')} value={profile.guardianEmail} />
            </div>
          </Card>

          {/* Address */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-5">
              <FiMapPin size={14} /> {t('common.address')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label={t('student.profile.currentAddress')} value={addressStr(profile.currentAddress)} />
              <InfoItem label={t('student.profile.permanentAddress')} value={addressStr(profile.permanentAddress)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="text-sm font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 min-h-[40px] flex items-center">
      {value || t('common.na')}
    </div>
  </div>
);

export default StudentProfile;
