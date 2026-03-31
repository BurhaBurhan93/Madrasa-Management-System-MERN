import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Badge from '../components/UIHelper/Badge';
import ErrorPage from '../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';
const POLL_INTERVAL = 10000;

const mapComplaint = (complaint) => ({
  id: complaint._id,
  title: complaint.subject || 'Untitled Complaint',
  category: complaint.complaintCategory || 'General',
  priority: complaint.priorityLevel || 'medium',
  status: complaint.complaintStatus === 'in_progress' ? 'in-progress' : complaint.complaintStatus || 'open',
  description: complaint.description || '',
  submittedDate: complaint.submittedDate || complaint.createdAt,
  closedAt: complaint.closedAt
});

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    title: '',
    category: 'Academic',
    priority: 'medium',
    description: ''
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchComplaints = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const response = await axios.get(`${API_BASE}/student/complaints`, getConfig());
      setComplaints((response.data || []).map(mapComplaint));
    } catch (err) {
      setError('Failed to load complaints. Please try again.');
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
    fetchComplaints();
    const intervalId = window.setInterval(() => fetchComplaints({ silent: true }), POLL_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/student/complaints`, complaintData, getConfig());
      setShowComplaintModal(false);
      setComplaintData({
        title: '',
        category: 'Academic',
        priority: 'medium',
        description: ''
      });
      await fetchComplaints({ silent: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed':
        return 'success';
      case 'open':
        return 'warning';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints & Feedback</h1>
        <p className="text-gray-600">Submit complaints and follow their live status</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="server"
          title="Unable to Load Complaints"
          message={error}
          onRetry={fetchComplaints}
          onHome={() => { window.location.href = '/student/dashboard'; }}
          showBackButton={false}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{complaints.length}</div>
          <div className="text-sm text-gray-600">Total Complaints</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{complaints.filter((c) => c.status === 'open').length}</div>
          <div className="text-sm text-gray-600">Open</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{complaints.filter((c) => c.status === 'closed').length}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Complaints</h2>
        <Button variant="primary" onClick={() => setShowComplaintModal(true)}>
          Submit New Complaint
        </Button>
      </div>

      {loading && complaints.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <Card key={complaint.id}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                  <p className="text-gray-700">{complaint.description}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Submitted: {formatDate(complaint.submittedDate)}</p>
                  <p>Closed: {formatDate(complaint.closedAt)}</p>
                </div>
              </div>
            </Card>
          ))}
          {complaints.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-600">No complaints submitted yet.</p>
            </Card>
          )}
        </div>
      )}

      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Submit New Complaint</h3>
              <Input
                label="Title"
                name="title"
                value={complaintData.title}
                onChange={(e) => setComplaintData((prev) => ({ ...prev, title: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={complaintData.category}
                  onChange={(e) => setComplaintData((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Academic">Academic</option>
                  <option value="Facility">Facility</option>
                  <option value="Environment">Environment</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={complaintData.priority}
                  onChange={(e) => setComplaintData((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="5"
                  value={complaintData.description}
                  onChange={(e) => setComplaintData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowComplaintModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;
