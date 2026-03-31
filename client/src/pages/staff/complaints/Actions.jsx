import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';

const StaffComplaintActions = () => {
  const [actions, setActions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: '', complaint: '', actionDescription: '', actionResult: '', followUpDate: '', nextActionRequired: false });
  const [search, setSearch] = useState('');

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [actionsResponse, complaintsResponse] = await Promise.all([
        axios.get(`${API_BASE}/staff/complaint-actions`, getConfig()),
        axios.get(`${API_BASE}/staff/complaints`, getConfig())
      ]);
      setActions(actionsResponse.data || []);
      setComplaints(complaintsResponse.data || []);
    } catch (err) {
      setError('Failed to fetch complaint actions. Please try again.');
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
    return actions.filter((action) => {
      const subject = action.complaint?.subject || '';
      const code = action.complaint?.complaintCode || '';
      return subject.toLowerCase().includes(query) || code.toLowerCase().includes(query);
    });
  }, [actions, search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      complaint: form.complaint,
      actionDescription: form.actionDescription,
      actionResult: form.actionResult,
      followUpDate: form.followUpDate || null,
      nextActionRequired: form.nextActionRequired
    };

    try {
      if (form.id) {
        await axios.put(`${API_BASE}/staff/complaint-actions/${form.id}`, payload, getConfig());
      } else {
        await axios.post(`${API_BASE}/staff/complaint-actions`, payload, getConfig());
      }
      setForm({ id: '', complaint: '', actionDescription: '', actionResult: '', followUpDate: '', nextActionRequired: false });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save complaint action.');
    }
  };

  const onEdit = (action) => {
    setForm({
      id: action._id,
      complaint: action.complaint?._id || '',
      actionDescription: action.actionDescription || '',
      actionResult: action.actionResult || '',
      followUpDate: action.followUpDate ? new Date(action.followUpDate).toISOString().split('T')[0] : '',
      nextActionRequired: !!action.nextActionRequired
    });
  };

  const onDelete = async (id) => {
    await axios.delete(`${API_BASE}/staff/complaint-actions/${id}`, getConfig());
    await fetchData();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Actions</h1>
        <p className="text-gray-600">Create and edit action records stored in the database</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="server"
          title="Unable to Load Complaint Actions"
          message={error}
          onRetry={fetchData}
          onHome={() => { window.location.href = '/staff/dashboard'; }}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading actions...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Action' : 'Add Action'}</h2>
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
              <Input label="Action Description" value={form.actionDescription} onChange={(e) => setForm({ ...form, actionDescription: e.target.value })} />
              <Input label="Action Result" value={form.actionResult} onChange={(e) => setForm({ ...form, actionResult: e.target.value })} />
              <Input label="Follow Up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.nextActionRequired} onChange={(e) => setForm({ ...form, nextActionRequired: e.target.checked })} />
                Next action required
              </label>
              <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Action Records</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaint" className="px-3 py-2 border rounded" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Complaint</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Follow Up</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((action) => (
                    <tr key={action._id}>
                      <td className="px-4 py-2">{action.complaint?.complaintCode || '-'}</td>
                      <td className="px-4 py-2">{action.actionDescription || '-'}</td>
                      <td className="px-4 py-2">{action.actionResult || '-'}</td>
                      <td className="px-4 py-2">{action.followUpDate ? new Date(action.followUpDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onEdit(action)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(action._id)}>Delete</Button>
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

export default StaffComplaintActions;
