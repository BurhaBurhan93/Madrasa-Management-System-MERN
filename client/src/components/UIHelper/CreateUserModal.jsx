import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Loading from './Loading';
import api from '../../lib/api';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'staff', phone: '', status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, Email, and Password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/users', form);
      onSuccess?.();
      onClose();
      setForm({ name: '', email: '', password: '', role: 'staff', phone: '', status: 'active' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name', key: 'name', type: 'text', required: true },
    { label: 'Email', key: 'email', type: 'email', required: true },
    { label: 'Password', key: 'password', type: 'password', required: true },
    {
      label: 'Role', key: 'role', type: 'select', required: true,
      options: [
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'staff', label: 'Staff' },
        { value: 'admin', label: 'Admin' },
      ]
    },
    { label: 'Phone', key: 'phone', type: 'text' },
    {
      label: 'Status', key: 'status', type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}{f.required ? ' *' : ''}
            </label>
            {f.type === 'select' ? (
              <select
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={f.required}
              >
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={f.required}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
