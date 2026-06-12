import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminHostelMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mealType: 'breakfast', menu: '', date: '', cost: '', notes: '' });

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/hostel/meals'); setMeals(Array.isArray(data) ? data : data.data || []); }
      catch { setMeals([]); } finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/hostel/meals', form); setShowForm(false); const { data } = await api.get('/hostel/meals'); setMeals(Array.isArray(data) ? data : data.data || []); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal record?')) return;
    try { await api.delete(`/hostel/meals/${id}`); setMeals(prev => prev.filter(m => m._id !== id)); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Hostel Meals</h1><p className="mt-1 text-sm text-slate-500">Plan and track hostel meal schedules</p></div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add Meal'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Meal Type</label><select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>breakfast</option><option>lunch</option><option>dinner</option><option>snack</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Menu</label><input value={form.menu} onChange={e => setForm({ ...form, menu: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Cost per Person</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Notes</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">Save Meal</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Meal</th><th className="px-5 py-3 font-semibold text-slate-600">Menu</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Cost</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {meals.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No meals</td></tr>}
            {meals.map(m => (
              <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800 capitalize">{m.mealType}</td>
                <td className="px-5 py-3 text-slate-600">{m.menu || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{m.date ? new Date(m.date).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3 text-slate-600">{m.cost || '-'}</td>
                <td className="px-5 py-3"><button onClick={() => handleDelete(m._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHostelMeals;
