import { useState, useEffect } from 'react';

const Security = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'Chrome on Windows', ip: '192.168.1.100', location: 'Local Network', lastActive: '2024-02-10 14:30', current: true },
    { id: 2, name: 'Firefox on Ubuntu', ip: '203.0.113.45', location: 'Remote', lastActive: '2024-02-09 09:15', current: false },
    { id: 3, name: 'Safari on iPhone', ip: '198.51.100.23', location: 'Home Network', lastActive: '2024-02-08 18:45', current: false },
    { id: 4, name: 'Edge on Windows', ip: '203.0.113.78', location: 'Office Network', lastActive: '2024-02-07 11:20', current: false }
  ]);
  const [loginHistory, setLoginHistory] = useState([
    { id: 1, date: '2024-02-10 14:30', ip: '192.168.1.100', location: 'Local Network', status: 'Success', device: 'Chrome on Windows' },
    { id: 2, date: '2024-02-09 09:15', ip: '203.0.113.45', location: 'Remote', status: 'Success', device: 'Firefox on Ubuntu' },
    { id: 3, date: '2024-02-08 22:45', ip: '198.51.100.23', location: 'Home Network', status: 'Failed', device: 'Safari on iPhone' },
    { id: 4, date: '2024-02-08 18:45', ip: '198.51.100.23', location: 'Home Network', status: 'Success', device: 'Safari on iPhone' },
    { id: 5, date: '2024-02-07 11:20', ip: '203.0.113.78', location: 'Office Network', status: 'Success', device: 'Edge on Windows' }
  ]);
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, action: 'Logged in', date: '2024-02-10 14:30', details: 'Successful login from Chrome on Windows' },
    { id: 2, action: 'Viewed Results', date: '2024-02-10 14:32', details: 'Accessed Spring 2024 semester results' },
    { id: 3, action: 'Submitted Assignment', date: '2024-02-10 10:15', details: 'Calculus Problem Set 3 submitted successfully' },
    { id: 4, action: 'Updated Profile', date: '2024-02-09 16:45', details: 'Changed phone number in profile settings' },
    { id: 5, action: 'Downloaded Document', date: '2024-02-09 14:20', details: 'Downloaded fee statement' }
  ]);
  const [sessionTimeout, setSessionTimeout] = useState(30); // in minutes

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const logoutFromDevice = (deviceId) => {
    // In a real app, this would make an API call to terminate the session
    setDevices(prev => prev.filter(device => device.id !== deviceId));
    alert(`Logged out from device ${deviceId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Security & Advanced Features</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security Settings
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Device Management
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Advanced Features
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={toggleTwoFactor}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Session Timeout</div>
                    <p className="text-sm text-gray-600 mb-3">Automatically log out after a period of inactivity</p>
                    <div className="flex items-center space-x-4">
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={0}>Never</option>
                      </select>
                      <span className="text-sm text-gray-600">Recommended: 30 minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Password Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="font-medium text-gray-800">Change Password</div>
                    <div className="text-sm text-gray-600 mt-1">Update your account password</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="font-medium text-gray-800">Password Strength</div>
                    <div className="text-sm text-gray-600 mt-1">Check how secure your password is</div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Encryption</h3>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-800">Data Protection</h4>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Your data is encrypted both in transit and at rest using industry-standard encryption protocols.</p>
                        <p className="mt-1">AES-256 encryption is used for sensitive information storage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Login History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistory.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(log.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.device}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Logs</h3>
                <div className="space-y-3">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium text-gray-800">{log.action}</span>
                          <span className="ml-2 text-sm text-gray-600">on {log.date}</span>
                        </div>
                        <span className="text-sm text-gray-500">{log.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Sessions</h3>
                <div className="space-y-4">
                  {devices.map(device => (
                    <div key={device.id} className={`p-4 border rounded-lg ${device.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800">{device.name}</h4>
                            {device.current && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            <p>IP: {device.ip}</p>
                            <p>Location: {device.location}</p>
                            <p>Last active: {formatDate(device.lastActive)}</p>
                          </div>
                        </div>
                        {!device.current && (
                          <button
                            onClick={() => logoutFromDevice(device.id)}
                            className="px-3 py-1 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 transition-colors"
                          >
                            Log Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Security Recommendation</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Regularly review your active sessions and log out from devices you don't recognize.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Based Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">📊</span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">Performance Analytics</p>
                        <p className="text-sm text-gray-600 mt-1">AI-driven analysis of your academic performance</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">Predictive Alerts</p>
                        <p className="text-sm text-gray-600 mt-1">Early warnings for potential academic challenges</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Offline Mode</p>
                      <p className="text-sm text-gray-600">Access key features without internet</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Multi-Device Sync</p>
                      <p className="text-sm text-gray-600">Sync data across all your devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Accessibility Support</p>
                      <p className="text-sm text-gray-600">Features for users with disabilities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Auto Updates</p>
                      <p className="text-sm text-gray-600">Automatic system updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance & Policies</h3>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-800">Privacy Policy</div>
                    <div className="text-sm text-gray-600 mt-1">Review our data protection policies</div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-800">Terms of Service</div>
                    <div className="text-sm text-gray-600 mt-1">Review our service terms and conditions</div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-800">Data Retention Policy</div>
                    <div className="text-sm text-gray-600 mt-1">Learn how long we retain your data</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium text-gray-800">Application</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Running smoothly</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium text-gray-800">Database</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Connected</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium text-gray-800">Security</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;