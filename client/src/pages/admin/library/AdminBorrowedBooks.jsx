import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const BorrowedBooks = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ bookTitle: '', borrowerName: '', borrowerId: '', borrowDate: '', dueDate: '', status: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/library/borrowed'); setItems(Array.isArray(data) ? data : data.data || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/library/borrowed/${editingId}`, form); else await api.post('/library/borrowed', form); setShowForm(false); setEditingId(null); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ bookTitle: item.bookTitle || '', borrowerName: item.borrowerName || '', borrowerId: item.borrowerId || '', borrowDate: item.borrowDate || '', dueDate: item.dueDate || '', status: item.status || '' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`/library/borrowed/${id}`); fetchData(); } catch (err) { console.error(err); } };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Borrowed Books</h1><p className="mt-1 text-sm text-slate-500">Track all currently borrowed books</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ bookTitle: '', borrowerName: '', borrowerId: '', borrowDate: '', dueDate: '', status: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add New'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Book Title</label><input value={form.bookTitle} onChange={e => setForm({ ...form, bookTitle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Borrower Name</label><input value={form.borrowerName} onChange={e => setForm({ ...form, borrowerName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Borrower Id</label><input value={form.borrowerId} onChange={e => setForm({ ...form, borrowerId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Borrow Date</label><input value={form.borrowDate} onChange={e => setForm({ ...form, borrowDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label><input value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Status</label><input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Book</th><th className="px-5 py-3 font-semibold text-slate-600">Borrower</th><th className="px-5 py-3 font-semibold text-slate-600">Borrow Date</th><th className="px-5 py-3 font-semibold text-slate-600">Due Date</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No records found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{item.bookTitle || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.borrowerName || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.borrowerId || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.borrowDate || '-'}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowedBooks;
