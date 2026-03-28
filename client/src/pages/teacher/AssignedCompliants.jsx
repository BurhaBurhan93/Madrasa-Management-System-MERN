import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import { FiEye, FiCheck } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = { open: 'bg-red-100 text-red-700', in_progress: 'bg-yellow-100 text-yellow-700', closed: 'bg-green-100 text-green-700' };
const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' };

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/complaints', api());
      if (res.data.success) setComplaints(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/complaints/${id}/status`, { status }, api());
      if (res.data.success) { fetchComplaints(); setSelected(null); }
    } catch (e) { alert('Failed to update complaint'); }
  };

  const filtered = complaints.filter(c => {
    const matchStatus = filterStatus === '' || c.complaintStatus === filterStatus;
    const matchSearch = c.subject?.toLowerCase().includes(search.toLowerCase()) || c.complaintCode?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.complaintStatus === 'open').length,
    inProgress: complaints.filter(c => c.complaintStatus === 'in_progress').length,
    closed: complaints.filter(c => c.complaintStatus === 'closed').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Complaints</h1>
        <p className="text-gray-500">Complaints assigned to you for resolution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700' },
          { label: 'Open', value: stats.open, color: 'text-red-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600' },
          { label: 'Closed', value: stats.closed, color: 'text-green-600' },
        ].map(c => (
          <Card key={c.label} className="text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 flex-1" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No complaints assigned to you</td></tr>
              ) : filtered.map(c => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-green-600">{c.complaintCode}</td>
                  <td className="p-3">{c.subject}</td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityColors[c.priorityLevel]}`}>{c.priorityLevel}</span></td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[c.complaintStatus]}`}>{c.complaintStatus}</span></td>
                  <td className="p-3 text-gray-500">{new Date(c.submittedDate).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => setSelected(c)} className="text-blue-600 hover:text-blue-800"><FiEye size={18} /></button>
                    {c.complaintStatus !== 'closed' && (
                      <button onClick={() => updateStatus(c._id, 'closed')} className="text-green-600 hover:text-green-800"><FiCheck size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Code:</span> {selected.complaintCode}</p>
              <p><span className="font-medium">Category:</span> {selected.complaintCategory || '-'}</p>
              <p><span className="font-medium">Priority:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[selected.priorityLevel]}`}>{selected.priorityLevel}</span></p>
              <p><span className="font-medium">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selected.complaintStatus]}`}>{selected.complaintStatus}</span></p>
              <p><span className="font-medium">Description:</span></p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.description || 'No description'}</p>
            </div>
            {selected.complaintStatus !== 'closed' && (
              <div className="flex gap-3 justify-end pt-2">
                {selected.complaintStatus === 'open' && (
                  <Button variant="secondary" onClick={() => updateStatus(selected._id, 'in_progress')}>Mark In Progress</Button>
                )}
                <Button onClick={() => updateStatus(selected._id, 'closed')}>Mark Resolved</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
