import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSave, FiX, FiUser, FiBriefcase, FiDollarSign, FiPhone, FiMapPin, FiPlus } from 'react-icons/fi';
import { CreateUserModal } from '../../../components/UIHelper';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';

const POSITIONS = [
  { id: 'teacher', labelKey: 'hr.employees.registration.positionTeacher', descKey: 'hr.employees.registration.positionTeacherDesc', color: 'blue' },
  { id: 'admin', labelKey: 'hr.employees.registration.positionAdmin', descKey: 'hr.employees.registration.positionAdminDesc', color: 'purple' },
  { id: 'finance', labelKey: 'hr.employees.registration.positionFinance', descKey: 'hr.employees.registration.positionFinanceDesc', color: 'green' },
  { id: 'registrar', labelKey: 'hr.employees.registration.positionRegistrar', descKey: 'hr.employees.registration.positionRegistrarDesc', color: 'orange' },
  { id: 'hr', labelKey: 'hr.employees.registration.positionHr', descKey: 'hr.employees.registration.positionHrDesc', color: 'pink' },
  { id: 'librarian', labelKey: 'hr.employees.registration.positionLibrarian', descKey: 'hr.employees.registration.positionLibrarianDesc', color: 'indigo' },
  { id: 'kitchen', labelKey: 'hr.employees.registration.positionKitchen', descKey: 'hr.employees.registration.positionKitchenDesc', color: 'yellow' },
  { id: 'security', labelKey: 'hr.employees.registration.positionSecurity', descKey: 'hr.employees.registration.positionSecurityDesc', color: 'red' },
  { id: 'maintenance', labelKey: 'hr.employees.registration.positionMaintenance', descKey: 'hr.employees.registration.positionMaintenanceDesc', color: 'teal' },
  { id: 'payroll', labelKey: 'hr.employees.registration.positionPayroll', descKey: 'hr.employees.registration.positionPayrollDesc', color: 'emerald' },
  { id: 'complaints', labelKey: 'hr.employees.registration.positionComplaints', descKey: 'hr.employees.registration.positionComplaintsDesc', color: 'rose' },
  { id: 'inventory', labelKey: 'hr.employees.registration.positionInventory', descKey: 'hr.employees.registration.positionInventoryDesc', color: 'cyan' },
  { id: 'general-manager', labelKey: 'hr.employees.registration.positionGeneralManager', descKey: 'hr.employees.registration.positionGeneralManagerDesc', color: 'slate' }
];

const getRoleForPosition = (positionId) => {
  if (positionId === 'admin') return 'admin';
  if (positionId === 'teacher') return 'teacher';
  return 'staff';
};

const getRoleLabel = (role, t) => ({
  admin: t('hr.employees.registration.roleAdmin'),
  teacher: t('hr.employees.registration.roleTeacher'),
  staff: t('hr.employees.registration.roleStaff')
}[role] || t('hr.employees.registration.roleStaff'));

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['staff', 'common']);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [errors, setErrors] = useState({});
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [form, setForm] = useState({
    user: '',
    photo: '',
    fullName: '',
    fullNameArabic: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'male',
    cnic: '',
    bloodGroup: '',
    maritalStatus: 'single',
    phoneNumber: '',
    secondaryPhone: '',
    email: '',
    accountEmail: '',
    accountPassword: '',
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    employeeCode: '',
    selectedPositions: [],
    primaryPosition: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'permanent',
    shiftTiming: '',
    highestQualification: '',
    specialization: '',
    previousExperience: 0,
    baseSalary: '',
    houseAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    paymentMethod: 'cash',
    bankName: '',
    accountNumber: '',
    accountTitle: '',
    status: 'active'
  });

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
          setForm(prev => ({ ...prev, photo: compressedDataUrl }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/users?role=staff');
      const data = await parseJsonSafe(res);
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch('/hr/departments');
      const data = await parseJsonSafe(res);
      if (data.success) {
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await apiFetch('/hr/designations');
      const data = await parseJsonSafe(res);
      if (data.success) {
        setDesignations(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePositionToggle = (positionId) => {
    setForm(prev => {
      const current = prev.selectedPositions || [];
      const updated = current.includes(positionId)
        ? current.filter(p => p !== positionId)
        : [...current, positionId];
      
      let newPrimary = prev.primaryPosition;
      if (updated.length === 0) {
        newPrimary = '';
      } else if (positionId === prev.primaryPosition && !updated.includes(positionId)) {
        newPrimary = updated[0];
      } else if (!newPrimary || !updated.includes(newPrimary)) {
        newPrimary = updated[0];
      }
      
      return { ...prev, selectedPositions: updated, primaryPosition: newPrimary };
    });
  };

  const handleSetPrimary = (positionId) => {
    setForm(prev => ({ ...prev, primaryPosition: positionId }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!form.employeeCode?.trim()) newErrors.employeeCode = 'Employee code is required';
    if (!form.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!form.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!form.baseSalary) newErrors.baseSalary = 'Base salary is required';
    if (form.selectedPositions.length === 0) newErrors.selectedPositions = 'Select at least one position';
    if (!form.primaryPosition || !form.selectedPositions.includes(form.primaryPosition)) {
      newErrors.primaryPosition = 'Select a primary position';
    }

    if (!form.user) {
      if (!form.accountEmail?.trim()) {
        newErrors.accountEmail = 'Account email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.accountEmail)) {
        newErrors.accountEmail = 'Enter a valid email address';
      }

      if (!form.accountPassword) {
        newErrors.accountPassword = 'Account password is required';
      } else if (form.accountPassword.length < 6) {
        newErrors.accountPassword = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let userId = form.user;
      if (!userId) {
        const userRole = getRoleForPosition(form.primaryPosition);
        const userRes = await apiFetch('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.fullName,
            email: form.accountEmail.trim(),
            password: form.accountPassword,
            role: userRole,
            phone: form.phoneNumber,
            employeeCode: form.employeeCode,
            skipProfile: true
          })
        });
        if (!userRes.ok) {
          const userError = await userRes.json();
          throw new Error(userError.message || 'Failed to create user account');
        }
        const userData = await userRes.json();
        userId = userData.data?._id;
      }

      const employeeData = {
        ...form,
        user: userId,
        employeeType: form.primaryPosition,
        baseSalary: Number(form.baseSalary),
        houseAllowance: Number(form.houseAllowance),
        transportAllowance: Number(form.transportAllowance),
        medicalAllowance: Number(form.medicalAllowance),
        previousExperience: Number(form.previousExperience)
      };

      delete employeeData.selectedPositions;
      delete employeeData.primaryPosition;
      delete employeeData.accountEmail;
      delete employeeData.accountPassword;

      const res = await apiFetch('/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });

      if (res.ok) {
        navigate('/staff/hr/employees');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create employee');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-transparent border-blue-200 text-blue-800 hover:bg-blue-100',
      purple: 'bg-transparent border-purple-200 text-purple-800 hover:bg-purple-100',
      green: 'bg-transparent border-green-200 text-green-800 hover:bg-green-100',
      orange: 'bg-transparent border-orange-200 text-orange-800 hover:bg-orange-100',
      pink: 'bg-transparent border-pink-200 text-pink-800 hover:bg-pink-100',
      indigo: 'bg-transparent border-indigo-200 text-indigo-800 hover:bg-indigo-100',
      yellow: 'bg-transparent border-yellow-200 text-yellow-800 hover:bg-yellow-100',
      red: 'bg-transparent border-red-200 text-red-800 hover:bg-red-100',
      gray: 'bg-transparent border-gray-200 text-gray-800 hover:bg-gray-100',
      teal: 'bg-transparent border-teal-200 text-teal-800 hover:bg-teal-100'
    };
    return colors[color] || colors.gray;
  };

  const getSelectedColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-600 text-white shadow-md',
      purple: 'bg-purple-500 border-purple-600 text-white shadow-md',
      green: 'bg-green-500 border-green-600 text-white shadow-md',
      orange: 'bg-orange-500 border-orange-600 text-white shadow-md',
      pink: 'bg-pink-500 border-pink-600 text-white shadow-md',
      indigo: 'bg-indigo-500 border-indigo-600 text-white shadow-md',
      yellow: 'bg-yellow-500 border-yellow-600 text-white shadow-md',
      red: 'bg-red-500 border-red-600 text-white shadow-md',
      gray: 'bg-gray-500 border-gray-600 text-white shadow-md',
      teal: 'bg-teal-500 border-teal-600 text-white shadow-md'
    };
    return colors[color] || colors.gray;
  };

  const renderField = (label, name, type = 'text', options = null, extra = {}) => (
    <div className={extra.className || ''}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}{extra.required && ' *'}</label>
      {type === 'select' ? (
        <select
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-full bg-transparent px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-transparent disabled:text-slate-500"
          disabled={extra.disabled}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt || t('hr.employees.registration.selectDefault')}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          rows={extra.rows || 3}
          className="w-full bg-transparent px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-transparent disabled:text-slate-500"
          placeholder={extra.placeholder}
          disabled={extra.disabled}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-full bg-transparent px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-transparent disabled:text-slate-500"
          placeholder={extra.placeholder}
          disabled={extra.disabled}
        />
      )}
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hr.employees.title')}</h1>
          <p className="text-slate-600">{t('hr.employees.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Positions Selection */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.positionTitle')} *</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">{t('hr.employees.registration.positionDesc')}</p>
          </div>
          <div className="p-6">
            {errors.selectedPositions && (
              <p className="text-red-600 text-sm mb-3">{errors.selectedPositions}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {POSITIONS.map((pos) => {
                const isSelected = form.selectedPositions.includes(pos.id);
                const isPrimary = form.primaryPosition === pos.id;
                
                return (
                  <div
                    key={pos.id}
                    onClick={() => handlePositionToggle(pos.id)}
                    className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${
                      isSelected ? getSelectedColorClasses(pos.color) : getColorClasses(pos.color)
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded border-2 cursor-pointer bg-transparent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{t(pos.labelKey)}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {t(pos.descKey)}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(pos.id);
                        }}
                        className={`mt-2 w-full text-xs py-1 px-2 rounded font-medium transition-colors ${
                          isPrimary 
                            ? 'bg-transparent/30 text-white border border-white/50' 
                            : 'bg-transparent/20 text-white/90 border border-white/30 hover:bg-transparent/30'
                        }`}
                      >
                        {isPrimary ? t('hr.employees.registration.primaryRole') : t('hr.employees.registration.setAsPrimary')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-slate-600">
                {t('hr.employees.registration.selected')}: <strong className="text-slate-900">{form.selectedPositions.length}</strong> {t('hr.employees.registration.positions')}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                {t('hr.employees.registration.primaryRoleLabel')}: <strong className="text-cyan-700">{t(POSITIONS.find(p => p.id === form.primaryPosition)?.labelKey || '') || '—'}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                {t('hr.employees.registration.loginRole')}: <strong className="text-cyan-700">{getRoleLabel(getRoleForPosition(form.primaryPosition), t)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiUser className="text-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.accountInfo')} *</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">{t('hr.employees.registration.accountInfoDesc')}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderField(t('hr.employees.registration.linkUser'), 'user', 'select', 
                [{ value: '', label: t('hr.employees.registration.createNewUser') }, ...users.map(u => ({ value: u._id, label: `${u.name} (${u.email})` }))])}
              {renderField(t('hr.employees.registration.roleStaff') + ' Email *', 'accountEmail', 'email', null, {
                required: !form.user,
                disabled: !!form.user,
                placeholder: t('hr.employees.registration.accountEmailPlaceholder')
              })}
              {renderField(t('hr.employees.registration.roleStaff') + ' Password *', 'accountPassword', 'password', null, {
                required: !form.user,
                disabled: !!form.user,
                placeholder: t('hr.employees.registration.accountPasswordPlaceholder')
              })}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('hr.employees.registration.loginRole')}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-cyan-200 bg-transparent text-sm font-semibold text-cyan-800">
                  {getRoleLabel(getRoleForPosition(form.primaryPosition), t)}
                </div>
                <p className="text-xs text-slate-500 mt-1">{t('hr.employees.registration.loginRoleDesc')}</p>
              </div>
            </div>
            {errors.primaryPosition && <p className="text-red-600 text-xs mt-2">{errors.primaryPosition}</p>}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiUser className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.personalInfo')}</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('hr.employees.registration.employeePhoto')}</label>
                <div className="flex items-center gap-3">
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt={t('hr.employees.registration.profilePreview')}
                      className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-transparent">
                      {t('hr.employees.registration.noPhoto')}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fieldemployeeCode') + ' *', 'employeeCode', 'text', null, { required: true, placeholder: t('hr.employees.registration.employeeCodePlaceholder') })}
              {renderField(t('hr.employees.fieldfullName') + ' *', 'fullName', 'text', null, { required: true })}
              {renderField(t('hr.employees.fieldfullNameArabic'), 'fullNameArabic')}
              {renderField(t('hr.employees.fieldfatherName'), 'fatherName')}
              {renderField(t('hr.employees.fielddateOfBirth'), 'dateOfBirth', 'date')}
              {renderField(t('hr.employees.fieldgender'), 'gender', 'select', [{ value: 'male', label: t('hr.employees.optiongenderMale') }, { value: 'female', label: t('hr.employees.optiongenderFemale') }])}
              {renderField(t('hr.employees.fieldcnic'), 'cnic')}
              {renderField(t('hr.employees.fieldbloodGroup'), 'bloodGroup', 'select', ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b || t('hr.employees.registration.selectDefault') })))}
              {renderField(t('hr.employees.fieldmaritalStatus'), 'maritalStatus', 'select', [
                { value: 'single', label: t('hr.employees.optionmaritalSingle') },
                { value: 'married', label: t('hr.employees.optionmaritalMarried') },
                { value: 'divorced', label: t('hr.employees.optionmaritalDivorced') },
                { value: 'widowed', label: t('hr.employees.optionmaritalWidowed') }
              ])}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.contactInfo')}</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fieldphone') + ' *', 'phoneNumber', 'text', null, { required: true })}
              {renderField(t('hr.employees.fieldsecondaryPhone'), 'secondaryPhone')}
              {renderField(t('hr.employees.fieldemail'), 'email', 'email')}
              {renderField(t('hr.employees.fieldcurrentAddress'), 'currentAddress')}
              {renderField(t('hr.employees.fieldpermanentAddress'), 'permanentAddress')}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.emergencyContact')}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fieldemergencyContactName'), 'emergencyContactName')}
              {renderField(t('hr.employees.fieldemergencyContactRelation'), 'emergencyContactRelation')}
              {renderField(t('hr.employees.fieldemergencyContactPhone'), 'emergencyContactPhone')}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.employmentDetails')}</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fielddepartment'), 'department', 'select', 
                [{ value: '', label: t('hr.employees.registration.selectDepartment') }, ...departments.map(d => ({ value: d._id, label: d.departmentName }))])}
              {renderField(t('hr.employees.fielddesignation'), 'designation', 'select',
                [{ value: '', label: t('hr.employees.registration.selectDesignation') }, ...designations.map(d => ({ value: d._id, label: d.designationTitle }))])}
              {renderField(t('hr.employees.fieldjoiningDate') + ' *', 'joiningDate', 'date', null, { required: true })}
              {renderField(t('hr.employees.fieldemploymentType'), 'employmentType', 'select', [
                { value: 'permanent', label: t('hr.employees.optionemploymentTypePermanent') },
                { value: 'contract', label: t('hr.employees.optionemploymentTypeContract') },
                { value: 'part-time', label: t('hr.employees.optionemploymentTypePartTime') }
              ])}
              {renderField(t('hr.employees.fieldshiftTiming'), 'shiftTiming', 'text', null, { placeholder: t('hr.employees.registration.shiftTimingPlaceholder') })}
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.qualifications')}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fieldhighestQualification'), 'highestQualification', 'text', null, { placeholder: t('hr.employees.registration.highestQualPlaceholder') })}
              {renderField(t('hr.employees.fieldspecialization'), 'specialization', 'text', null, { placeholder: t('hr.employees.registration.specializationPlaceholder') })}
              {renderField(t('hr.employees.fieldpreviousExperience'), 'previousExperience', 'number')}
            </div>
          </div>
        </div>

        {/* Salary & Bank Details */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-transparent border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('hr.employees.registration.salaryBank')}</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField(t('hr.employees.fieldbaseSalary') + ' *', 'baseSalary', 'number', null, { required: true })}
              {renderField(t('hr.employees.fieldhouseAllowance'), 'houseAllowance', 'number')}
              {renderField(t('hr.employees.fieldtransportAllowance'), 'transportAllowance', 'number')}
              {renderField(t('hr.employees.fieldmedicalAllowance'), 'medicalAllowance', 'number')}
              {renderField(t('hr.employees.fieldpaymentMethod'), 'paymentMethod', 'select', [
                { value: 'cash', label: t('hr.employees.optionpaymentMethodCash') }, { value: 'bank', label: t('hr.employees.optionpaymentMethodBankTransfer') }
              ])}
              {renderField(t('hr.employees.fieldbankName'), 'bankName')}
              {renderField(t('hr.employees.fieldaccountNumber'), 'accountNumber')}
              {renderField(t('hr.employees.fieldaccountTitle'), 'accountTitle')}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {renderField(t('hr.employees.fieldstatus'), 'status', 'select', [
            { value: 'active', label: t('hr.employees.optionstatusActive') }, { value: 'inactive', label: t('hr.employees.optionstatusInactive') }
          ])}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/staff/hr/employees')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiX /> {t('hr.employees.registration.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-medium hover:from-cyan-700 hover:to-sky-700 transition-all disabled:opacity-50"
          >
            <FiSave /> {loading ? t('common.saving') : t('hr.employees.createTitle')}
          </button>
        </div>
      </form>

      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
};

export default EmployeeRegistration;
