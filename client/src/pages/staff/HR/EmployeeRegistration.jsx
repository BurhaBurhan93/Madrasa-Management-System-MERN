import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiBriefcase, FiDollarSign, FiPhone, FiMapPin } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// All available positions/roles in the system
const POSITIONS = [
  { id: 'teacher', label: 'Teacher', description: 'Teaching staff for classes and subjects', color: 'blue' },
  { id: 'admin', label: 'Admin', description: 'Administrative and management staff', color: 'purple' },
  { id: 'finance', label: 'Finance', description: 'Finance and accounting staff', color: 'green' },
  { id: 'registrar', label: 'Registrar', description: 'Student affairs and registration', color: 'orange' },
  { id: 'hr', label: 'HR', description: 'Human resources and recruitment', color: 'pink' },
  { id: 'librarian', label: 'Librarian', description: 'Library management staff', color: 'indigo' },
  { id: 'kitchen', label: 'Kitchen', description: 'Kitchen and catering staff', color: 'yellow' },
  { id: 'security', label: 'Security', description: 'Security and safety personnel', color: 'red' },
  { id: 'support', label: 'Support', description: 'General support staff', color: 'gray' },
  { id: 'maintenance', label: 'Maintenance', description: 'Maintenance and facilities', color: 'teal' }
];

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    user: '',
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
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    employeeCode: '',
    selectedPositions: ['support'],
    primaryPosition: 'support',
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

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users?role=staff`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/hr/departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch(`${API_BASE}/hr/designations`);
      if (res.ok) {
        const data = await res.json();
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
      if (positionId === prev.primaryPosition && updated.length > 0) {
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
        const userRes = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.fullName,
            email: form.email || `${form.employeeCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@madrasa.edu`,
            password: form.cnic || 'password123',
            role: 'staff',
            phone: form.phoneNumber
          })
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.data?._id;
        }
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

      const res = await fetch(`${API_BASE}/hr/employees`, {
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
      blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
      green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
      pink: 'bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
      red: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100',
      teal: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
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
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {options.map((opt, idx) => (
            <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt || 'Select'}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          rows={extra.rows || 3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder={extra.placeholder}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder={extra.placeholder}
        />
      )}
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Employee Registration</h1>
        <p className="text-slate-600">Register new employee with complete information and position assignments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Positions Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-900">Position / Role Assignment *</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">Select all applicable positions. Click to select, "Set as Primary" to make main role.</p>
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
                        className="mt-0.5 w-4 h-4 rounded border-2 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{pos.label}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {pos.description}
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
                            ? 'bg-white/30 text-white border border-white/50' 
                            : 'bg-white/20 text-white/90 border border-white/30 hover:bg-white/30'
                        }`}
                      >
                        {isPrimary ? 'Primary Role' : 'Set as Primary'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-slate-600">
                Selected: <strong className="text-slate-900">{form.selectedPositions.length}</strong> positions
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                Primary Role: <strong className="text-cyan-700">{POSITIONS.find(p => p.id === form.primaryPosition)?.label || 'None'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiUser className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('User Account (if exists)', 'user', 'select', 
                [{ value: '', label: 'Create new user account' }, ...users.map(u => ({ value: u._id, label: `${u.name} (${u.email})` }))])}
              {renderField('Employee Code *', 'employeeCode', 'text', null, { required: true, placeholder: 'e.g., EMP-2024-001' })}
              {renderField('Full Name *', 'fullName', 'text', null, { required: true })}
              {renderField('Full Name (Arabic)', 'fullNameArabic')}
              {renderField('Father Name', 'fatherName')}
              {renderField('Date of Birth', 'dateOfBirth', 'date')}
              {renderField('Gender', 'gender', 'select', [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }])}
              {renderField('CNIC / ID Number', 'cnic')}
              {renderField('Blood Group', 'bloodGroup', 'select', ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b || 'Select' })))}
              {renderField('Marital Status', 'maritalStatus', 'select', [
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' }
              ])}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Phone Number *', 'phoneNumber', 'text', null, { required: true })}
              {renderField('Secondary Phone', 'secondaryPhone')}
              {renderField('Email', 'email', 'email')}
              {renderField('Current Address', 'currentAddress')}
              {renderField('Permanent Address', 'permanentAddress')}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Emergency Contact</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField('Contact Name', 'emergencyContactName')}
              {renderField('Relationship', 'emergencyContactRelation')}
              {renderField('Contact Phone', 'emergencyContactPhone')}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Employment Details</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Department', 'department', 'select', 
                [{ value: '', label: 'Select Department' }, ...departments.map(d => ({ value: d._id, label: d.departmentName }))])}
              {renderField('Designation', 'designation', 'select',
                [{ value: '', label: 'Select Designation' }, ...designations.map(d => ({ value: d._id, label: d.designationTitle }))])}
              {renderField('Joining Date *', 'joiningDate', 'date', null, { required: true })}
              {renderField('Employment Type', 'employmentType', 'select', [
                { value: 'permanent', label: 'Permanent' },
                { value: 'contract', label: 'Contract' },
                { value: 'part-time', label: 'Part Time' }
              ])}
              {renderField('Shift Timing', 'shiftTiming', 'text', null, { placeholder: 'e.g., Morning (8AM-2PM)' })}
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Qualifications & Experience</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField('Highest Qualification', 'highestQualification', 'text', null, { placeholder: 'e.g., Masters in Islamic Studies' })}
              {renderField('Specialization / Subject', 'specialization', 'text', null, { placeholder: 'e.g., Quran, Hadith, Fiqh' })}
              {renderField('Previous Experience (Years)', 'previousExperience', 'number')}
            </div>
          </div>
        </div>

        {/* Salary & Bank Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Salary & Bank Details</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Base Salary *', 'baseSalary', 'number', null, { required: true })}
              {renderField('House Allowance', 'houseAllowance', 'number')}
              {renderField('Transport Allowance', 'transportAllowance', 'number')}
              {renderField('Medical Allowance', 'medicalAllowance', 'number')}
              {renderField('Payment Method', 'paymentMethod', 'select', [
                { value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank Transfer' }
              ])}
              {renderField('Bank Name', 'bankName')}
              {renderField('Account Number', 'accountNumber')}
              {renderField('Account Title', 'accountTitle')}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {renderField('Status', 'status', 'select', [
            { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }
          ])}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/staff/hr/employees')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-medium hover:from-cyan-700 hover:to-sky-700 transition-all disabled:opacity-50"
          >
            <FiSave /> {loading ? 'Saving...' : 'Register Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;
