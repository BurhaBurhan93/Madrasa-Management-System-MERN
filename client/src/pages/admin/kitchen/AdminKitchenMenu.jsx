import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const WeeklyMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ day: '', breakfast: '', lunch: '', dinner: '', snacks: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/kitchen/menu'); setItems(Array.isArray(data) ? data : data.data || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/kitchen/menu/${editingId}`, form); else await api.post('/kitchen/menu', form); setShowForm(false); setEditingId(null); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ day: item.day || '', breakfast: item.breakfast || '', lunch: item.lunch || '', dinner: item.dinner || '', snacks: item.snacks || '' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`/kitchen/menu/${id}`); fetchData(); } catch (err) { console.error(err); } };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Weekly Menu</h1><p className="mt-1 text-sm text-slate-500">Manage weekly menu schedule</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ day: '', breakfast: '', lunch: '', dinner: '', snacks: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add New'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Day</label><input value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Breakfast</label><input value={form.breakfast} onChange={e => setForm({ ...form, breakfast: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Lunch</label><input value={form.lunch} onChange={e => setForm({ ...form, lunch: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Dinner</label><input value={form.dinner} onChange={e => setForm({ ...form, dinner: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Snacks</label><input value={form.snacks} onChange={e => setForm({ ...form, snacks: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"  /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Day</th><th className="px-5 py-3 font-semibold text-slate-600">Breakfast</th><th className="px-5 py-3 font-semibold text-slate-600">Lunch</th><th className="px-5 py-3 font-semibold text-slate-600">Dinner</th><th className="px-5 py-3 font-semibold text-slate-600">Snacks</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No records found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{item.day || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.breakfast || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.lunch || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.dinner || '-'}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyMenu;
