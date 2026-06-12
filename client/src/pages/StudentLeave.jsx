import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPlus, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiFileText,
  FiActivity,
  FiArrowRight,
  FiInfo
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import Badge from '../components/UIHelper/Badge';
import Modal from '../components/UIHelper/Modal';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/leaves`, config);
      const leaves = response.data || [];
      setLeaveHistory(leaves);
      
      const totalDays = leaves.reduce((acc, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
      
      setStats({
        totalRequests: leaves.length,
        approved: leaves.filter(l => l.approvalStatus === 'approved').length,
        pending: leaves.filter(l => l.approvalStatus === 'pending').length,
        rejected: leaves.filter(l => l.approvalStatus === 'rejected').length,
        totalDays
      });
    } catch (err) {
      console.error('Error fetching leave data:', err);
      setError('Failed to fetch leave records. Please try again.');
      setLeaveHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`${API_BASE}/student/leaves`, formData, config);
      await fetchLeaveData();
      setIsModalOpen(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      alert('Leave request submitted successfully!');
    } catch (err) {
      console.error('Error creating leave:', err);
      alert('Error submitting leave request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">Approved</Badge>;
      case 'pending': return <Badge variant="warning" className="font-black uppercase tracking-widest text-[10px]">Pending</Badge>;
      case 'rejected': return <Badge variant="danger" className="font-black uppercase tracking-widest text-[10px]">Rejected</Badge>;
      default: return <Badge className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type) => {
    const found = leaveTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  if (loading && leaveHistory.length === 0) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Attendance</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Apply for absence and track your request status</p>
        </div>
        <Button 
          variant="primary" 
          className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus /> New Leave Request
        </Button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: stats.totalRequests, icon: <FiFileText />, color: 'blue' },
          { label: 'Approved', value: stats.approved, icon: <FiCheckCircle />, color: 'emerald' },
          { label: 'Pending', value: stats.pending, icon: <FiClock />, color: 'amber' },
          { label: 'Total Days', value: stats.totalDays, icon: <FiCalendar />, color: 'cyan' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave History List */}
        <div className="lg:col-span-2">
          <Card title="Request History" className="rounded-[32px] p-8">
            <div className="space-y-4">
              {leaveHistory.length > 0 ? (
                leaveHistory.map((leave, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors group">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl ${
                        leave.approvalStatus === 'approved' ? 'text-emerald-500' : 
                        leave.approvalStatus === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {leave.approvalStatus === 'approved' ? <FiCheckCircle /> : 
                         leave.approvalStatus === 'rejected' ? <FiXCircle /> : <FiClock />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">
                          {getLeaveTypeLabel(leave.leaveType)}
                        </p>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </h4>
                        <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1 italic max-w-md">
                          "{leave.reason}"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      {getStatusBadge(leave.approvalStatus)}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Submitted {formatDate(leave.createdAt || leave.startDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiFileText className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No leave requests found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card title="Leave Policy" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              {[
                { icon: <FiInfo />, text: 'Submit requests at least 48 hours in advance.' },
                { icon: <FiActivity />, text: 'Maximum of 5 casual leaves per semester.' },
                { icon: <FiCheckCircle />, text: 'Medical leave requires a valid doctor certificate.' },
                { icon: <FiAlertCircle />, text: 'Unapproved absence affects attendance grade.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-cyan-400 text-lg mt-0.5">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[32px] text-white shadow-xl shadow-cyan-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Need Help?</h4>
              <p className="text-cyan-100 text-sm font-medium mb-6">Contact the Student Affairs office for urgent leave requests.</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
                Contact Office
              </Button>
            </div>
            <FiClock className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Leave Type"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              options={[{ value: '', label: 'Select leave type' }, ...leaveTypes]}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Reason for Leave</label>
              <textarea
                name="reason"
                required
                rows="4"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none font-medium"
                placeholder="Please provide a detailed reason..."
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-2xl py-4 font-black"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 rounded-2xl py-4 font-black bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
