import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import { FiUser, FiHome, FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
    image: '',
    
    // Contact Info
    phone: '',
    whatsapp: '',
    email: '',
    accountPassword: '',
    
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
  const [imagePreview, setImagePreview] = useState(null);

  // Handle image change with compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Compress image before upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Resize if too large
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height / width) * maxDim);
              width = maxDim;
            } else {
              width = Math.round((width / height) * maxDim);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type, 0.7); // 70% quality
          
          setStudentData(prev => ({ ...prev, image: compressedDataUrl }));
          setImagePreview(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
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
    if (hostelData.wantsHostel) {
      fetchAvailableRooms();
    }
  }, [hostelData.wantsHostel]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await apiFetch('/hostel/rooms/available');
      const data = await parseJsonSafe(res);
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
    if (!studentData.email?.trim()) {
      setError('Student account email is required');
      return false;
    }
    if (!studentData.accountPassword) {
      setError('Student account password is required');
      return false;
    }
    if (studentData.accountPassword.length < 6) {
      setError('Student account password must be at least 6 characters');
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
      // Step 1: Create Student - strip empty enum fields to avoid validation errors
      const cleanData = { ...studentData };
      if (!cleanData.bloodType) delete cleanData.bloodType;
      if (!cleanData.dob) delete cleanData.dob;
      if (!cleanData.studentCode) delete cleanData.studentCode;
      
      const studentRes = await apiFetch('/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });
      
      const studentResult = await parseJsonSafe(studentRes);
      
      if (!studentRes.ok) {
        throw new Error(studentResult.message || 'Failed to create student');
      }
      
      const studentId = studentResult.data._id;
      
      // Step 2: Create Hostel Allocation if requested
      if (hostelData.wantsHostel && hostelData.room) {
        const allocationRes = await apiFetch('/hostel/allocations', {
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
          const allocResult = await parseJsonSafe(allocationRes);
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
              
              {/* Profile Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-full object-cover border-4 border-cyan-200 shadow" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-cyan-50 file:text-cyan-700 file:font-medium file:text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB recommended.</p>
                  </div>
                </div>
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
                <CalendarDatePicker
                  value={studentData.dob}
                  onChange={(date) => handleStudentChange('dob', date)}
                  placeholder="Select date"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={studentData.email}
                  onChange={(e) => handleStudentChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder="student@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={studentData.accountPassword}
                  onChange={(e) => handleStudentChange('accountPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder="At least 6 characters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login Role</label>
                <input
                  type="text"
                  value="Student"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-slate-50 text-slate-500 focus:outline-none"
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
                <CalendarDatePicker
                  value={studentData.admissionDate}
                  onChange={(date) => handleStudentChange('admissionDate', date)}
                  placeholder="Select date"
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
                    <CalendarDatePicker
                      value={hostelData.checkInDate}
                      onChange={(date) => handleHostelChange('checkInDate', date)}
                      placeholder="Select date"
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
