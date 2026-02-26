import React, { useState } from 'react';
import Card from '../UIHelper/Card';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [message, setMessage] = useState({
    title: '',
    content: '',
    recipient: ''
  });

  // Mock data for messages
  const messages = [
    {
      id: 1,
      sender: 'Admin',
      subject: 'Important Notice',
      content: 'Please submit your assignment by tomorrow.',
      date: '2024-02-10',
      status: 'unread'
    },
    {
      id: 2,
      sender: 'Teacher',
      subject: 'Exam Schedule',
      content: 'Mid-term exams will start from next week.',
      date: '2024-02-09',
      status: 'read'
    }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Holiday Notice',
      content: 'School will remain closed on Monday for holiday.',
      date: '2024-02-10',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Library Hours',
      content: 'Extended library hours during exam period.',
      date: '2024-02-08',
      priority: 'medium'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Handle sending message
    alert('Message sent successfully!');
    setMessage({ title: '', content: '', recipient: '' });
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
        <p className="text-gray-600">Manage your messages, announcements, and notifications</p>
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
          <Card>
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`p-4 rounded-lg border-l-4 ${
                  msg.status === 'unread' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{msg.subject}</h3>
                      <p className="text-gray-600 mt-1">{msg.content}</p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-sm text-gray-500">{msg.sender}</p>
                      <p className="text-xs text-gray-400">{msg.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Announcements</h2>
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                  announcement.priority === 'high' ? 'bg-red-50 border-red-500' :
                  announcement.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-gray-600 mt-2">{announcement.content}</p>
                  <p className="text-xs text-gray-600 mt-2">{announcement.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'send' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Send Message</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Input
                label="Recipient"
                id="recipient"
                name="recipient"
                type="text"
                value={message.recipient}
                onChange={handleMessageChange}
                placeholder="Enter recipient (teacher/admin)"
              />
              
              <Input
                label="Subject"
                id="title"
                name="title"
                type="text"
                value={message.title}
                onChange={handleMessageChange}
                placeholder="Enter subject"
              />
              
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Message Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={6}
                  value={message.content}
                  onChange={handleMessageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your message here..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Send Message
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Feedback
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="general">General Feedback</option>
                  <option value="service">Service Request</option>
                </select>
              </div>
              
              <Input
                label="Subject"
                id="feedback-title"
                name="feedback-title"
                type="text"
                value={message.title}
                onChange={handleMessageChange}
                placeholder="Enter subject of your feedback"
              />
              
              <div className="space-y-2">
                <label htmlFor="feedback-content" className="block text-sm font-medium text-gray-700">
                  Feedback Content
                </label>
                <textarea
                  id="feedback-content"
                  name="content"
                  rows={6}
                  value={message.content}
                  onChange={handleMessageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your feedback or suggestions..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Submit anonymously
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Card>
          
          <Card>
            <h2 className="text-xl font-semibold mb-4">Previous Feedback</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Cafeteria Food Quality</h3>
                    <p className="text-sm text-gray-600 mt-1">Suggestion • Submitted Feb 10, 2024</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Resolved</span>
                </div>
                <p className="text-gray-700 mt-2">The food quality in the cafeteria could be improved. More variety would be appreciated.</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Library Noise Level</h3>
                    <p className="text-sm text-gray-600 mt-1">Complaint • Submitted Feb 5, 2024</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">In Progress</span>
                </div>
                <p className="text-gray-700 mt-2">The noise level in the library is too high, making it difficult to concentrate.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default Communications;
