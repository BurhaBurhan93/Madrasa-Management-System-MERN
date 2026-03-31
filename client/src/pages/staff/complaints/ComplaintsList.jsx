import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';
const POLL_INTERVAL = 10000;

const normalizeComplaint = (complaint) => ({
  id: complaint._id,
  title: complaint.subject || 'Untitled Complaint',
  category: complaint.complaintCategory || 'General',
  priority: complaint.priorityLevel || 'medium',
  status: complaint.complaintStatus === 'in_progress' ? 'in-progress' : complaint.complaintStatus || 'open',
  assignedTo: complaint.assignedTo?.name || 'Unassigned',
  date: complaint.submittedDate || complaint.createdAt,
  description: complaint.description || ''
});

const StaffComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', search: '' });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchComplaintsData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const response = await axios.get(`${API_BASE}/staff/complaints`, getConfig());
      setComplaints((response.data || []).map(normalizeComplaint));
    } catch (err) {
      setError('Failed to fetch complaints. Please try again.');
      if (!silent) {
        setComplaints([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComplaintsData();
    const intervalId = window.setInterval(() => fetchComplaintsData({ silent: true }), POLL_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = useMemo(() => {
    const query = filters.search.toLowerCase();
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query);
      const matchesStatus = filters.status === 'all' || complaint.status === filters.status;
      const matchesPriority = filters.priority === 'all' || complaint.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || complaint.category === filters.category;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [complaints, filters]);

  const changeStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/staff/complaints/${id}`, { status: newStatus }, getConfig());
      await fetchComplaintsData({ silent: true });
    } catch (err) {
      alert('Failed to update complaint status.');
    }
  };

  const categories = [...new Set(complaints.map((c) => c.category))];

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600">Manage and track complaints with live database data</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="server"
          title="Complaints Data Unavailable"
          message={error}
          onRetry={fetchComplaintsData}
          onHome={() => { window.location.href = '/staff/dashboard'; }}
          showBackButton={false}
        />
      )}

      {loading && complaints.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      ) : (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input className="px-3 py-2 border rounded" placeholder="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select className="px-3 py-2 border rounded" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <select className="px-3 py-2 border rounded" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="px-3 py-2 border rounded" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="all">All Categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Assigned</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="px-4 py-2">{complaint.title}</td>
                    <td className="px-4 py-2">{complaint.category}</td>
                    <td className="px-4 py-2">{complaint.priority}</td>
                    <td className="px-4 py-2">{complaint.status}</td>
                    <td className="px-4 py-2">{complaint.assignedTo}</td>
                    <td className="px-4 py-2">{new Date(complaint.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => changeStatus(complaint.id, 'in-progress')}>In Progress</Button>
                        <Button size="sm" variant="secondary" onClick={() => changeStatus(complaint.id, 'closed')}>Close</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No complaints found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StaffComplaintsList;
