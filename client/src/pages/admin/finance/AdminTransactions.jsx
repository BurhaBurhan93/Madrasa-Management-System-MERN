import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/finance/transactions'); setTransactions(Array.isArray(data) ? data : data.data || []); }
    catch { setTransactions([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = transactions.filter(t => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.search && !(t.description || '').toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const totalIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Transactions</h1><p className="mt-1 text-sm text-slate-500">View all financial transactions and ledger entries</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Total Income</p><p className="mt-1 text-2xl font-bold text-emerald-700">₨ {totalIn.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="text-xs font-medium text-rose-600">Total Expense</p><p className="mt-1 text-2xl font-bold text-rose-700">₨ {totalOut.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Net Balance</p><p className="mt-1 text-2xl font-bold text-cyan-700">₨ {(totalIn - totalOut).toLocaleString()}</p></div>
      </div>
      <div className="flex gap-3">
        <input value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} placeholder="Search transactions..." className="rounded-lg border border-slate-300 px-4 py-2 text-sm flex-1" />
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Description</th><th className="px-5 py-3 font-semibold text-slate-600">Category</th><th className="px-5 py-3 font-semibold text-slate-600">Type</th><th className="px-5 py-3 font-semibold text-slate-600">Amount</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No transactions found</td></tr>}
            {filtered.map(t => (
              <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{t.description || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{t.category || '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{t.type || '-'}</span></td>
                <td className={`px-5 py-3 font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>₨ {(t.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;
