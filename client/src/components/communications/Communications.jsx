import React, { useState, useEffect } from 'react';
import Card from '../UIHelper/Card';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';
import Badge from '../UIHelper/Badge';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState({
    title: '',
    content: '',
    recipient: ''
  });
  const [feedback, setFeedback] = useState({
    type: 'general',
    title: '',
    content: '',
    anonymous: false
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      // Fetch complaints as messages (using existing complaints API)
      const complaintsRes = await axios.get(`${API_BASE}/student/complaints`, config);
      const complaintMessages = (complaintsRes.data || []).map(c => ({
        id: c._id,
        sender: 'Student Affairs',
        subject: c.subject || 'Complaint Response',
        content: c.description || c.resolution || 'Your complaint has been received.',
        date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: c.complaintStatus === 'resolved' ? 'read' : 'unread',
        priority: c.priorityLevel || 'medium'
      }));
      
      setMessages(complaintMessages);
      
      // Use exams and assignments as announcements
      const [examsRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_BASE}/student/exams`, config),
        axios.get(`${API_BASE}/student/assignments`, config)
      ]);
      
      const examAnnouncements = (examsRes.data || []).map(e => ({
        id: `exam-${e._id || e.id}`,
        title: e.title || 'Examination Scheduled',
        content: `New examination scheduled for ${e.subject || 'your course'}. Duration: ${e.duration || 'N/A'} minutes.`,
        date: e.date || new Date().toISOString(),
        priority: 'high'
      }));
      
      const assignmentAnnouncements = (assignmentsRes.data || []).filter(a => a.status !== 'submitted').map(a => ({
        id: `assignment-${a._id || a.id}`,
        title: a.title || 'Assignment Due',
        content: `Assignment due on ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'soon'}`,
        date: a.dueDate || new Date().toISOString(),
        priority: 'medium'
      }));
      
      setAnnouncements([...examAnnouncements.slice(0, 2), ...assignmentAnnouncements.slice(0, 2)]);
    } catch (err) {
      console.error('[Communications] Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const config = getConfig();
      
      // Submit as a complaint
      await axios.post(`${API_BASE}/student/complaints`, {
        title: message.title,
        description: message.content,
        category: 'general',
        priority: 'medium'
      }, config);
      
      alert('Message sent successfully!');
      setMessage({ title: '', content: '', recipient: '' });
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('[Communications] Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const config = getConfig();
      
      // Submit as a complaint with feedback category
      await axios.post(`${API_BASE}/student/complaints`, {
        title: feedback.title,
        description: feedback.content,
        category: feedback.type,
        priority: 'medium'
      }, config);
      
      alert('Feedback submitted successfully!');
      setFeedback({ type: 'general', title: '', content: '', anonymous: false });
      fetchMessages(); // Refresh
    } catch (err) {
      console.error('[Communications] Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Communications</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Messages & Announcements</h1>
        <p className="mt-1 text-slate-500">Manage your messages, announcements, and notifications</p>
      </div>

      <div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-4">
            <button
              onClick={() => setActiveTab('messages')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Send Message
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6">Messages</h2>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <div key={msg.id} className={`p-6 rounded-3xl border-l-4 ${
                    msg.status === 'unread' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-300'
                  } hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={msg.priority === 'high' ? 'danger' : msg.priority === 'medium' ? 'warning' : 'primary'} className="font-black text-[10px] uppercase tracking-widest">
                            {msg.priority}
                          </Badge>
                          <h3 className="font-black text-slate-900">{msg.subject}</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-right sm:text-right">
                        <p className="text-sm font-bold text-slate-500">{msg.sender}</p>
                        <p className="text-xs text-slate-400 font-medium">{msg.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl">
                  <p className="text-slate-400 font-medium">No messages yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6">Announcements</h2>
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map(announcement => (
                  <div key={announcement.id} className={`p-6 rounded-3xl border-l-4 ${
                    announcement.priority === 'high' ? 'bg-rose-50 border-rose-500' :
                    announcement.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                    'bg-emerald-50 border-emerald-500'
                  }`}>
                    <h3 className="font-black text-slate-900 mb-2">{announcement.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{announcement.content}</p>
                    <p className="text-xs text-slate-400 font-medium mt-3">{new Date(announcement.date).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl">
                  <p className="text-slate-400 font-medium">No announcements at this time</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'send' && (
        <div className="space-y-4">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6">Send Message</h2>
            <form onSubmit={handleSendMessage} className="space-y-6">
              <Input
                label="Recipient"
                id="recipient"
                name="recipient"
                type="text"
                value={message.recipient}
                onChange={handleMessageChange}
                placeholder="Enter recipient (teacher/admin)"
                className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              />
              
              <Input
                label="Subject"
                id="title"
                name="title"
                type="text"
                value={message.title}
                onChange={handleMessageChange}
                placeholder="Enter subject"
                className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              />
              
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-black text-slate-700 uppercase tracking-widest">
                  Message Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={6}
                  value={message.content}
                  onChange={handleMessageChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 font-medium resize-none"
                  placeholder="Write your message here..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest"
                  onClick={() => setMessage({ title: '', content: '', recipient: '' })}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="rounded-2xl bg-slate-900 hover:bg-slate-800 px-6 py-3 font-black text-xs uppercase tracking-widest"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6">Submit Feedback</h2>
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Type of Feedback
                </label>
                <select 
                  name="type"
                  value={feedback.type}
                  onChange={handleFeedbackChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 font-medium"
                >
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="general">General Feedback</option>
                  <option value="service">Service Request</option>
                </select>
              </div>
              
              <Input
                label="Subject"
                id="feedback-title"
                name="title"
                type="text"
                value={feedback.title}
                onChange={handleFeedbackChange}
                placeholder="Enter subject of your feedback"
                className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              />
              
              <div className="space-y-2">
                <label htmlFor="feedback-content" className="block text-sm font-black text-slate-700 uppercase tracking-widest">
                  Feedback Content
                </label>
                <textarea
                  id="feedback-content"
                  name="content"
                  rows={6}
                  value={feedback.content}
                  onChange={handleFeedbackChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 font-medium resize-none"
                  placeholder="Share your feedback or suggestions..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  checked={feedback.anonymous}
                  onChange={handleFeedbackChange}
                  className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="anonymous" className="text-sm font-medium text-slate-600">
                  Submit anonymously
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest"
                  onClick={() => setFeedback({ type: 'general', title: '', content: '', anonymous: false })}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="rounded-2xl bg-slate-900 hover:bg-slate-800 px-6 py-3 font-black text-xs uppercase tracking-widest"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </Card>
          
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6">Previous Feedback</h2>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.slice(0, 3).map(msg => (
                  <div key={msg.id} className={`p-6 rounded-3xl border-l-4 ${
                    msg.status === 'unread' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-black text-slate-900">{msg.subject}</h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={msg.status === 'unread' ? 'primary' : 'success'} className="font-black text-[10px] uppercase tracking-widest">
                          {msg.status}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{msg.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl">
                  <p className="text-slate-400 font-medium">No previous feedback found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default Communications;
