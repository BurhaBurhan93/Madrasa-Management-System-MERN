import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminHostelRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', block: '', floor: '', capacity: 4, type: 'shared', status: 'available', facilities: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/hostel/rooms'); setRooms(Array.isArray(data) ? data : data.data || []); }
    catch { setRooms([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/hostel/rooms/${editingId}`, form);
      else await api.post('/hostel/rooms', form);
      setShowForm(false); setEditingId(null); fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (r) => { setForm({ roomNumber: r.roomNumber || '', block: r.block || '', floor: r.floor || '', capacity: r.capacity || 4, type: r.type || 'shared', status: r.status || 'available', facilities: r.facilities || '' }); setEditingId(r._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this room?')) return; try { await api.delete(`/hostel/rooms/${id}`); fetchData(); } catch (err) { console.error(err); } };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Hostel Rooms</h1><p className="mt-1 text-sm text-slate-500">Manage hostel rooms and capacity</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ roomNumber: '', block: '', floor: '', capacity: 4, type: 'shared', status: 'available', facilities: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add Room'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Room Number</label><input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Block</label><input value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Floor</label><input value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>shared</option><option>single</option><option>dormitory</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>available</option><option>occupied</option><option>maintenance</option></select></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'} Room</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Room #</th><th className="px-5 py-3 font-semibold text-slate-600">Block</th><th className="px-5 py-3 font-semibold text-slate-600">Floor</th><th className="px-5 py-3 font-semibold text-slate-600">Capacity</th><th className="px-5 py-3 font-semibold text-slate-600">Type</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {rooms.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No rooms found</td></tr>}
            {rooms.map(r => (
              <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{r.roomNumber}</td>
                <td className="px-5 py-3 text-slate-600">{r.block || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{r.floor || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{r.capacity}</td>
                <td className="px-5 py-3 text-slate-600">{r.type}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'available' ? 'bg-emerald-50 text-emerald-700' : r.status === 'occupied' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{r.status}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(r)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(r._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHostelRooms;
