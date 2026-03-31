import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const StaffComplaintsList = () => {
  console.log('[StaffComplaintsList] Component initializing...');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', search: '' });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StaffComplaintsList] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StaffComplaintsList] useEffect triggered - fetching data from API...');
    fetchComplaintsData();
  }, []);

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StaffComplaintsList] Fetching complaints from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/complaints', config);
      
      console.log('[StaffComplaintsList] Complaints API response:', response.data);
      
      // Transform API data to match component structure
      const formattedComplaints = (response.data || []).map((c, index) => ({
        id: c._id || `c${index}`,
        title: c.subject || 'Untitled Complaint',
        category: c.complaintCategory || 'General',
        priority: c.priorityLevel || 'medium',
        status: c.complaintStatus === 'in_progress' ? 'in-progress' : c.complaintStatus || 'open',
        assignedTo: c.assignedTo?.name || c.assignedTo || 'Unassigned',
        date: c.submittedDate ? new Date(c.submittedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: c.description || ''
      }));
      
      setComplaints(formattedComplaints);
    } catch (err) {
      console.error('[StaffComplaintsList] Error fetching complaints:', err);
      setError('Failed to fetch complaints. Please try again.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, newStatus) => {
    console.log(`[StaffComplaintsList] Changing status for complaint ${id} to ${newStatus}`);
    try {
      const config = getConfig();
      await axios.put(`http://localhost:5000/api/staff/complaints/${id}`, { 
        status: newStatus 
      }, config);
      
      // Update local state
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
      console.log('[StaffComplaintsList] Status updated successfully');
    } catch (err) {
      console.error('[StaffComplaintsList] Error updating complaint status:', err);
      alert('Failed to update complaint status. Please try again.');
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600">Manage and track complaints</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Complaints Data Unavailable"
          message={error}
          onRetry={fetchComplaintsData}
          onHome={() => window.location.href = '/staff/dashboard'}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      ) : (
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input className="px-3 py-2 border rounded" placeholder="Search" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
          <select className="px-3 py-2 border rounded" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select className="px-3 py-2 border rounded" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="px-3 py-2 border rounded" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="all">All Categories</option>
            <option value="Facility">Facility</option>
            <option value="Environment">Environment</option>
            <option value="Academic">Academic</option>
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
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.priority === 'high' ? 'bg-red-100 text-red-800' : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'open' ? 'bg-gray-200 text-gray-800' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{c.assignedTo}</td>
                  <td className="px-4 py-2">{c.date}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => changeStatus(c.id, 'in-progress')}>In Progress</Button>
                      <Button size="sm" variant="secondary" onClick={() => changeStatus(c.id, 'closed')}>Close</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
};

export default StaffComplaintsList;
