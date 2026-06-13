import React, { useState, useEffect } from 'react';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import api from '../../../lib/api';

const LeaveManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/hr/leaves');
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [empRes, ltRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/leave-types'),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []);
      setLeaveTypes(Array.isArray(ltRes.data) ? ltRes.data : ltRes.data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchData(); fetchOptions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, leaveDays: form.leaveDays ? Number(form.leaveDays) : undefined };
    try {
      if (editingId) await api.put(`/hr/leaves/${editingId}`, payload);
      else await api.post('/hr/leaves', payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      employee: typeof item.employee === 'object' ? (item.employee?._id || '') : (item.employee || ''),
      leaveType: typeof item.leaveType === 'object' ? (item.leaveType?._id || '') : (item.leaveType || ''),
      requestDate: item.requestDate ? new Date(item.requestDate).toISOString().slice(0, 10) : '',
      leaveDays: item.leaveDays ?? '',
      leaveReason: item.leaveReason || '',
      status: item.status || 'pending',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(`/hr/leaves/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const getEmployeeName = (emp) => {
    if (!emp) return '-';
    if (typeof emp === 'object') return emp.fullName || emp.employeeCode || '-';
    const found = employees.find(e => e._id === emp);
    return found ? (found.fullName || found.employeeCode || emp) : emp;
  };

  const getLeaveTypeName = (lt) => {
    if (!lt) return '-';
    if (typeof lt === 'object') return lt.leaveTypeName || lt.leaveCode || lt.name || '-';
    const found = leaveTypes.find(l => l._id === lt);
    return found ? (found.leaveTypeName || found.leaveCode || found.name || lt) : lt;
  };

  const statusColors = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Leave Management</h1><p className="mt-1 text-sm text-slate-500">Manage employee leave requests and balances</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ Add New'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white/40 backdrop-blur-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Employee</label>
              <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.fullName || e.employeeCode}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">Select Leave Type</option>
                {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.leaveTypeName || lt.leaveCode || lt.name}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Request Date</label><CalendarDatePicker value={form.requestDate} onChange={(date) => setForm({ ...form, requestDate: date })} placeholder="Select request date" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Leave Days</label><input type="number" min="1" value={form.leaveDays} onChange={e => setForm({ ...form, leaveDays: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-3"><label className="mb-1 block text-sm font-medium text-slate-700">Reason</label><textarea value={form.leaveReason} onChange={e => setForm({ ...form, leaveReason: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/40 backdrop-blur-xl shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Employee</th><th className="px-5 py-3 font-semibold text-slate-600">Type</th><th className="px-5 py-3 font-semibold text-slate-600">Request Date</th><th className="px-5 py-3 font-semibold text-slate-600">Days</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No records found</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-600">{getEmployeeName(item.employee)}</td>
                <td className="px-5 py-3 text-slate-600">{getLeaveTypeName(item.leaveType)}</td>
                <td className="px-5 py-3 text-slate-600">{item.requestDate ? new Date(item.requestDate).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3 text-slate-600">{item.leaveDays ?? '-'}</td>
                <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>{item.status || 'pending'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">Edit</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement;
