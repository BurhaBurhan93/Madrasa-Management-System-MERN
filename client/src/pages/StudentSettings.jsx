import React, { useState, useEffect } from 'react';
import { FiUser, FiBell, FiLock, FiGlobe, FiMoon, FiSmartphone, FiSave } from 'react-icons/fi';
import axios from 'axios';
import ErrorPage from '../components/UIHelper/ErrorPage';

const StudentSettings = () => {
  console.log('[StudentSettings] Component initializing...');
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'English',
    timezone: 'UTC+0',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    examReminders: true,
    feeReminders: true,
    newsletter: false,
    
    // Privacy Settings
    profileVisible: true,
    showGrades: false,
    allowMessages: true,
    
    // Appearance
    darkMode: false,
    compactView: false,
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentSettings] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentSettings] useEffect triggered - fetching data from API...');
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentSettings] Fetching profile from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/profile', config);
      
      console.log('[StudentSettings] Profile API response:', response.data);
      
      // Update settings with API data
      const userData = response.data;
      setSettings(prev => ({
        ...prev,
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phone || '',
        language: userData.language || 'English',
        timezone: userData.timezone || 'UTC+0'
      }));
    } catch (err) {
      console.error('[StudentSettings] Error fetching profile:', err);
      setError('Failed to fetch profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    console.log(`[StudentSettings] Setting changed: ${key} = ${value}`);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    console.log('[StudentSettings] Saving settings...');
    try {
      setLoading(true);
      const config = getConfig();
      
      // Prepare data for API
      const updateData = {
        name: `${settings.firstName} ${settings.lastName}`.trim(),
        email: settings.email,
        phone: settings.phone,
        language: settings.language,
        timezone: settings.timezone
      };
      
      await axios.put('http://localhost:5000/api/student/profile', updateData, config);
      console.log('[StudentSettings] Settings saved successfully');
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('[StudentSettings] Error saving settings:', err);
      alert('Error saving settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiMoon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Unable to Load Settings"
          message={error}
          onRetry={fetchSettingsData}
          onHome={() => window.location.href = '/student/dashboard'}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      ) : (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-500'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={settings.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={settings.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option>English</option>
                      <option>Arabic</option>
                      <option>Urdu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option>UTC+0</option>
                      <option>UTC+1</option>
                      <option>UTC+2</option>
                      <option>UTC+3</option>
                      <option>UTC+4</option>
                      <option>UTC+5</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications on your device' },
                    { key: 'assignmentReminders', label: 'Assignment Reminders', desc: 'Get reminded before assignment deadlines' },
                    { key: 'examReminders', label: 'Exam Reminders', desc: 'Get notified about upcoming exams' },
                    { key: 'feeReminders', label: 'Fee Payment Reminders', desc: 'Get reminded about fee due dates' },
                    { key: 'newsletter', label: 'Newsletter', desc: 'Receive monthly newsletter' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleChange(item.key, !settings[item.key])}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          settings[item.key] ? 'bg-sky-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          settings[item.key] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Privacy & Security</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'profileVisible', label: 'Public Profile', desc: 'Make your profile visible to other students' },
                    { key: 'showGrades', label: 'Show Grades', desc: 'Display your grades on your profile' },
                    { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow other students to message you' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleChange(item.key, !settings[item.key])}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          settings[item.key] ? 'bg-sky-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          settings[item.key] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-3">Change Password</h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Appearance</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch to dark theme</p>
                    </div>
                    <button
                      onClick={() => handleChange('darkMode', !settings.darkMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.darkMode ? 'bg-sky-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        settings.darkMode ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Compact View</p>
                      <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                    </div>
                    <button
                      onClick={() => handleChange('compactView', !settings.compactView)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.compactView ? 'bg-sky-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        settings.compactView ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-md transition-shadow flex items-center gap-2"
              >
                <FiSave size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default StudentSettings;
