import { useState, useRef, useEffect } from 'react';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Assignment Graded',
      message: 'Your Calculus assignment has been graded. Score: 85/100',
      timestamp: '2024-02-10T10:30:00',
      read: false,
      type: 'academic'
    },
    {
      id: 2,
      title: 'Exam Scheduled',
      message: 'Midterm exam for Islamic Jurisprudence scheduled for March 15th',
      timestamp: '2024-02-09T14:20:00',
      read: false,
      type: 'academic'
    },
    {
      id: 3,
      title: 'Fee Payment Reminder',
      message: 'Please pay your pending fees of $2,750 before the due date',
      timestamp: '2024-02-08T09:15:00',
      read: true,
      type: 'financial'
    },
    {
      id: 4,
      title: 'Library Book Due',
      message: 'Introduction to Islamic Jurisprudence is due tomorrow',
      timestamp: '2024-02-07T16:45:00',
      read: true,
      type: 'library'
    },
    {
      id: 5,
      title: 'New Announcement',
      message: 'University will be closed on February 20th for holiday',
      timestamp: '2024-02-06T11:30:00',
      read: true,
      type: 'general'
    }
  ]);

  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Dr. Ali Hassan',
      role: 'Professor (Mathematics)',
      avatar: 'AH',
      lastMessage: 'Please review the feedback on your assignment',
      timestamp: '2024-02-10T09:30:00',
      unread: 2,
      messages: [
        { id: 1, sender: 'me', text: 'Hello Professor, I received your feedback on the assignment.', timestamp: '2024-02-10T09:25:00' },
        { id: 2, sender: 'other', text: 'Yes, I wanted to discuss the integration techniques you used.', timestamp: '2024-02-10T09:27:00' },
        { id: 3, sender: 'me', text: 'Sure, I can explain my approach in detail.', timestamp: '2024-02-10T09:28:00' },
        { id: 4, sender: 'other', text: 'Please review the feedback on your assignment.', timestamp: '2024-02-10T09:30:00' }
      ]
    },
    {
      id: 2,
      name: 'Prof. Fatima Ahmed',
      role: 'Professor (Arabic)',
      avatar: 'FA',
      lastMessage: 'Don\'t forget the quiz next week',
      timestamp: '2024-02-09T15:45:00',
      unread: 0,
      messages: [
        { id: 1, sender: 'other', text: 'Don\'t forget the quiz next week', timestamp: '2024-02-09T15:45:00' },
        { id: 2, sender: 'me', text: 'Thank you for the reminder, Professor.', timestamp: '2024-02-09T15:47:00' }
      ]
    },
    {
      id: 3,
      name: 'Sheikh Omar Farooq',
      role: 'Professor (Islamic Studies)',
      avatar: 'OF',
      lastMessage: 'Your research paper topic has been approved',
      timestamp: '2024-02-08T11:20:00',
      unread: 1,
      messages: [
        { id: 1, sender: 'other', text: 'Your research paper topic has been approved', timestamp: '2024-02-08T11:20:00' },
        { id: 2, sender: 'me', text: 'Thank you, Sheikh. I will start working on it immediately.', timestamp: '2024-02-08T11:25:00' },
        { id: 3, sender: 'me', text: 'Do you have any initial suggestions?', timestamp: '2024-02-08T11:26:00' }
      ]
    },
    {
      id: 4,
      name: 'Admin Office',
      role: 'Administrative Staff',
      avatar: 'AO',
      lastMessage: 'Fee payment reminder sent',
      timestamp: '2024-02-07T10:00:00',
      unread: 0,
      messages: [
        { id: 1, sender: 'other', text: 'Fee payment reminder sent', timestamp: '2024-02-07T10:00:00' }
      ]
    }
  ]);

  const [groupAnnouncements, setGroupAnnouncements] = useState([
    {
      id: 1,
      title: 'University Closure',
      message: 'The university will be closed on February 20th for a public holiday. All classes are canceled for that day.',
      timestamp: '2024-02-06T11:30:00',
      author: 'Administration',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Library Extension Hours',
      message: 'During exam season, the library will remain open 24/7 from March 1st to March 31st.',
      timestamp: '2024-02-05T14:00:00',
      author: 'Library Department',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Career Fair Event',
      message: 'Annual Career Fair will be held on March 15th in the main hall. All students are encouraged to attend.',
      timestamp: '2024-02-04T09:15:00',
      author: 'Career Services',
      priority: 'medium'
    }
  ]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      sender: 'me',
      text: messageInput,
      timestamp: new Date().toISOString()
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    setMessageInput('');
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Mark messages as read when opening chat
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unread: 0 } : c
      )
    );
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'academic':
        return '📚';
      case 'financial':
        return '💰';
      case 'library':
        return '📖';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Communications</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => {
                setActiveTab('messages');
                setSelectedChat(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                setSelectedChat(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => {
                setActiveTab('announcements');
                setSelectedChat(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Announcements
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'messages' && (
            <div className="flex h-[600px]">
              {/* Chat List */}
              <div className="w-1/3 border-r border-gray-200 pr-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Chats</h3>
                  <div className="space-y-2">
                    {chats.map(chat => (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedChat?.id === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                        onClick={() => handleSelectChat(chat)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {chat.avatar}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800 truncate">{chat.name}</p>
                              {chat.unread > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                            <p className="text-xs text-gray-500">{formatDate(chat.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="w-2/3 pl-4 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedChat.avatar}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{selectedChat.name}</p>
                          <p className="text-xs text-gray-600">{selectedChat.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {selectedChat.messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'me'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          ref={messageInputRef}
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={!messageInput.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Chat</h3>
                      <p className="text-gray-600">Choose a contact to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={notifications.every(n => n.read)}
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            notification.read ? 'text-gray-800' : 'text-blue-800'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${
                          notification.read ? 'text-gray-600' : 'text-blue-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
                    <p className="text-gray-600">You have no new notifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Announcements</h3>

              <div className="space-y-4">
                {groupAnnouncements.map(announcement => (
                  <div key={announcement.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{announcement.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">By: {announcement.author}</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(announcement.timestamp)} at {formatTime(announcement.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {groupAnnouncements.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📢</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Announcements</h3>
                    <p className="text-gray-600">There are no group announcements at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">SMS Alerts</p>
              <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive app notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Group Chats</p>
              <p className="text-sm text-gray-600">Receive group chat notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;