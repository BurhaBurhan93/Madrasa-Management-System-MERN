import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import { FiUser, FiHome, FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['staff', 'common']);
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
        alert(t('registrar.studentRegistration.imageSizeError'));
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
      setError(t('registrar.studentRegistration.validationRequiredFields'));
      return false;
    }
    if (!studentData.email?.trim()) {
      setError(t('registrar.studentRegistration.validationEmailRequired'));
      return false;
    }
    if (!studentData.accountPassword) {
      setError(t('registrar.studentRegistration.validationPasswordRequired'));
      return false;
    }
    if (studentData.accountPassword.length < 6) {
      setError(t('registrar.studentRegistration.validationPasswordLength'));
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
        throw new Error(studentResult.message || t('registrar.studentRegistration.createStudentFailed'));
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
          throw new Error(allocResult.message || t('registrar.studentRegistration.hostelAllocationFailed'));
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
      <StaffPageLayout eyebrow={t('registrar.studentRegistration.eyebrow')} title={t('registrar.studentRegistration.completeTitle')}>
        <Card className="p-3 sm:p-4 lg:p-8 text-center">
          <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('registrar.studentRegistration.registrationSuccessful')}</h2>
          <p className="text-gray-600">{t('registrar.studentRegistration.registrationSuccessMessage')}</p>
          <p className="text-gray-500 text-sm mt-2">{t('registrar.studentRegistration.redirectingMessage')}</p>
        </Card>
      </StaffPageLayout>
    );
  }
  
  return (
    <StaffPageLayout 
      eyebrow={t('registrar.studentRegistration.pageEyebrow')} 
      title={t('registrar.studentRegistration.title')}
      subtitle={t('registrar.studentRegistration.pageSubtitle')}
    >
      {/* Progress Steps */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPhase === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-transparent text-gray-600'}`}>
            <FiUser />
            <span className="font-medium">{t('registrar.studentRegistration.phase1')}</span>
          </div>
          <FiChevronRight className="text-gray-400" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPhase === 2 ? 'bg-cyan-100 text-cyan-700' : 'bg-transparent text-gray-600'}`}>
            <FiHome />
            <span className="font-medium">{t('registrar.studentRegistration.phase2')}</span>
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
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('registrar.studentRegistration.studentInfo')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('registrar.studentRegistration.basicInfo')}</h4>
              </div>
              
              {/* Profile Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.profilePhoto')}</label>
                <div className="flex items-center gap-6 flex-col sm:flex-row">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt={t('registrar.studentRegistration.previewAlt')} className="h-24 w-24 rounded-full object-cover border-4 border-cyan-200 shadow" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-transparent border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-3xl">
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
                    <p className="text-xs text-gray-500 mt-1">{t('registrar.studentRegistration.profilePhotoHint')}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.studentCode')}</label>
                <input
                  type="text"
                  value={studentData.studentCode}
                  onChange={(e) => handleStudentChange('studentCode', e.target.value)}
                  placeholder={t('registrar.studentRegistration.studentCodePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.firstName')}</label>
                <input
                  type="text"
                  value={studentData.firstName}
                  onChange={(e) => handleStudentChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.lastName')}</label>
                <input
                  type="text"
                  value={studentData.lastName}
                  onChange={(e) => handleStudentChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.fatherName')}</label>
                <input
                  type="text"
                  value={studentData.fatherName}
                  onChange={(e) => handleStudentChange('fatherName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.grandfatherName')}</label>
                <input
                  type="text"
                  value={studentData.grandfatherName}
                  onChange={(e) => handleStudentChange('grandfatherName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.dateOfBirth')}</label>
                <CalendarDatePicker
                  value={studentData.dob}
                  onChange={(date) => handleStudentChange('dob', date)}
                  placeholder={t('registrar.studentRegistration.dateOfBirthPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.gender')}</label>
                <select
                  value={studentData.gender}
                  onChange={(e) => handleStudentChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="male">{t('registrar.studentRegistration.male')}</option>
                  <option value="female">{t('registrar.studentRegistration.female')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.bloodType')}</label>
                <select
                  value={studentData.bloodType}
                  onChange={(e) => handleStudentChange('bloodType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">{t('registrar.studentRegistration.bloodTypeSelect')}</option>
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
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('registrar.studentRegistration.contactInfo')}</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.phone')}</label>
                <input
                  type="tel"
                  value={studentData.phone}
                  onChange={(e) => handleStudentChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.whatsapp')}</label>
                <input
                  type="tel"
                  value={studentData.whatsapp}
                  onChange={(e) => handleStudentChange('whatsapp', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.email')}</label>
                <input
                  type="email"
                  value={studentData.email}
                  onChange={(e) => handleStudentChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder={t('registrar.studentRegistration.emailPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.password')}</label>
                <input
                  type="password"
                  value={studentData.accountPassword}
                  onChange={(e) => handleStudentChange('accountPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder={t('registrar.studentRegistration.passwordPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.loginRole')}</label>
                <input
                  type="text"
                  value={t('registrar.studentRegistration.studentRoleValue')}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-transparent text-slate-500 focus:outline-none"
                />
              </div>
              
              {/* Guardian Info */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('registrar.studentRegistration.guardianInfo')}</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.guardianName')}</label>
                <input
                  type="text"
                  value={studentData.guardianName}
                  onChange={(e) => handleStudentChange('guardianName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.relationship')}</label>
                <input
                  type="text"
                  value={studentData.guardianRelationship}
                  onChange={(e) => handleStudentChange('guardianRelationship', e.target.value)}
                  placeholder={t('registrar.studentRegistration.relationshipPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.guardianPhone')}</label>
                <input
                  type="tel"
                  value={studentData.guardianPhone}
                  onChange={(e) => handleStudentChange('guardianPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.guardianEmail')}</label>
                <input
                  type="email"
                  value={studentData.guardianEmail}
                  onChange={(e) => handleStudentChange('guardianEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              {/* Academic Info */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('registrar.studentRegistration.academicInfo')}</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.admissionDate')}</label>
                <CalendarDatePicker
                  value={studentData.admissionDate}
                  onChange={(date) => handleStudentChange('admissionDate', date)}
                  placeholder={t('registrar.studentRegistration.admissionDatePlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.currentLevel')}</label>
                <input
                  type="text"
                  value={studentData.currentLevel}
                  onChange={(e) => handleStudentChange('currentLevel', e.target.value)}
                  placeholder={t('registrar.studentRegistration.currentLevelPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
                {t('registrar.studentRegistration.nextPhase')}
                <FiChevronRight />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[28px] border border-slate-200">
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('registrar.studentRegistration.hostelAssignment')}</h3>
            
            <div className="mb-6">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-transparent">
                <input
                  type="checkbox"
                  checked={hostelData.wantsHostel}
                  onChange={(e) => handleHostelChange('wantsHostel', e.target.checked)}
                  className="w-5 h-5 text-cyan-600"
                />
                <span className="font-medium text-gray-700">{t('registrar.studentRegistration.hostelCheckbox')}</span>
              </label>
            </div>
            
            {hostelData.wantsHostel && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.selectRoom')}</label>
                    <select
                      value={hostelData.room}
                      onChange={(e) => handleHostelChange('room', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required={hostelData.wantsHostel}
                    >
                      <option value="">{t('registrar.studentRegistration.selectRoomPlaceholder')}</option>
                      {availableRooms.map(room => (
                        <option key={room._id} value={room._id}>
                          {t('registrar.studentRegistration.roomOption', { roomNumber: room.roomNumber, building: room.building, floor: room.floor, roomType: room.roomType, rent: room.monthlyRent })}
                        </option>
                      ))}
                    </select>
                    {availableRooms.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">{t('registrar.studentRegistration.noRooms')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.bedNumber')}</label>
                    <input
                      type="number"
                      min="1"
                      value={hostelData.bedNumber}
                      onChange={(e) => handleHostelChange('bedNumber', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.checkinDate')}</label>
                    <CalendarDatePicker
                      value={hostelData.checkInDate}
                      onChange={(date) => handleHostelChange('checkInDate', date)}
                      placeholder={t('registrar.studentRegistration.checkinDatePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.monthlyRent')}</label>
                    <input
                      type="number"
                      value={hostelData.monthlyRent}
                      onChange={(e) => handleHostelChange('monthlyRent', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.securityDeposit')}</label>
                    <input
                      type="number"
                      value={hostelData.securityDeposit}
                      onChange={(e) => handleHostelChange('securityDeposit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('registrar.studentRegistration.hostelEmergencyContact')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.emergencyName')}</label>
                      <input
                        type="text"
                        value={hostelData.emergencyContact.name}
                        onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.emergencyRelationship')}</label>
                      <input
                        type="text"
                        value={hostelData.emergencyContact.relationship}
                        onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.emergencyPhone')}</label>
                      <input
                        type="tel"
                        value={hostelData.emergencyContact.phone}
                        onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required={hostelData.wantsHostel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('registrar.studentRegistration.emergencyEmail')}</label>
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
                {t('common:back')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? t('registrar.studentRegistration.registering') : t('registrar.studentRegistration.completeRegistration')}
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
