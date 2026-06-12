import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminComplaintActions = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionForm, setActionForm] = useState({ complaintId: '', action: '', assignedTo: '', notes: '' });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/complaints');
        const list = Array.isArray(data) ? data : data.data || [];
        setComplaints(list.filter(c => ['pending', 'in-progress'].includes(c.status)));
      } catch { setComplaints([]); } finally { setLoading(false); }
    })();
  }, []);

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/complaints/${actionForm.complaintId}`, { status: actionForm.action, assignedTo: actionForm.assignedTo, adminNotes: actionForm.notes });
      setComplaints(prev => prev.filter(c => c._id !== actionForm.complaintId));
      setActionForm({ complaintId: '', action: '', assignedTo: '', notes: '' });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Complaint Actions</h1><p className="mt-1 text-sm text-slate-500">Assign, escalate, or take action on complaints</p></div>
      {actionForm.complaintId && (
        <form onSubmit={handleAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Action</label><select value={actionForm.action} onChange={e => setActionForm({ ...actionForm, action: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required><option value="">Select</option><option value="in-progress">Start Processing</option><option value="escalated">Escalate</option><option value="resolved">Resolve</option><option value="rejected">Reject</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Assign To</label><input value={actionForm.assignedTo} onChange={e => setActionForm({ ...actionForm, assignedTo: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Notes</label><input value={actionForm.notes} onChange={e => setActionForm({ ...actionForm, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>
          <div className="mt-3 flex gap-2"><button type="submit" className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700">Submit Action</button><button type="button" onClick={() => setActionForm({ complaintId: '', action: '', assignedTo: '', notes: '' })} className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div>
        </form>
      )}
      <div className="space-y-3">
        {complaints.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-400">No complaints requiring action</div>}
        {complaints.map(c => (
          <div key={c._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><p className="font-semibold text-slate-800">{c.subject || c.title || 'Untitled'}</p><p className="text-sm text-slate-500">Status: {c.status} | Priority: {c.priority || 'normal'}</p></div>
            <button onClick={() => setActionForm({ ...actionForm, complaintId: c._id })} className="rounded-lg bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100">Take Action</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaintActions;
