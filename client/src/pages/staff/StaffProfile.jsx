import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiSave, FiX, FiBriefcase, FiShield } from 'react-icons/fi';
import { Card, Button, Input, Badge } from '../../components/UIHelper';
import { getUser } from '../../lib/auth';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';

const ROLE_COLORS = {
  admin: 'purple',
  staff: 'blue',
  teacher: 'green',
  student: 'orange',
};

const ROLE_LABELS = {
  admin: 'Administrator',
  staff: 'Staff Member',
  teacher: 'Teacher',
  student: 'Student',
};

const StaffProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/me');
      const data = await parseJsonSafe(res);
      if (res.ok && data.user) {
        setProfile(data.user);
        setEditData(data.user);
      } else {
        // fallback to localStorage
        const stored = getUser();
        if (stored) {
          setProfile(stored);
          setEditData(stored);
        }
      }
    } catch {
      const stored = getUser();
      if (stored) {
        setProfile(stored);
        setEditData(stored);
      }
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
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          currentAddress: editData.currentAddress,
        }),
      });
      const data = await parseJsonSafe(res);
      if (res.ok) {
        setProfile(prev => ({ ...prev, ...editData }));
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to save changes');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setIsEditing(false);
    setError('');
  };

  const avatarSrc = profile?.photo || profile?.image;
  const displayName = profile?.fullName || profile?.name || '—';
  const role = profile?.role;
  const employeeType = profile?.employeeType;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500">No profile data found. Please log in again.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage your account information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} icon={<FiX size={15} />}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} icon={<FiSave size={15} />}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} icon={<FiEdit size={15} />}>Edit Profile</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            {/* Avatar + name header */}
            <div className="flex items-start gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="relative flex-shrink-0">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-2xl font-bold border-4 border-white shadow-md ${avatarSrc ? 'hidden' : 'flex'}`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <Badge color={ROLE_COLORS[role] || 'gray'} variant="subtle">
                    {ROLE_LABELS[role] || role}
                  </Badge>
                  {profile.status && (
                    <Badge color={profile.status === 'active' ? 'green' : 'red'} variant="subtle">
                      {profile.status}
                    </Badge>
                  )}
                </div>
                {(profile.designation || employeeType) && (
                  <p className="text-slate-500 text-sm">
                    {profile.designation || ''}
                    {profile.designation && employeeType ? ' · ' : ''}
                    {employeeType ? `${employeeType.charAt(0).toUpperCase() + employeeType.slice(1)} Department` : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><FiMail size={13} />{profile.email}</span>
                  {(profile.phoneNumber || profile.phone) && (
                    <span className="flex items-center gap-1"><FiPhone size={13} />{profile.phoneNumber || profile.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <Field label="Full Name" icon={<FiUser size={13} />}>
                {isEditing
                  ? <Input value={editData.name || ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="w-full" />
                  : <span>{displayName}</span>}
              </Field>

              {/* Email — read only */}
              <Field label="Email Address" icon={<FiMail size={13} />}>
                <span>{profile.email}</span>
              </Field>

              {/* Role */}
              <Field label="System Role" icon={<FiShield size={13} />}>
                <div className="flex items-center gap-2">
                  <Badge color={ROLE_COLORS[role] || 'gray'} variant="subtle">{ROLE_LABELS[role] || role}</Badge>
                </div>
              </Field>

              {/* Employee Type (staff/teacher only) */}
              {employeeType && (
                <Field label="Position / Type" icon={<FiBriefcase size={13} />}>
                  <span className="capitalize">{employeeType}</span>
                </Field>
              )}

              {/* Department */}
              {profile.department && (
                <Field label="Department">
                  <span>{profile.department}</span>
                </Field>
              )}

              {/* Designation */}
              {profile.designation && (
                <Field label="Designation">
                  <span>{profile.designation}</span>
                </Field>
              )}

              {/* Employee ID */}
              {profile.employeeId && (
                <Field label="Employee ID">
                  <span>{profile.employeeId}</span>
                </Field>
              )}

              {/* Student ID */}
              {profile.studentId && (
                <Field label="Student ID">
                  <span>{profile.studentId}</span>
                </Field>
              )}

              {/* Phone */}
              <Field label="Phone" icon={<FiPhone size={13} />}>
                {isEditing
                  ? <Input value={editData.phone || editData.phoneNumber || ''} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} className="w-full" type="tel" />
                  : <span>{profile.phoneNumber || profile.phone || '—'}</span>}
              </Field>

              {/* Join Date */}
              {(profile.joinDate || profile.enrollmentDate) && (
                <Field label="Join Date" icon={<FiCalendar size={13} />}>
                  <span>{new Date(profile.joinDate || profile.enrollmentDate).toLocaleDateString()}</span>
                </Field>
              )}

              {/* Address */}
              <Field label="Address" icon={<FiMapPin size={13} />} className="md:col-span-2">
                {isEditing
                  ? <Input value={editData.currentAddress || ''} onChange={e => setEditData(p => ({ ...p, currentAddress: e.target.value }))} className="w-full" />
                  : <span>{profile.currentAddress || '—'}</span>}
              </Field>
            </div>
          </Card>
        </div>

        {/* Right — Account Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <Row label="Role">
                <Badge color={ROLE_COLORS[role] || 'gray'} variant="subtle">{ROLE_LABELS[role] || role}</Badge>
              </Row>
              {employeeType && (
                <Row label="Type"><span className="capitalize font-medium">{employeeType}</span></Row>
              )}
              {profile.employeeId && (
                <Row label="Employee ID"><span className="font-medium">{profile.employeeId}</span></Row>
              )}
              {profile.department && (
                <Row label="Department"><span className="font-medium">{profile.department}</span></Row>
              )}
              <Row label="Status">
                <Badge color={profile.status === 'active' ? 'green' : 'red'} variant="subtle">
                  {profile.status || 'Active'}
                </Badge>
              </Row>
              {profile.staffModules?.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 mb-2">Access Modules</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.staffModules.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-xs capitalize">{m}</span>
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

const Field = ({ label, icon, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wide">
      {icon}{label}
    </div>
    <div className="text-slate-800 font-medium text-sm">{children}</div>
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500">{label}</span>
    {children}
  </div>
);

export default StaffProfile;
