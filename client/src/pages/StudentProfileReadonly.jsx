import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiActivity, 
  FiAward, 
  FiShield, 
  FiInfo,
  FiMessageSquare,
  FiEdit3,
  FiCheckCircle,
  FiHash,
  FiBriefcase
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/profile`, config);
      setUserData(response.data);
    } catch (err) {
      console.error('[StudentProfile] Error fetching user data:', err);
      setError('Failed to load profile data. Please try again.');
      setUserData(null); // Set null on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="form" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Personal</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Profile</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Verified identification and academic credentials</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
            onClick={() => navigate('/student/communications')}
          >
            <FiMessageSquare /> Contact Registrar
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-[32px] relative overflow-hidden">
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-blue-600 shrink-0">
            <FiShield />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-blue-900 mb-2">Institutional Verification</h3>
            <p className="text-blue-800/80 font-medium leading-relaxed max-w-2xl">
              This profile is maintained by the Registrar's Office. To ensure data integrity, personal details are read-only. 
              If you notice any discrepancies, please submit a modification request.
            </p>
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => navigate('/student/complaints')}
                className="flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-900 uppercase tracking-widest"
              >
                <FiEdit3 /> Request Data Change
              </button>
            </div>
          </div>
        </div>
        <FiInfo className="absolute -right-8 -bottom-8 w-48 h-48 text-blue-500/5 transform rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-[40px] p-10 text-center relative overflow-hidden group border-none shadow-2xl shadow-slate-200/50 bg-white">
            <div className="relative z-10">
              <div className="relative mx-auto w-40 h-40 mb-8">
                <div className="w-full h-full rounded-[48px] bg-gradient-to-tr from-cyan-400 to-blue-600 p-1.5 shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
                  <div className="w-full h-full rounded-[44px] bg-white overflow-hidden flex items-center justify-center">
                    {userData.profilePicture ? (
                      <img src={userData.profilePicture} alt={userData.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-slate-900">{userData.name?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="text-white text-xl" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{userData.name}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">{userData.studentCode || 'STD-2024-001'}</p>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Academic Status</span>
                  <Badge variant={userData.status === 'active' ? 'success' : 'danger'} className="font-black">
                    {userData.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Current Class</span>
                  <span className="font-black text-slate-900">{userData.currentClass || 'Level 1'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Admission Date</span>
                  <span className="font-black text-slate-900">{userData.admissionDate ? formatDate(userData.admissionDate) : 'N/A'}</span>
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-50 -z-0"></div>
          </Card>

          <Card title="Quick Contact" className="rounded-[32px] p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl">
                  <FiMail />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Email</p>
                  <p className="font-black text-slate-900">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <FiPhone />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-black text-slate-900">{userData.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Detailed Information" className="rounded-[32px] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-cyan-600 uppercase tracking-[0.2em] mb-6">
                    <FiUser /> Personal Details
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem label="Full Legal Name" value={userData.name} />
                    <InfoItem label="Father's Name" value={userData.fatherName} />
                    <InfoItem label="Date of Birth" value={userData.dob ? formatDate(userData.dob) : 'N/A'} />
                    <InfoItem label="Blood Type" value={userData.bloodType} />
                    <InfoItem label="ID / Tazkira Number" value={userData.idNumber} />
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">
                    <FiMapPin /> Residential Data
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem label="Current Address" value={`${userData.currentAddress?.province}, ${userData.currentAddress?.district}, ${userData.currentAddress?.village}`} />
                    <InfoItem label="Permanent Address" value={`${userData.permanentAddress?.province}, ${userData.permanentAddress?.district}, ${userData.permanentAddress?.village}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">
                    <FiShield /> Guardian & Emergency
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem label="Guardian Name" value={userData.guardianName} />
                    <InfoItem label="Relationship" value={userData.guardianRelationship} />
                    <InfoItem label="Emergency Phone" value={userData.guardianPhone} />
                    <InfoItem label="Guardian Email" value={userData.guardianEmail} />
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-6">
                    <FiAward /> Academic Standing
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem label="Current Level" value={userData.currentLevel} />
                    <InfoItem label="Department" value={userData.department?.name || 'Academic'} />
                    <InfoItem label="Assigned Faculty" value={userData.teacher?.name || 'Registrar Assigned'} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Account Security" className="rounded-[32px] p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                      <FiHash />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login ID</p>
                      <p className="font-black text-slate-900">{userData.email}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-2xl py-4 font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-50" onClick={() => navigate('/student/settings')}>
                  Change Account Password
                </Button>
              </div>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-2">Student ID Card</h4>
                <p className="text-slate-400 text-sm font-medium mb-6">Download your digital student identification for campus access.</p>
                <Button variant="primary" className="w-full rounded-2xl py-4 bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest transition-all">
                  Download ID Card
                </Button>
              </div>
              <FiBriefcase className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black text-slate-900 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 min-h-[44px] flex items-center">
      {value || '—'}
    </p>
  </div>
);

const Button = ({ children, variant, className, onClick, disabled }) => {
  const baseStyles = "px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 transform active:scale-95";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-50"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default StudentProfile;
