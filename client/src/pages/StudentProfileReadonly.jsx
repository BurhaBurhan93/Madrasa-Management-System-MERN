import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit3, FiCheckCircle, FiHash, FiBriefcase, FiAward } from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';

const StudentProfile = () => {
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
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSkeleton variant="form" />;

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Profile not found.'}</p>
        <button onClick={fetchProfile} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );
  }

  const avatarSrc = profile.image;
  const displayName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '—';
  const addressStr = (addr) => addr ? [addr.province, addr.district, addr.village].filter(Boolean).join(', ') || '—' : '—';

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-600 mb-1">Personal</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Profile</h1>
          <p className="text-slate-500 mt-1 text-sm">Verified identification and academic credentials</p>
        </div>
        <button
          onClick={() => navigate('/student/complaints')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <FiEdit3 size={14} /> Request Data Change
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
          <FiShield size={22} />
        </div>
        <div>
          <h3 className="font-black text-blue-900 mb-1">Institutional Verification</h3>
          <p className="text-blue-800/80 text-sm leading-relaxed">
            This profile is maintained by the Registrar's Office. Details are read-only. Contact the registrar for any corrections.
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
                {profile.role || 'Student'}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{profile.studentCode || '—'}</p>

            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {(profile.status || 'active').toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Class</span>
                <span className="font-black text-slate-900">{profile.currentClass || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Level</span>
                <span className="font-black text-slate-900">{profile.currentLevel || '—'}</span>
              </div>
              {profile.admissionDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Admitted</span>
                  <span className="font-black text-slate-900">{new Date(profile.admissionDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Contact */}
          <Card className="rounded-[28px] p-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0"><FiMail size={16} /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Email</p><p className="font-black text-slate-900 text-sm">{profile.email || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><FiPhone size={16} /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Phone</p><p className="font-black text-slate-900 text-sm">{profile.phone || '—'}</p></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right — Detail Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-cyan-600 uppercase tracking-widest mb-5">
              <FiUser size={14} /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={displayName} />
              <InfoItem label="Role" value={<span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold capitalize">{profile.role || 'student'}</span>} />
              <InfoItem label="Father's Name" value={profile.fatherName} />
              <InfoItem label="Grandfather's Name" value={profile.grandfatherName} />
              <InfoItem label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : null} />
              <InfoItem label="Blood Type" value={profile.bloodType} />
              <InfoItem label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
              <InfoItem label="Student Code" value={profile.studentCode} />
            </div>
          </Card>

          {/* Guardian */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest mb-5">
              <FiShield size={14} /> Guardian & Emergency
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Guardian Name" value={profile.guardianName} />
              <InfoItem label="Relationship" value={profile.guardianRelationship} />
              <InfoItem label="Guardian Phone" value={profile.guardianPhone} />
              <InfoItem label="Guardian Email" value={profile.guardianEmail} />
            </div>
          </Card>

          {/* Address */}
          <Card className="rounded-[28px] p-6">
            <h3 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-5">
              <FiMapPin size={14} /> Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Current Address" value={addressStr(profile.currentAddress)} />
              <InfoItem label="Permanent Address" value={addressStr(profile.permanentAddress)} />
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
      {value || '—'}
    </div>
  </div>
);

export default StudentProfile;
