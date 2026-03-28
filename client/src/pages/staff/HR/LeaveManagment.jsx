import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiX, FiCheck, FiXCircle } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '', leaveType: '', leaveReason: '', leaveDays: '', requestDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchLeaves = async (status = '') => {
    try {
      const url = status
        ? `http://localhost:5000/api/hr/leaves?status=${status}`
        : 'http://localhost:5000/api/hr/leaves';
      const res = await axios.get(url, { headers: headers() });
      if (res.data.success) setLeaves(res.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/hr/employees?status=active', { headers: headers() });
      if (res.data.success) setEmployees(res.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/hr/leave-types?status=active', { headers: headers() });
      if (res.data.success) setLeaveTypes(res.data.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/hr/leaves', formData, { headers: headers() });
      if (res.data.success) {
        alert(res.data.message);
        fetchLeaves(filterStatus);
        setShowModal(false);
        setFormData({ employee: '', leaveType: '', leaveReason: '', leaveDays: '', requestDate: new Date().toISOString().split('T')[0] });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/hr/leaves/${id}/approve`, {}, { headers: headers() });
      if (res.data.success) { alert(res.data.message); fetchLeaves(filterStatus); }
    } catch (error) {
      alert('Failed to approve leave');
    }
  };

  const handleReject = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/hr/leaves/${rejectModal.id}/reject`,
        { rejectionReason },
        { headers: headers() }
      );
      if (res.data.success) {
        alert(res.data.message);
        fetchLeaves(filterStatus);
        setRejectModal({ open: false, id: null });
        setRejectionReason('');
      }
    } catch (error) {
      alert('Failed to reject leave');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/hr/leaves/${id}`, { headers: headers() });
      if (res.data.success) { alert(res.data.message); fetchLeaves(filterStatus); }
    } catch (error) {
      alert('Failed to delete leave');
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchLeaves(status);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee leave requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          <FiPlus className="inline mr-2" /> New Leave Request
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === s ? 'bg-cyan-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Leave Type</th>
              <th className="p-3 text-left">Days</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Request Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No leave requests found</td></tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{leave.employee?.fullName}</td>
                  <td className="p-3">{leave.leaveType?.leaveTypeName}</td>
                  <td className="p-3">{leave.leaveDays}</td>
                  <td className="p-3 text-gray-500 max-w-xs truncate">{leave.leaveReason || '-'}</td>
                  <td className="p-3">{new Date(leave.requestDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {leave.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(leave._id)} className="text-green-600 hover:text-green-800" title="Approve">
                          <FiCheck size={18} />
                        </button>
                        <button onClick={() => setRejectModal({ open: true, id: leave._id })} className="text-red-600 hover:text-red-800" title="Reject">
                          <FiXCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(leave._id)} className="text-gray-400 hover:text-gray-600" title="Delete">
                      <FiX size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">New Leave Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee <span className="text-red-500">*</span></label>
                <select name="employee" value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeCode})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type <span className="text-red-500">*</span></label>
                <select name="leaveType" value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.leaveTypeName} ({lt.leaveCode})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={formData.leaveDays} onChange={e => setFormData({ ...formData, leaveDays: e.target.value })} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
                  <input type="date" value={formData.requestDate} onChange={e => setFormData({ ...formData, requestDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea rows="3" value={formData.leaveReason} onChange={e => setFormData({ ...formData, leaveReason: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Leave reason..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit Request'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Reject Leave Request</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <textarea rows="3" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" placeholder="Reason for rejection..." />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setRejectModal({ open: false, id: null })}>Cancel</Button>
              <Button type="button" variant="danger" onClick={handleReject}>Reject</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
