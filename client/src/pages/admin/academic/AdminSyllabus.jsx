import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminSyllabus = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ className: '', subject: '', topic: '', description: '', semester: '', order: 0 });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/academic/syllabus');
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/academic/syllabus/${editingId}`, form); }
      else { await api.post('/academic/syllabus', form); }
      setShowForm(false); setEditingId(null);
      setForm({ className: '', subject: '', topic: '', description: '', semester: '', order: 0 });
      fetchData();
    } catch (err) { console.error('Error saving syllabus:', err); }
  };

  const handleEdit = (item) => {
    setForm({ className: item.className || '', subject: item.subject || '', topic: item.topic || '', description: item.description || '', semester: item.semester || '', order: item.order || 0 });
    setEditingId(item._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this syllabus item?')) return;
    try { await api.delete(`/academic/syllabus/${id}`); fetchData(); } catch (err) { console.error('Error deleting:', err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Syllabus Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage syllabus topics and curriculum content</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ className: '', subject: '', topic: '', description: '', semester: '', order: 0 }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          {showForm ? 'Cancel' : '+ Add Syllabus Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Class</label><input value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Topic</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Semester</label><input value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'} Syllabus</button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Class</th><th className="px-5 py-3 font-semibold text-slate-600">Subject</th><th className="px-5 py-3 font-semibold text-slate-600">Topic</th><th className="px-5 py-3 font-semibold text-slate-600">Semester</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No syllabus items found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{item.className || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.subject || '-'}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{item.topic || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.semester || '-'}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSyllabus;
