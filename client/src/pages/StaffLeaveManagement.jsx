import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import CalendarDatePicker from "../components/UIHelper/CalendarDatePicker";

const StaffLeaveManagement = () => {
  const { t } = useTranslation(['staff', 'common']);
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
      alert(t('staff.leaveManagement.saveError'));
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
    if (window.confirm(t('staff.leaveManagement.deleteConfirm'))) {
      try {
        const config = getConfig();
        await axios.delete(`http://localhost:5000/api/hr/leaves/${id}`, config);
        fetchData();
      } catch (err) {
        console.error('Error deleting leave request:', err);
        alert(t('staff.leaveManagement.deleteError'));
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
      alert(t('staff.leaveManagement.approveError'));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(t('staff.leaveManagement.rejectionReason'));
    if (reason) {
      try {
        const config = getConfig();
        await axios.put(`http://localhost:5000/api/hr/leaves/${id}/reject`, { rejectionReason: reason }, config);
        fetchData();
      } catch (err) {
        console.error('Error rejecting leave request:', err);
        alert(t('staff.leaveManagement.rejectError'));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{t('staff.leaveManagement.approved')}</Badge>;
      case 'pending':
        return <Badge variant="warning">{t('staff.leaveManagement.pending')}</Badge>;
      case 'rejected':
        return <Badge variant="danger">{t('staff.leaveManagement.rejected')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status === filterStatus);

  const statusDistribution = [
    { name: t('staff.leaveManagement.pending'), value: stats.pending, color: '#F59E0B' },
    { name: t('staff.leaveManagement.approved'), value: stats.approved, color: '#10B981' },
    { name: t('staff.leaveManagement.rejected'), value: stats.rejected, color: '#EF4444' }
  ].filter(s => s.value > 0);

  const leaveTypeData = leaveTypes.map(type => ({
    name: type.leaveTypeName || type.name,
    value: leaveRequests.filter(r => r.leaveType?._id === type._id).length
  })).filter(d => d.value > 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('staff.leaveManagement.title')}</h1>
        <p className="text-gray-600 mt-1">{t('staff.leaveManagement.subtitle')}</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="generic" 
          title={t('staff.leaveManagement.leaveManagementUnavailable')}
          message={error}
          onRetry={fetchData}
          onHome={() => navigate('/staff/dashboard')}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('staff.leaveManagement.loadingLeaveData')}</p>
        </div>
      ) : (
      <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('staff.leaveManagement.totalRequests')}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full"><FiCalendar className="w-6 h-6 text-blue-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('staff.leaveManagement.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full"><FiClock className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('staff.leaveManagement.approved')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FiCheckCircle className="w-6 h-6 text-green-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('staff.leaveManagement.rejected')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full"><FiXCircle className="w-6 h-6 text-red-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('staff.leaveManagement.totalDays')}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDays}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><FiCalendar className="w-6 h-6 text-purple-600" /></div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title={t('staff.leaveManagement.leaveStatusDistribution')}>
          {statusDistribution.length > 0 ? (
            <PieChartComponent 
              data={statusDistribution}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          ) : (
            <p className="text-center py-8 text-gray-500">{t('staff.leaveManagement.noDataAvailable')}</p>
          )}
        </Card>
        <Card title={t('staff.leaveManagement.leaveByType')}>
          {leaveTypeData.length > 0 ? (
            <BarChartComponent 
              data={leaveTypeData}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          ) : (
            <p className="text-center py-8 text-gray-500">{t('staff.leaveManagement.noDataAvailable')}</p>
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
            {t('staff.leaveManagement.all')}
          </Button>
          <Button 
            variant={filterStatus === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('pending')}
          >
            {t('staff.leaveManagement.pending')}
          </Button>
          <Button 
            variant={filterStatus === 'approved' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('approved')}
          >
            {t('staff.leaveManagement.approved')}
          </Button>
          <Button 
            variant={filterStatus === 'rejected' ? 'primary' : 'outline'} 
            onClick={() => setFilterStatus('rejected')}
          >
            {t('staff.leaveManagement.rejected')}
          </Button>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <FiPlus className="mr-2" /> {t('staff.leaveManagement.addLeaveRequest')}
        </Button>
      </div>

      {/* Leave Requests Table */}
        <Card title={t('staff.leaveManagement.leaveRequests')}>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">{t('staff.leaveManagement.noLeaveRequestsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.employee')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.leaveType')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.duration')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.reason')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.leaveManagement.actions')}</th>
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
                      <div>{new Date(leave.startDate).toLocaleDateString()}{t('staff.leaveManagement.dateSeparator')}{new Date(leave.endDate).toLocaleDateString()}</div>
                      <div className="text-xs">{leave.leaveDays} {t('staff.leaveManagement.days')}</div>
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
                              title={t('staff.leaveManagement.approve')}
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleReject(leave._id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title={t('staff.leaveManagement.reject')}
                            >
                              <FiXCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleEdit(leave)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title={t('staff.leaveManagement.edit')}
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(leave._id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title={t('staff.leaveManagement.delete')}
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
        title={editingId ? t('staff.leaveManagement.editLeaveRequest') : t('staff.leaveManagement.addLeaveRequest')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label={t('staff.leaveManagement.employee')}
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            options={[
              { value: '', label: t('staff.leaveManagement.selectEmployee') },
              ...employees.map(emp => ({ value: emp._id, label: emp.name }))
            ]}
            required
          />
          <Select
            label={t('staff.leaveManagement.leaveType')}
            name="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            options={[
              { value: '', label: t('staff.leaveManagement.selectLeaveType') },
              ...leaveTypes.map(lt => ({ value: lt._id, label: `${lt.name} (${lt.daysAllowed} ${t('staff.leaveManagement.days')})` }))
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <CalendarDatePicker value={formData.startDate} name="startDate" onChange={handleInputChange} placeholder={t('staff.leaveManagement.selectDate')} />
            <CalendarDatePicker value={formData.endDate} name="endDate" onChange={handleInputChange} placeholder={t('staff.leaveManagement.selectDate')} />
          </div>
          {formData.startDate && formData.endDate && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
              {t('staff.leaveManagement.totalDaysLabel')}: {calculateLeaveDays(formData.startDate, formData.endDate)}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff.leaveManagement.reason')}</label>
            <textarea
              name="leaveReason"
              value={formData.leaveReason}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('staff.leaveManagement.enterReason')}
              required
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <Button type="submit">
              {editingId ? t('staff.leaveManagement.updateRequest') : t('staff.leaveManagement.submitRequest')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
                setFormData({ employee: '', leaveType: '', leaveReason: '', startDate: '', endDate: '', leaveDays: 0 });
              }}
            >
              {t('staff.leaveManagement.cancel')}
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
