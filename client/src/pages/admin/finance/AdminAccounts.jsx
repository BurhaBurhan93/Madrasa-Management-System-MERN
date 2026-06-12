import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'bank', accountNumber: '', bankName: '', balance: '', description: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/finance/accounts'); setAccounts(Array.isArray(data) ? data : data.data || []); }
    catch { setAccounts([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/finance/accounts/${editingId}`, form);
      else await api.post('/finance/accounts', form);
      setShowForm(false); setEditingId(null); fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => { setForm({ name: item.name || '', type: item.type || 'bank', accountNumber: item.accountNumber || '', bankName: item.bankName || '', balance: item.balance || '', description: item.description || '' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this account?')) return; try { await api.delete(`/finance/accounts/${id}`); fetchData(); } catch (err) { console.error(err); } };

  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Accounts</h1><p className="mt-1 text-sm text-slate-500">Manage bank and cash accounts</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', type: 'bank', accountNumber: '', bankName: '', balance: '', description: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add Account'}</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium text-slate-500">Total Accounts</p><p className="mt-1 text-2xl font-bold text-slate-900">{accounts.length}</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Total Balance</p><p className="mt-1 text-2xl font-bold text-cyan-700">₨ {totalBalance.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Active Accounts</p><p className="mt-1 text-2xl font-bold text-emerald-700">{accounts.filter(a => a.status !== 'inactive').length}</p></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Account Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="bank">Bank</option><option value="cash">Cash</option><option value="mobile">Mobile Wallet</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Account Number</label><input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Bank Name</label><input value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Opening Balance</label><input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'} Account</button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Name</th><th className="px-5 py-3 font-semibold text-slate-600">Type</th><th className="px-5 py-3 font-semibold text-slate-600">Account #</th><th className="px-5 py-3 font-semibold text-slate-600">Balance</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {accounts.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No accounts found</td></tr>}
            {accounts.map(a => (
              <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{a.name}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{a.type || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{a.accountNumber || '-'}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">₨ {(a.balance || 0).toLocaleString()}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(a)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(a._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccounts;
