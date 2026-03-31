import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import Badge from '../components/UIHelper/Badge';
import { FiPlus, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { BarChartComponent } from '../components/UIHelper/Chart';
import axios from 'axios';

const StudentLeave = () => {
  console.log('[StudentLeave] Component initializing...');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalDays: 0
  });

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'family', label: 'Family Emergency' },
    { value: 'personal', label: 'Personal' },
    { value: 'religious', label: 'Religious Observance' },
    { value: 'academic', label: 'Academic Event' },
    { value: 'other', label: 'Other' }
  ];

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentLeave] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentLeave] Fetching leave records from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/leaves', config);
      
      console.log('[StudentLeave] API response:', response.data);
      const leaves = response.data || [];
      setLeaveHistory(leaves);
      
      // Calculate stats
      const totalDays = leaves.reduce((acc, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
      
      console.log('[StudentLeave] Calculated total days:', totalDays);
      setStats({
        totalRequests: leaves.length,
        approved: leaves.filter(l => l.approvalStatus === 'approved').length,
        pending: leaves.filter(l => l.approvalStatus === 'pending').length,
        rejected: leaves.filter(l => l.approvalStatus === 'rejected').length,
        totalDays
      });
      console.log('[StudentLeave] Stats set successfully');
    } catch (err) {
      console.error('[StudentLeave] Error fetching leave data:', err);
      setError('Failed to fetch leave records. Please try again.');
      setLeaveHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[StudentLeave] useEffect triggered - fetching data from API...');
    fetchLeaveData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`[StudentLeave] Input changed - ${name}:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[StudentLeave] Form submitted:', formData);
    
    try {
      setLoading(true);
      const config = getConfig();
      
      console.log('[StudentLeave] Sending POST request to API...');
      const response = await axios.post('http://localhost:5000/api/student/leaves', formData, config);
      
      console.log('[StudentLeave] Leave created successfully:', response.data);
      
      // Refresh the leave data
      await fetchLeaveData();
      
      // Reset form
      setShowForm(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      
      alert('Leave request submitted successfully!');
    } catch (err) {
      console.error('[StudentLeave] Error creating leave:', err);
      alert('Error submitting leave request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <FiClock className="text-yellow-600" size={20} />;
      case 'rejected':
        return <FiXCircle className="text-red-600" size={20} />;
      default:
        return <FiAlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getLeaveTypeLabel = (type) => {
    const found = leaveTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  // Calculate monthly data from actual leave records
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => ({ month, requests: 0 }));
    
    leaveHistory.forEach(leave => {
      const date = new Date(leave.startDate);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        data[monthIndex].requests++;
      }
    });
    
    // Return last 6 months
    return data.slice(-6);
  }, [leaveHistory]);

  console.log('[StudentLeave] Rendering with', leaveHistory.length, 'records');

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600 mt-1">Apply for leave and track your leave history</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalDays}</div>
          <div className="text-sm text-gray-600">Total Days</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Request Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
            <Button onClick={() => setShowForm(!showForm)} variant="primary" disabled={loading}>
              <FiPlus className="mr-2" />
              {showForm ? 'Cancel' : 'New Leave Request'}
            </Button>
          </div>

          {/* Leave Request Form */}
          {showForm && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Leave Type"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    options={[{ value: '', label: 'Select leave type' }, ...leaveTypes]}
                    required
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="flex items-end">
                    {formData.startDate && formData.endDate && (
                      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
                        Duration: {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a detailed reason for your leave request..."
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Leave History Table */}
          <Card>
            {loading && leaveHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading leave records...</p>
              </div>
            ) : leaveHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No leave requests found. Apply for your first leave above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveHistory.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(leave.approvalStatus)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {getLeaveTypeLabel(leave.leaveType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{new Date(leave.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(leave.endDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                          <div className="truncate" title={leave.reason}>{leave.reason}</div>
                          {leave.remarks && (
                            <div className="text-xs text-gray-400 mt-1">Note: {leave.remarks}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(leave.approvalStatus)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {leave.requestedAt ? new Date(leave.requestedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Monthly Requests">
            <BarChartComponent 
              data={monthlyData}
              dataKey="requests"
              nameKey="month"
              title="Leave Requests by Month"
            />
          </Card>

          <Card title="Leave Policy">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Apply at least 3 days in advance for planned leaves</span>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Sick leaves can be applied with medical certificate</span>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Maximum 15 days leave per semester</span>
              </div>
              <div className="flex items-start">
                <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Unauthorized absences may affect attendance record</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentLeave;
