import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const Designations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/hr/designations');
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/hr/departments');
      setDepartments(Array.isArray(data) ? data : data.data || []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => { fetchData(); fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      salaryRangeMin: form.salaryRangeMin ? Number(form.salaryRangeMin) : undefined,
      salaryRangeMax: form.salaryRangeMax ? Number(form.salaryRangeMax) : undefined,
    };
    try {
      if (editingId) await api.put(`/hr/designations/${editingId}`, payload);
      else await api.post('/hr/designations', payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      designationTitle: item.designationTitle || '',
      jobLevel: item.jobLevel || 'entry',
      department: typeof item.department === 'object' ? (item.department?._id || '') : (item.department || ''),
      minQualification: item.minQualification || '',
      salaryRangeMin: item.salaryRangeMin ?? '',
      salaryRangeMax: item.salaryRangeMax ?? '',
      jobDescription: item.jobDescription || '',
      responsibilities: item.responsibilities || '',
      status: item.status || 'active',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(`/hr/designations/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const getDeptName = (dept) => {
    if (!dept) return '-';
    if (typeof dept === 'object') return dept.departmentName || dept.departmentCode || '-';
    const found = departments.find(d => d._id === dept);
    return found ? (found.departmentName || found.departmentCode || dept) : dept;
  };

  const levelColors = { entry: 'bg-blue-100 text-blue-700', mid: 'bg-green-100 text-green-700', senior: 'bg-purple-100 text-purple-700', manager: 'bg-amber-100 text-amber-700' };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Designations</h1><p className="mt-1 text-sm text-slate-500">Manage job titles and designations</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add New'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white/40 backdrop-blur-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input value={form.designationTitle} onChange={e => setForm({ ...form, designationTitle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName || d.departmentCode}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Job Level</label>
              <select value={form.jobLevel} onChange={e => setForm({ ...form, jobLevel: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Min Qualification</label><input value={form.minQualification} onChange={e => setForm({ ...form, minQualification: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Salary Min</label><input type="number" value={form.salaryRangeMin} onChange={e => setForm({ ...form, salaryRangeMin: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Salary Max</label><input type="number" value={form.salaryRangeMax} onChange={e => setForm({ ...form, salaryRangeMax: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Job Description</label><textarea value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/40 backdrop-blur-xl shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Title</th><th className="px-5 py-3 font-semibold text-slate-600">Department</th><th className="px-5 py-3 font-semibold text-slate-600">Level</th><th className="px-5 py-3 font-semibold text-slate-600">Salary Range</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No records found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{item.designationTitle || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{getDeptName(item.department)}</td>
                <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColors[item.jobLevel] || 'bg-slate-100 text-slate-600'}`}>{item.jobLevel || 'entry'}</span></td>
                <td className="px-5 py-3 text-slate-600">{item.salaryRangeMin || item.salaryRangeMax ? `${item.salaryRangeMin || '?'} - ${item.salaryRangeMax || '?'}` : '-'}</td>
                <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status || 'active'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Designations;
