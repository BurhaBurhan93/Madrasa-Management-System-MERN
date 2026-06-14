import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Loading from './Loading';
import api from '../../lib/api';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    whatsapp: '',
    dob: '',
    bloodType: '',
    idNumber: '',
    gender: 'male',
    baseSalary: '',
    joiningDate: '',
    employeeCode: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const resetForm = () => {
    setForm({
      name: '', fatherName: '', email: '', password: '', role: 'student',
      phone: '', whatsapp: '', dob: '', bloodType: '', idNumber: '',
      gender: 'male', baseSalary: '', joiningDate: '', employeeCode: '', status: 'active',
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, Email, and Password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Build payload, stripping empty optional fields to avoid Mongoose validation errors
      const payload = { ...form };
      if (!payload.bloodType) delete payload.bloodType;
      if (!payload.dob) delete payload.dob;
      if (!payload.idNumber) delete payload.idNumber;
      if (!payload.fatherName) delete payload.fatherName;
      if (!payload.whatsapp) delete payload.whatsapp;
      if (!payload.employeeCode) delete payload.employeeCode;

      // For teacher/staff, include required Employee defaults
      if (payload.role === 'teacher' || payload.role === 'staff') {
        payload.gender = payload.gender || 'male';
        payload.joiningDate = payload.joiningDate || new Date().toISOString().split('T')[0];
        payload.baseSalary = payload.baseSalary ? Number(payload.baseSalary) : 0;
      } else {
        // Remove employee-specific fields for student/admin
        delete payload.gender;
        delete payload.baseSalary;
        delete payload.joiningDate;
        delete payload.employeeCode;
      }

      await api.post('/users', payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const isEmployeeRole = form.role === 'teacher' || form.role === 'staff';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
              <input type="text" value={form.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Father's name" />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="user@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="At least 6 characters" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" required>
                <option value="student">👨‍🎓 Student</option>
                <option value="teacher">👨‍🏫 Teacher</option>
                <option value="staff">⚙️ Staff</option>
                <option value="admin">🔑 Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="+1234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="+1234567890" />
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <select value={form.bloodType} onChange={(e) => handleChange('bloodType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Select</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input type="text" value={form.idNumber} onChange={(e) => handleChange('idNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="National ID" />
            </div>
          </div>
        </div>

        {/* Employee-specific fields (shown only for teacher/staff roles) */}
        {isEmployeeRole && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input type="text" value={form.employeeCode} onChange={(e) => handleChange('employeeCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input type="date" value={form.joiningDate} onChange={(e) => handleChange('joiningDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary ($)</label>
                <input type="number" value={form.baseSalary} onChange={(e) => handleChange('baseSalary', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0" min="0" />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : '✅ Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
