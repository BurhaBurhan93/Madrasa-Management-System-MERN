import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminSalaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ employeeName: '', designation: '', basicSalary: '', allowances: '', deductions: '', month: '', status: 'pending' });

  const fetchData = async () => {
    try { const { data } = await api.get('/payroll/salary-payments'); setSalaries(Array.isArray(data) ? data : data.data || []); }
    catch { setSalaries([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/payroll/salary-payments/${editingId}`, form); else await api.post('/payroll/salary-payments', form); setShowForm(false); setEditingId(null); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ employeeName: item.employeeName || '', designation: item.designation || '', basicSalary: item.basicSalary || '', allowances: item.allowances || '', deductions: item.deductions || '', month: item.month || '', status: item.status || 'pending' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`/payroll/salary-payments/${id}`); fetchData(); } catch (err) { console.error(err); } };

  const totalPayable = salaries.filter(s => s.status !== 'paid').reduce((sum, s) => sum + ((parseFloat(s.basicSalary) || 0) + (parseFloat(s.allowances) || 0) - (parseFloat(s.deductions) || 0)), 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Salaries</h1><p className="mt-1 text-sm text-slate-500">Manage employee salary records and payments</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ employeeName: '', designation: '', basicSalary: '', allowances: '', deductions: '', month: '', status: 'pending' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add Salary'}</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium text-slate-500">Total Records</p><p className="mt-1 text-2xl font-bold text-slate-900">{salaries.length}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Total Payable</p><p className="mt-1 text-2xl font-bold text-amber-700">₨ {totalPayable.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Paid</p><p className="mt-1 text-2xl font-bold text-emerald-700">{salaries.filter(s => s.status === 'paid').length}</p></div>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Employee Name</label><input value={form.employeeName} onChange={e => setForm({ ...form, employeeName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Designation</label><input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Basic Salary</label><input type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Allowances</label><input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Deductions</label><input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Month</label><input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Add'} Salary</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Employee</th><th className="px-5 py-3 font-semibold text-slate-600">Basic</th><th className="px-5 py-3 font-semibold text-slate-600">Allowances</th><th className="px-5 py-3 font-semibold text-slate-600">Deductions</th><th className="px-5 py-3 font-semibold text-slate-600">Net</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {salaries.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No salary records</td></tr>}
            {salaries.map(s => { const net = (parseFloat(s.basicSalary)||0) + (parseFloat(s.allowances)||0) - (parseFloat(s.deductions)||0); return (
              <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{s.employeeName || '-'}</td>
                <td className="px-5 py-3 text-slate-600">₨ {(s.basicSalary||0).toLocaleString()}</td>
                <td className="px-5 py-3 text-emerald-600">+₨ {(s.allowances||0).toLocaleString()}</td>
                <td className="px-5 py-3 text-rose-600">-₨ {(s.deductions||0).toLocaleString()}</td>
                <td className="px-5 py-3 font-bold text-slate-800">₨ {net.toLocaleString()}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${s.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status || 'pending'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(s)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(s._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSalaries;
