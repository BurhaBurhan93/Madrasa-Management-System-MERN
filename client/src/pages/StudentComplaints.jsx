import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiMessageSquare, 
  FiPlus, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo,
  FiActivity,
  FiArrowRight,
  FiFilter,
  FiSend,
  FiShield
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Badge from '../components/UIHelper/Badge';
import Modal from '../components/UIHelper/Modal';
import Select from '../components/UIHelper/Select';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const POLL_INTERVAL = 15000;

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    priority: 'medium',
    description: ''
  });

  const fetchComplaints = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data || []);
    } catch (err) {
      console.error('[StudentComplaints] Error:', err);
      setError('Failed to load complaints tracking system.');
      setComplaints([]); // Set empty array on error
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const intervalId = setInterval(() => fetchComplaints({ silent: true }), POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/student/complaints`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Academic', priority: 'medium', description: '' });
      await fetchComplaints({ silent: true });
      alert('Your ticket has been registered successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && complaints.length === 0) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Support</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Help & Feedback</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Your voice matters in building our institution</p>
        </div>
        <Button 
          variant="primary" 
          className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus /> New Ticket
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: complaints.length, icon: <FiMessageSquare />, color: 'blue' },
          { label: 'Active Issues', value: complaints.filter(c => c.complaintStatus !== 'closed').length, icon: <FiClock />, color: 'amber' },
          { label: 'Resolved', value: complaints.filter(c => c.complaintStatus === 'closed').length, icon: <FiCheckCircle />, color: 'emerald' },
          { label: 'Response Rate', value: '100%', icon: <FiActivity />, color: 'cyan' }
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
        {/* Complaints List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="My Support Tickets" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {complaints.length > 0 ? (
                complaints.map((ticket) => (
                  <div key={ticket._id} className="group p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl ${
                          ticket.complaintStatus === 'closed' ? 'text-emerald-500' : 'text-amber-500'
                        } group-hover:scale-110 transition-transform`}>
                          {ticket.complaintStatus === 'closed' ? <FiCheckCircle /> : <FiClock />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-white border-none font-black text-[10px] uppercase tracking-widest">{ticket.complaintCategory}</Badge>
                            <Badge variant={ticket.priorityLevel === 'high' ? 'danger' : 'warning'} className="font-black text-[10px] uppercase tracking-widest">{ticket.priorityLevel}</Badge>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{ticket.subject}</h3>
                        </div>
                      </div>
                      <Badge variant={ticket.complaintStatus === 'closed' ? 'success' : 'primary'}>
                        {ticket.complaintStatus?.toUpperCase() || 'OPEN'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-500 italic mb-8">
                      "{ticket.description}"
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Ref: #{ticket._id?.substring(ticket._id.length - 6).toUpperCase()}</span>
                        <span>•</span>
                        <span>Opened {formatDate(ticket.createdAt)}</span>
                      </div>
                      <button className="text-xs font-black text-cyan-600 hover:text-cyan-700 flex items-center gap-2 transition-colors">
                        View Thread <FiArrowRight />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <FiMessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No active tickets found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card title="Institutional Policy" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              {[
                { icon: <FiInfo />, text: 'Initial response within 24 business hours.' },
                { icon: <FiShield />, text: 'All feedback is handled with strict confidentiality.' },
                { icon: <FiCheckCircle />, text: 'Urgent matters should be flagged as "High" priority.' },
                { icon: <FiAlertCircle />, text: 'Provide reference ID when contacting office.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-cyan-400 text-lg mt-0.5">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[32px] text-white shadow-xl shadow-amber-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Anonymous Tip?</h4>
              <p className="text-amber-100 text-sm font-medium mb-6 italic">Want to report something without revealing your identity?</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
                Submit Anonymously
              </Button>
            </div>
            <FiShield className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* New Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Support Ticket"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input 
              label="Subject / Title" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="rounded-2xl bg-slate-50 border-slate-100"
              placeholder="Brief summary of the issue"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Category"
                options={[
                  { value: 'Academic', label: 'Academic' },
                  { value: 'Facility', label: 'Facility' },
                  { value: 'Environment', label: 'Environment' },
                  { value: 'General', label: 'General' }
                ]}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="rounded-2xl bg-slate-50 border-slate-100"
              />
              <Select 
                label="Priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="rounded-2xl bg-slate-50 border-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Detailed Description</label>
              <textarea
                required
                rows="5"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none font-medium"
                placeholder="Describe your concern in detail..."
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
              className="flex-1 rounded-2xl py-4 font-black bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiSend /> {loading ? 'Submitting...' : 'Send Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaints;
