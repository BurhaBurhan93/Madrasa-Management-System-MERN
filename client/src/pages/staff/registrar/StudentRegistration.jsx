import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiUser, FiHome, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUsers, FiTrendingUp, FiCalendar, FiBookOpen } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    thisMonth: 0,
    hostelAssigned: 0,
    activeStudents: 0,
    byDegree: [],
    byMonth: [],
    byGender: []
  });
  
  // Phase 1: Student Information
  const [studentData, setStudentData] = useState({
    // Basic Info
    studentCode: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    grandfatherName: '',
    dob: '',
    gender: 'male',
    bloodType: '',
    
    // Contact Info
    phone: '',
    whatsapp: '',
    email: '',
    
    // Address
    permanentAddress: { province: '', district: '', village: '' },
    currentAddress: { province: '', district: '', village: '' },
    
    // Guardian Info
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    
    // Academic Info
    admissionDate: new Date().toISOString().split('T')[0],
    currentClass: '',
    currentLevel: '',
    
    // Status
    status: 'active'
  });
  
  // Phase 2: Hostel Assignment
  const [hostelData, setHostelData] = useState({
    wantsHostel: false,
    room: '',
    bedNumber: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    monthlyRent: '',
    securityDeposit: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  });
  
  const [availableRooms, setAvailableRooms] = useState([]);
  
  useEffect(() => {
    fetchRegistrationStats();
    if (hostelData.wantsHostel) {
      fetchAvailableRooms();
    }
  }, [hostelData.wantsHostel]);
  
  const fetchRegistrationStats = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`${API_BASE}/student`);
      const data = await res.json();
      
      if (data.success || data.data) {
        const students = data.data || [];
        
        // Calculate statistics
        const totalStudents = students.length;
        const thisMonth = students.filter(s => {
          const admissionDate = new Date(s.admissionDate);
          const now = new Date();
          return admissionDate.getMonth() === now.getMonth() && 
                 admissionDate.getFullYear() === now.getFullYear();
        }).length;
        
        const hostelAssigned = students.filter(s => s.hostelStatus === 'allocated' || s.hostelRoom).length;
        const activeStudents = students.filter(s => s.status === 'active').length;
        
        // By Degree
        const degreeMap = {};
        students.forEach(s => {
          const degree = s.degree || s.currentClass || 'Unclassified';
          degreeMap[degree] = (degreeMap[degree] || 0) + 1;
        });
        const byDegree = Object.entries(degreeMap).map(([name, value]) => ({ name, value })).slice(0, 6);
        
        // By Month (last 6 months)
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        students.forEach(s => {
          if (s.admissionDate) {
            const date = new Date(s.admissionDate);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const byMonth = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        // By Gender
        const genderMap = {};
        students.forEach(s => {
          const gender = s.gender || 'unspecified';
          genderMap[gender] = (genderMap[gender] || 0) + 1;
        });
        const byGender = Object.entries(genderMap).map(([name, value]) => ({ name, value }));
        
        setStats({
          totalStudents,
          thisMonth,
          hostelAssigned,
          activeStudents,
          byDegree,
          byMonth,
          byGender
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        totalStudents: 0,
        thisMonth: 0,
        hostelAssigned: 0,
        activeStudents: 0,
        byDegree: [],
        byMonth: [],
        byGender: []
      });
    } finally {
      setPageLoading(false);
    }
  };
  
  const fetchAvailableRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/hostel/rooms/available`);
      const data = await res.json();
      if (data.success) {
        setAvailableRooms(data.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };
  
  const handleStudentChange = (field, value) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddressChange = (type, field, value) => {
    setStudentData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };
  
  const handleHostelChange = (field, value) => {
    setHostelData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEmergencyContactChange = (field, value) => {
    setHostelData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };
  
  const validatePhase1 = () => {
    if (!studentData.firstName || !studentData.fatherName || !studentData.phone) {
      setError('Please fill in all required fields: First Name, Father Name, and Phone');
      return false;
    }
    return true;
  };
  
  const handleNext = () => {
    if (currentPhase === 1 && validatePhase1()) {
      setError('');
      setCurrentPhase(2);
    }
  };
  
  const handleBack = () => {
    setCurrentPhase(1);
    setError('');
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Create Student
      const studentRes = await fetch(`${API_BASE}/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      const studentResult = await studentRes.json();
      
      if (!studentRes.ok) {
        throw new Error(studentResult.message || 'Failed to create student');
      }
      
      const studentId = studentResult.data._id;
      
      // Step 2: Create Hostel Allocation if requested
      if (hostelData.wantsHostel && hostelData.room) {
        const allocationRes = await fetch(`${API_BASE}/hostel/allocations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: studentId,
            room: hostelData.room,
            bedNumber: hostelData.bedNumber,
            checkInDate: hostelData.checkInDate,
            monthlyRent: Number(hostelData.monthlyRent) || 0,
            securityDeposit: Number(hostelData.securityDeposit) || 0,
            emergencyContact: hostelData.emergencyContact,
            status: 'active'
          })
        });
        
        if (!allocationRes.ok) {
          const allocResult = await allocationRes.json();
          throw new Error(allocResult.message || 'Student created but hostel allocation failed');
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/staff/registrar/students');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (pageLoading) {
    return (
      <StaffPageLayout eyebrow="Registrar" title="Student Registration">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }
  
  if (success) {
    return (
      <StaffPageLayout eyebrow="Registrar" title="Student Registration Complete">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600">The student has been registered successfully.</p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to students list...</p>
        </Card>
      </StaffPageLayout>
    );
  }
  
  return (
    <StaffPageLayout 
      eyebrow="Registrar / Student Affairs" 
      title="Student Registration"
      subtitle="Two-phase registration: Student Information + Optional Hostel Assignment"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-slate-900">{stats.thisMonth}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Hostel Assigned</p>
              <p className="text-2xl font-bold text-slate-900">{stats.hostelAssigned}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiHome className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Registrations by Degree</h3>
          {stats.byDegree.length > 0 ? (
            <PieChartComponent data={stats.byDegree} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Registration Trend</h3>
          {stats.byMonth.length > 0 ? (
            <BarChartComponent data={stats.byMonth} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Gender Distribution</h3>
          {stats.byGender.length > 0 ? (
            <PieChartComponent data={stats.byGender} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPhase === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
            <FiUser />
            <span className="font-medium">Phase 1: Student Info</span>
          </div>
          <FiChevronRight className="text-gray-400" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPhase === 2 ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
            <FiHome />
            <span className="font-medium">Phase 2: Hostel (Optional)</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}
      
      {currentPhase === 1 ? (
        <Card className="rounded-[28px] border border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Basic Information</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Code *</label>
                <input
                  type="text"
                  value={studentData.studentCode}
                  onChange={(e) => handleStudentChange('studentCode', e.target.value)}
                  placeholder="e.g., STU-2024-001"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={studentData.firstName}
                  onChange={(e) => handleStudentChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={studentData.lastName}
                  onChange={(e) => handleStudentChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label>
                <input
                  type="text"
                  value={studentData.fatherName}
                  onChange={(e) => handleStudentChange('fatherName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grandfather Name</label>
                <input
                  type="text"
                  value={studentData.grandfatherName}
                  onChange={(e) => handleStudentChange('grandfatherName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={studentData.dob}
                  onChange={(e) => handleStudentChange('dob', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={studentData.gender}
                  onChange={(e) => handleStudentChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  value={studentData.bloodType}
                  onChange={(e) => handleStudentChange('bloodType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              {/* Contact Info */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Contact Information</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={studentData.phone}
                  onChange={(e) => handleStudentChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={studentData.whatsapp}
                  onChange={(e) => handleStudentChange('whatsapp', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={studentData.email}
                  onChange={(e) => handleStudentChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              {/* Guardian Info */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Guardian Information</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name *</label>
                <input
                  type="text"
                  value={studentData.guardianName}
                  onChange={(e) => handleStudentChange('guardianName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                <input
                  type="text"
                  value={studentData.guardianRelationship}
                  onChange={(e) => handleStudentChange('guardianRelationship', e.target.value)}
                  placeholder="e.g., Father, Mother, Uncle"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                <input
                  type="tel"
                  value={studentData.guardianPhone}
                  onChange={(e) => handleStudentChange('guardianPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email</label>
                <input
                  type="email"
                  value={studentData.guardianEmail}
                  onChange={(e) => handleStudentChange('guardianEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              {/* Academic Info */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Academic Information</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={studentData.admissionDate}
                  onChange={(e) => handleStudentChange('admissionDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
                <input
                  type="text"
                  value={studentData.currentLevel}
                  onChange={(e) => handleStudentChange('currentLevel', e.target.value)}
                  placeholder="e.g., Level 1, Beginner"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
                Next: Hostel Assignment
                <FiChevronRight />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[28px] border border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hostel Assignment (Optional)</h3>
            
            <div className="mb-6">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={hostelData.wantsHostel}
                  onChange={(e) => handleHostelChange('wantsHostel', e.target.checked)}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="font-medium text-gray-700">Student wants hostel accommodation</span>
              </label>
            </div>
            
            {hostelData.wantsHostel && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Room *</label>
                    <select
                      value={hostelData.room}
                      onChange={(e) => handleHostelChange('room', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required={hostelData.wantsHostel}
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(room => (
                        <option key={room._id} value={room._id}>
                          {room.roomNumber} - {room.building} (Floor {room.floor}) - {room.roomType} - ${room.monthlyRent}/month
                        </option>
                      ))}
                    </select>
                    {availableRooms.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">No available rooms found</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                    <input
                      type="number"
                      min="1"
                      value={hostelData.bedNumber}
                      onChange={(e) => handleHostelChange('bedNumber', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      value={hostelData.checkInDate}
                      onChange={(e) => handleHostelChange('checkInDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required={hostelData.wantsHostel}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                    <input
                      type="number"
                      value={hostelData.monthlyRent}
                      onChange={(e) => handleHostelChange('monthlyRent', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit ($)</label>
                    <input
                      type="number"
                      value={hostelData.securityDeposit}
                      onChange={(e) => handleHostelChange('securityDeposit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Hostel Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={hostelData.emergencyContact.name}
                        onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                      <input
                        type="text"
                        value={hostelData.emergencyContact.relationship}
                        onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={hostelData.emergencyContact.phone}
                        onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={hostelData.emergencyContact.email}
                        onChange={(e) => handleEmergencyContactChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={handleBack} className="flex items-center gap-2">
                <FiChevronLeft />
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
                {!loading && <FiCheckCircle />}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </StaffPageLayout>
  );
};

export default StudentRegistration;
