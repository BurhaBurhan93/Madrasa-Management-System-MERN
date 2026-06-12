import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const BookSales = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ bookTitle: '', buyerName: '', quantity: '', unitPrice: '', saleDate: '', paymentMethod: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/library/sales'); setItems(Array.isArray(data) ? data : data.data || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/library/sales/${editingId}`, form); else await api.post('/library/sales', form); setShowForm(false); setEditingId(null); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ bookTitle: item.bookTitle || '', buyerName: item.buyerName || '', quantity: item.quantity || '', unitPrice: item.unitPrice || '', saleDate: item.saleDate || '', paymentMethod: item.paymentMethod || '' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`/library/sales/${id}`); fetchData(); } catch (err) { console.error(err); } };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Book Sales</h1><p className="mt-1 text-sm text-slate-500">Track book sales and disposals</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ bookTitle: '', buyerName: '', quantity: '', unitPrice: '', saleDate: '', paymentMethod: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add New'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Book Title</label><input value={form.bookTitle} onChange={e => setForm({ ...form, bookTitle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Buyer Name</label><input value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label><input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Unit Price</label><input value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Sale Date</label><input value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Payment Method</label><input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Book</th><th className="px-5 py-3 font-semibold text-slate-600">Buyer</th><th className="px-5 py-3 font-semibold text-slate-600">Qty</th><th className="px-5 py-3 font-semibold text-slate-600">Price</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No records found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{item.bookTitle || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.buyerName || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.quantity || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.unitPrice || '-'}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookSales;
