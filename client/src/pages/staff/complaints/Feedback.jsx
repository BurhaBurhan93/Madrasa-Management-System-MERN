import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';

const StaffComplaintFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: '', complaint: '', satisfactionLevel: 5, comments: '', feedbackDate: '' });
  const [search, setSearch] = useState('');

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [feedbackResponse, complaintsResponse] = await Promise.all([
        axios.get(`${API_BASE}/staff/complaint-feedbacks`, getConfig()),
        axios.get(`${API_BASE}/staff/complaints`, getConfig())
      ]);
      setFeedbacks(feedbackResponse.data || []);
      setComplaints(complaintsResponse.data || []);
    } catch (err) {
      setError('Failed to fetch feedbacks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchData();
    const intervalId = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return feedbacks.filter((feedback) => {
      const subject = feedback.complaint?.subject || '';
      const code = feedback.complaint?.complaintCode || '';
      return subject.toLowerCase().includes(query) || code.toLowerCase().includes(query);
    });
  }, [feedbacks, search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      complaint: form.complaint,
      satisfactionLevel: Number(form.satisfactionLevel),
      comments: form.comments,
      feedbackDate: form.feedbackDate || null
    };

    try {
      if (form.id) {
        await axios.put(`${API_BASE}/staff/complaint-feedbacks/${form.id}`, payload, getConfig());
      } else {
        await axios.post(`${API_BASE}/staff/complaint-feedbacks`, payload, getConfig());
      }
      setForm({ id: '', complaint: '', satisfactionLevel: 5, comments: '', feedbackDate: '' });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save complaint feedback.');
    }
  };

  const onEdit = (feedback) => {
    setForm({
      id: feedback._id,
      complaint: feedback.complaint?._id || '',
      satisfactionLevel: feedback.satisfactionLevel || 5,
      comments: feedback.comments || '',
      feedbackDate: feedback.feedbackDate ? new Date(feedback.feedbackDate).toISOString().split('T')[0] : ''
    });
  };

  const onDelete = async (id) => {
    await axios.delete(`${API_BASE}/staff/complaint-feedbacks/${id}`, getConfig());
    await fetchData();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Feedback</h1>
        <p className="text-gray-600">Track satisfaction records from the database</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="server"
          title="Unable to Load Feedback"
          message={error}
          onRetry={fetchData}
          onHome={() => { window.location.href = '/staff/dashboard'; }}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading feedbacks...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Feedback' : 'Add Feedback'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })}>
                  <option value="">Select complaint</option>
                  {complaints.map((complaint) => (
                    <option key={complaint._id} value={complaint._id}>
                      {complaint.complaintCode} - {complaint.subject}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Rating (1-5)" type="number" min={1} max={5} value={form.satisfactionLevel} onChange={(e) => setForm({ ...form, satisfactionLevel: e.target.value })} />
              <Input label="Comment" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
              <Input label="Date" type="date" value={form.feedbackDate} onChange={(e) => setForm({ ...form, feedbackDate: e.target.value })} />
              <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Feedback</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaint" className="px-3 py-2 border rounded" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Complaint</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Comment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((feedback) => (
                    <tr key={feedback._id}>
                      <td className="px-4 py-2">{feedback.complaint?.complaintCode || '-'}</td>
                      <td className="px-4 py-2">{feedback.satisfactionLevel}</td>
                      <td className="px-4 py-2">{feedback.comments || '-'}</td>
                      <td className="px-4 py-2">{feedback.feedbackDate ? new Date(feedback.feedbackDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onEdit(feedback)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(feedback._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffComplaintFeedback;
