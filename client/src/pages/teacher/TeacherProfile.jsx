import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit, FiSave, FiX, FiBriefcase } from 'react-icons/fi';
import Input from '../../components/UIHelper/Input';
import { getUser } from '../../lib/auth';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';

const Panel = ({ title, children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {title && <h3 className="text-base font-semibold text-slate-900 mb-5">{title}</h3>}
    {children}
  </div>
);

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-orange-100 text-orange-800',
};

const TeacherProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/me');
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        setProfile(data.user);
        setEditData(data.user);
      } else {
        const stored = getUser();
        if (stored) { setProfile(stored); setEditData(stored); }
      }
    } catch {
      const stored = getUser();
      if (stored) { setProfile(stored); setEditData(stored); }
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
        body: JSON.stringify({ name: editData.name, phone: editData.phone }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        setProfile(prev => ({ ...prev, ...editData }));
        setEditMode(false);
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setEditData({ ...profile }); setEditMode(false); setError(''); };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">No profile data found. Please log in again.</div>;
  }

  const avatarSrc = profile.photo || profile.image;
  const displayName = profile.fullName || profile.name || '—';
  const role = profile.role;
  const addrStr = (addr) => addr ? [addr.province, addr.district, addr.village].filter(Boolean).join(', ') || '—' : '—';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your professional and personal information</p>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button onClick={handleCancel} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  <FiX className="inline mr-1" size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
                  <FiSave className="inline mr-1" size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                <FiEdit className="inline mr-1" size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Profile Card */}
          <div className="w-full md:w-1/3">
            <Panel>
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mx-auto h-28 w-28 mb-4">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={displayName} className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div className={`h-28 w-28 rounded-full bg-cyan-100 border-4 border-white shadow-lg items-center justify-center text-cyan-700 text-3xl font-bold ${avatarSrc ? 'hidden' : 'flex'}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>

                {/* Role & Type badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-800'}`}>
                    {role}
                  </span>
                  {profile.employeeType && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 capitalize">
                      {profile.employeeType}
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3 text-sm text-left border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {(profile.status || 'active').charAt(0).toUpperCase() + (profile.status || 'active').slice(1)}
                    </span>
                  </div>
                  {profile.employeeId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Employee ID</span>
                      <span className="font-medium text-slate-700">{profile.employeeId}</span>
                    </div>
                  )}
                  {profile.department && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department</span>
                      <span className="font-medium text-slate-700 text-right">{profile.department}</span>
                    </div>
                  )}
                  {profile.designation && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Designation</span>
                      <span className="font-medium text-slate-700 text-right">{profile.designation}</span>
                    </div>
                  )}
                  {profile.joinDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joined</span>
                      <span className="font-medium text-slate-700">{new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {profile.staffModules?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-400 mb-1.5">Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.staffModules.map(m => (
                          <span key={m} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-xs capitalize">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* Info Panels */}
          <div className="w-full space-y-6 md:w-2/3">
            <Panel title="Personal Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Name" value={editMode ? editData.name || '' : displayName} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} disabled={!editMode} />
                <Input label="Email" value={profile.email || ''} disabled />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>
                    {profile.employeeType && <span className="ml-2 text-sm text-slate-500 capitalize">· {profile.employeeType}</span>}
                  </div>
                </div>
                <Input label="Phone" value={editMode ? editData.phone || editData.phoneNumber || '' : profile.phone || profile.phoneNumber || ''} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} disabled={!editMode} />
                <Input label="Father Name" value={profile.fatherName || ''} disabled />
                <Input label="Grandfather Name" value={profile.grandfatherName || ''} disabled />
                <Input label="Blood Type" value={profile.bloodType || ''} disabled />
                <Input label="ID Number" value={profile.idNumber || ''} disabled />
              </div>
            </Panel>

            <Panel title="Address Information">
              <div className="mb-5">
                <p className="mb-3 text-sm font-medium text-slate-700">Permanent Address</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Province" value={profile.permanentAddress?.province || ''} disabled />
                  <Input label="District" value={profile.permanentAddress?.district || ''} disabled />
                  <Input label="Village" value={profile.permanentAddress?.village || ''} disabled />
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Current Address</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Province" value={profile.currentAddress?.province || ''} disabled />
                  <Input label="District" value={profile.currentAddress?.district || ''} disabled />
                  <Input label="Village" value={profile.currentAddress?.village || ''} disabled />
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
