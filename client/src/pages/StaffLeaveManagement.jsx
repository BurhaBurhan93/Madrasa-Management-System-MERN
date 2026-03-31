import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorPage from '../components/UIHelper/ErrorPage';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import Badge from '../components/UIHelper/Badge';
import Modal from '../components/UIHelper/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';

const StaffLeaveManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: '',
    leaveReason: '',
    startDate: '',
    endDate: '',
    leaveDays: 0
  });
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDays: 0
  });
  const [error, setError] = useState(null);

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = getConfig();
      
      // Fetch leave types
      const leaveTypesRes = await axios.get('http://localhost:5000/api/hr/leave-types', config);
      setLeaveTypes(leaveTypesRes.data || []);
      
      // Fetch employees
      const employeesRes = await axios.get('http://localhost:5000/api/hr/employees', config);
      setEmployees(employeesRes.data || []);
      
      // Fetch leave requests
      const leavesRes = await axios.get('http://localhost:5000/api/hr/leaves', config);
      const leaves = leavesRes.data || [];
      setLeaveRequests(leaves);
      
      // Calculate stats
      calculateStats(leaves);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leaves) => {
    const totalDays = leaves.reduce((acc, leave) => acc + (leave.leaveDays || 0), 0);
    setStats({
      totalRequests: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      totalDays
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateLeaveDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const leaveDays = calculateLeaveDays(formData.startDate, formData.endDate);
      const config = getConfig();
      
      const leaveData = {
        employee: formData.employee,
        leaveType: formData.leaveType,
        leaveReason: formData.leaveReason,
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveDays
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/hr/leaves/${editingId}`, leaveData, config);
      } else {
        await axios.post('http://localhost:5000/api/hr/leaves', leaveData, config);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ employee: '', leaveType: '', leaveReason: '', startDate: '', endDate: '', leaveDays: 0 });
      fetchData();
    } catch (err) {
      console.error('Error saving leave request:', err);
      alert('Failed to save leave request. Please try again.');
    }
  };

  const handleEdit = (leave) => {
    setFormData({
      employee: leave.employee?._id || '',
      leaveType: leave.leaveType?._id || '',
      leaveReason: leave.leaveReason || '',
      startDate: leave.startDate || '',
      endDate: leave.endDate || '',
      leaveDays: leave.leaveDays || 0
    });
    setEditingId(leave._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        const config = getConfig();
        await axios.delete(`http://localhost:5000/api/hr/leaves/${id}`, config);
        fetchData();
      } catch (err) {
        console.error('Error deleting leave request:', err);
        alert('Failed to delete leave request. Please try again.');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      const config = getConfig();
      await axios.put(`http://localhost:5000/api/hr/leaves/${id}/approve`, {}, config);
      fetchData();
    } catch (err) {
      console.error('Error approving leave request:', err);
      alert('Failed to approve leave request. Please try again.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        const config = getConfig();
        await axios.put(`http://localhost:5000/api/hr/leaves/${id}/reject`, { rejectionReason: reason }, config);
        fetchData();
      } catch (err) {
        console.error('Error rejecting leave request:', err);
        alert('Failed to reject leave request. Please try again.');
      }
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

  const filteredRequests = filterStatus === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status === filterStatus);

  const statusDistribution = [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Approved', value: stats.approved, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
  ].filter(s => s.value > 0);

  const leaveTypeData = leaveTypes.map(type => ({
    name: type.leaveTypeName || type.name,
    value: leaveRequests.filter(r => r.leaveType?._id === type._id).length
  })).filter(d => d.value > 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Leave Management</h1>
        <p className="text-gray-600 mt-1">Manage employee leave requests and approvals</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Leave Management Unavailable"
          message={error}
          onRetry={fetchData}
          onHome={() => window.location.href = '/staff/dashboard'}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leave data...</p>
        </div>
      ) : (
      <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full"><FiCalendar className="w-6 h-6 text-blue-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full"><FiClock className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FiCheckCircle className="w-6 h-6 text-green-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full"><FiXCircle className="w-6 h-6 text-red-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDays}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><FiCalendar className="w-6 h-6 text-purple-600" /></div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Leave Status Distribution">
          {statusDistribution.length > 0 ? (
            <PieChartComponent 
              data={statusDistribution}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          ) : (
            <p className="text-center py-8 text-gray-500">No data available</p>
          )}
        </Card>
        <Card title="Leave by Type">
          {leaveTypeData.length > 0 ? (
            <BarChartComponent 
              data={leaveTypeData}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          ) : (
            <p className="text-center py-8 text-gray-500">No data available</p>
          )}
        </Card>
      </div>

      {/* Filter and Add Button */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex space-x-2">
          <Button 
            variant={filterStatus === 'all' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={filterStatus === 'approved' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </Button>
          <Button 
            variant={filterStatus === 'rejected' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </Button>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <FiPlus className="mr-2" /> Add Leave Request
        </Button>
      </div>

      {/* Leave Requests Table */}
      <Card title="Leave Requests">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No leave requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <FiUser className="text-blue-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{leave.employee?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{leave.leaveType?.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                      <div className="text-xs">{leave.leaveDays} days</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate" title={leave.leaveReason}>
                      {leave.leaveReason}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(leave.status)}</td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        {leave.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(leave._id)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleReject(leave._id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <FiXCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleEdit(leave)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(leave._id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
          setFormData({ employee: '', leaveType: '', leaveReason: '', startDate: '', endDate: '', leaveDays: 0 });
        }}
        title={editingId ? 'Edit Leave Request' : 'Add Leave Request'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select Employee' },
              ...employees.map(emp => ({ value: emp._id, label: emp.name }))
            ]}
            required
          />
          <Select
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select Leave Type' },
              ...leaveTypes.map(lt => ({ value: lt._id, label: `${lt.name} (${lt.daysAllowed} days)` }))
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          {formData.startDate && formData.endDate && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
              Total Days: {calculateLeaveDays(formData.startDate, formData.endDate)}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              name="leaveReason"
              value={formData.leaveReason}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for leave..."
              required
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <Button type="submit">
              {editingId ? 'Update Request' : 'Submit Request'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
                setFormData({ employee: '', leaveType: '', leaveReason: '', startDate: '', endDate: '', leaveDays: 0 });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
    )}
    </div>
  );
};

export default StaffLeaveManagement;
