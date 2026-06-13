import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const AdminHostelAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', studentId: '', roomNumber: '', block: '', checkInDate: '', checkOutDate: '' });

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/hostel/allocations'); setAllocations(Array.isArray(data) ? data : data.data || []); }
      catch { setAllocations([]); } finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/hostel/allocations', form); setShowForm(false); setForm({ studentName: '', studentId: '', roomNumber: '', block: '', checkInDate: '', checkOutDate: '' }); const { data } = await api.get('/hostel/allocations'); setAllocations(Array.isArray(data) ? data : data.data || []); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this allocation?')) return;
    try { await api.delete(`/hostel/allocations/${id}`); setAllocations(prev => prev.filter(a => a._id !== id)); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Room Allocations</h1><p className="mt-1 text-sm text-slate-500">Assign students to hostel rooms</p></div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Allocate Room'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Student Name</label><input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Room Number</label><input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Block</label><input value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Check-in Date</label><CalendarDatePicker value={form.checkInDate} onChange={(date) => setForm({ ...form, checkInDate: date })} placeholder="Select date" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Check-out Date</label><CalendarDatePicker value={form.checkOutDate} onChange={(date) => setForm({ ...form, checkOutDate: date })} placeholder="Select date" /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">Allocate</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Student</th><th className="px-5 py-3 font-semibold text-slate-600">Room</th><th className="px-5 py-3 font-semibold text-slate-600">Block</th><th className="px-5 py-3 font-semibold text-slate-600">Check-in</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {allocations.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No allocations</td></tr>}
            {allocations.map(a => (
              <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{a.studentName || a.student?.name || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{a.roomNumber || a.room?.roomNumber || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{a.block || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{a.checkInDate ? new Date(a.checkInDate).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><button onClick={() => handleDelete(a._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHostelAllocations;
