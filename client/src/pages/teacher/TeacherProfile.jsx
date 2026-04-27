import React, { useState, useRef, useEffect } from 'react';
import Input from '../../components/UIHelper/Input';
import Avatar from '../../components/UIHelper/Avatar';
import axios from 'axios';

const Panel = ({ title, subtitle, children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const TeacherProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '', fatherName: '', grandfatherName: '', email: '', phone: '',
    whatsapp: '', dob: '', bloodType: '', idNumber: '',
    permanentAddress: { province: '', district: '', village: '' },
    currentAddress: { province: '', district: '', village: '' },
    role: '', status: '', profilePicture: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        if (res.data.success) {
          const user = res.data.data;
          setUserData({
            ...user,
            dob: user.dob ? user.dob.split('T')[0] : '',
            permanentAddress: user.permanentAddress || { province: '', district: '', village: '' },
            currentAddress: user.currentAddress || { province: '', district: '', village: '' }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`http://localhost:5000/api/users/${userId}`, userData);
      setEditMode(false);
      alert('Profile updated successfully!');
      fetchUserData();
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = () => { setEditMode(false); fetchUserData(); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Teacher Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your professional and personal information</p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">

          {/* Profile Card */}
          <div className="w-full md:w-1/3">
            <Panel>
              <div className="text-center">
                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Avatar alt={userData.name} size="xl" />
                  )}
                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <button onClick={() => fileInputRef.current?.click()} className="text-sm text-white underline">Change</button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                  )}
                </div>

                <h2 className="mt-4 text-xl font-semibold text-slate-900">{userData.name}</h2>
                <p className="text-sm text-slate-500">{userData.email}</p>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-medium text-slate-700">{userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${userData.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {userData.status?.charAt(0).toUpperCase() + userData.status?.slice(1)}
                    </span>
                  </div>
                  {userData.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-medium text-slate-700">{userData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* Info Cards */}
          <div className="w-full space-y-6 md:w-2/3">

            <Panel title="Personal Information">
              <div className="mb-5 flex items-center justify-between">
                <div />
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-700">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" value={userData.name || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Father Name" name="fatherName" value={userData.fatherName || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Grandfather Name" name="grandfatherName" value={userData.grandfatherName || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Email" name="email" value={userData.email || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Phone" name="phone" value={userData.phone || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="WhatsApp" name="whatsapp" value={userData.whatsapp || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Date of Birth" type="date" name="dob" value={userData.dob || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="Blood Type" name="bloodType" value={userData.bloodType || ''} onChange={handleInputChange} disabled={!editMode} />
                <Input label="ID Number" name="idNumber" value={userData.idNumber || ''} onChange={handleInputChange} disabled={!editMode} />
              </div>
            </Panel>

            <Panel title="Address Information">
              <div className="mb-5">
                <p className="mb-3 text-sm font-medium text-slate-700">Permanent Address</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Province" value={userData.permanentAddress?.province || ''} onChange={e => setUserData({ ...userData, permanentAddress: { ...userData.permanentAddress, province: e.target.value } })} disabled={!editMode} />
                  <Input label="District" value={userData.permanentAddress?.district || ''} onChange={e => setUserData({ ...userData, permanentAddress: { ...userData.permanentAddress, district: e.target.value } })} disabled={!editMode} />
                  <Input label="Village" value={userData.permanentAddress?.village || ''} onChange={e => setUserData({ ...userData, permanentAddress: { ...userData.permanentAddress, village: e.target.value } })} disabled={!editMode} />
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Current Address</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Province" value={userData.currentAddress?.province || ''} onChange={e => setUserData({ ...userData, currentAddress: { ...userData.currentAddress, province: e.target.value } })} disabled={!editMode} />
                  <Input label="District" value={userData.currentAddress?.district || ''} onChange={e => setUserData({ ...userData, currentAddress: { ...userData.currentAddress, district: e.target.value } })} disabled={!editMode} />
                  <Input label="Village" value={userData.currentAddress?.village || ''} onChange={e => setUserData({ ...userData, currentAddress: { ...userData.currentAddress, village: e.target.value } })} disabled={!editMode} />
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
