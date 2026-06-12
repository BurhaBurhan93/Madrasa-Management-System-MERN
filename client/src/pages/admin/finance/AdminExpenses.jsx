import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', amount: '', date: '', vendor: '', description: '', status: 'pending' });

  const fetchData = async () => {
    try { const { data } = await api.get('/finance/expenses'); setExpenses(Array.isArray(data) ? data : data.data || []); }
    catch { setExpenses([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/finance/expenses/${editingId}`, form); else await api.post('/finance/expenses', form); setShowForm(false); setEditingId(null); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ title: item.title || '', category: item.category || '', amount: item.amount || '', date: item.date || '', vendor: item.vendor || '', description: item.description || '', status: item.status || 'pending' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this expense?')) return; try { await api.delete(`/finance/expenses/${id}`); fetchData(); } catch (err) { console.error(err); } };

  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Expenses</h1><p className="mt-1 text-sm text-slate-500">Track and manage institutional expenses</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', category: '', amount: '', date: '', vendor: '', description: '', status: 'pending' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add Expense'}</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium text-slate-500">Total Expenses</p><p className="mt-1 text-2xl font-bold text-slate-900">₨ {total.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Pending</p><p className="mt-1 text-2xl font-bold text-amber-700">{expenses.filter(e => e.status === 'pending').length}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Approved</p><p className="mt-1 text-2xl font-bold text-emerald-700">{expenses.filter(e => e.status === 'approved').length}</p></div>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Select</option><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Transport</option><option>Equipment</option><option>Other</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Amount</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Vendor</label><input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="paid">Paid</option></select></div>
          </div>
          <div className="mt-3"><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Add'} Expense</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Title</th><th className="px-5 py-3 font-semibold text-slate-600">Category</th><th className="px-5 py-3 font-semibold text-slate-600">Amount</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {expenses.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No expenses found</td></tr>}
            {expenses.map(e => (
              <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{e.title}</td>
                <td className="px-5 py-3 text-slate-600">{e.category || '-'}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">₨ {(e.amount || 0).toLocaleString()}</td>
                <td className="px-5 py-3 text-slate-600">{e.date ? new Date(e.date).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${e.status === 'approved' || e.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : e.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{e.status || 'pending'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(e)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(e._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExpenses;
