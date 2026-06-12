import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiSettings, FiSave, FiGlobe, FiCalendar, FiClock, FiDollarSign, FiBell, FiShield, FiDatabase } from 'react-icons/fi';

const AdminGeneralSettings = () => {
  const [settings, setSettings] = useState({
    // Institution Settings
    institutionName: 'Madrasa Education System',
    institutionCode: 'MES-2024',
    address: 'Islamabad, Pakistan',
    phone: '+92 51 1234567',
    email: 'info@madrasa.edu',
    website: 'www.madrasa.edu',
    
    // Academic Settings
    academicYear: '2024-2025',
    semesterStart: '2024-09-01',
    semesterEnd: '2025-06-30',
    classDuration: '45', // minutes
    maxStudentsPerClass: '30',
    
    // Financial Settings
    currency: 'PKR',
    currencySymbol: 'Rs.',
    taxRate: '0',
    lateFeePercentage: '5',
    gracePeriodDays: '7',
    
    // System Settings
    timezone: 'Asia/Karachi',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    maintenanceMode: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    notificationSound: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('institution');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const SettingSection = ({ title, icon, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {children}
      </div>
    </div>
  );

  const SettingField = ({ label, name, type = 'text', placeholder, options, note }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={settings[name]}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            name={name}
            checked={settings[name]}
            onChange={handleInputChange}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable {label}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={settings[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      )}
      {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
    </div>
  );

  const tabs = [
    { id: 'institution', label: 'Institution', icon: <FiGlobe size={18} /> },
    { id: 'academic', label: 'Academic', icon: <FiCalendar size={18} /> },
    { id: 'financial', label: 'Financial', icon: <FiDollarSign size={18} /> },
    { id: 'system', label: 'System', icon: <FiSettings size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={18} /> },
    { id: 'security', label: 'Security', icon: <FiShield size={18} /> },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ System Settings</h1>
          <p className="text-gray-600 mt-1">Configure all system settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg disabled:opacity-50"
        >
          <FiSave size={18} /> {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <Card className="mb-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'institution' && (
            <SettingSection title="Institution Settings" icon={<FiGlobe size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingField
                  label="Institution Name"
                  name="institutionName"
                  placeholder="Enter institution name"
                />
                <SettingField
                  label="Institution Code"
                  name="institutionCode"
                  placeholder="Enter institution code"
                />
                <SettingField
                  label="Address"
                  name="address"
                  placeholder="Enter full address"
                />
                <SettingField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                />
                <SettingField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                />
                <SettingField
                  label="Website"
                  name="website"
                  type="url"
                  placeholder="Enter website URL"
                />
              </div>
            </SettingSection>
          )}

          {activeTab === 'academic' && (
            <SettingSection title="Academic Settings" icon={<FiCalendar size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingField
                  label="Academic Year"
                  name="academicYear"
                  placeholder="e.g., 2024-2025"
                />
                <SettingField
                  label="Semester Start Date"
                  name="semesterStart"
                  type="date"
                />
                <SettingField
                  label="Semester End Date"
                  name="semesterEnd"
                  type="date"
                />
                <SettingField
                  label="Class Duration (minutes)"
                  name="classDuration"
                  type="number"
                  placeholder="Enter duration in minutes"
                />
                <SettingField
                  label="Maximum Students per Class"
                  name="maxStudentsPerClass"
                  type="number"
                  placeholder="Enter maximum students"
                />
              </div>
            </SettingSection>
          )}

          {activeTab === 'financial' && (
            <SettingSection title="Financial Settings" icon={<FiDollarSign size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingField
                  label="Currency"
                  name="currency"
                  type="select"
                  options={[
                    { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                  ]}
                />
                <SettingField
                  label="Currency Symbol"
                  name="currencySymbol"
                  placeholder="e.g., Rs., $, €"
                />
                <SettingField
                  label="Tax Rate (%)"
                  name="taxRate"
                  type="number"
                  placeholder="Enter tax rate percentage"
                  note="Set to 0 for no tax"
                />
                <SettingField
                  label="Late Fee Percentage"
                  name="lateFeePercentage"
                  type="number"
                  placeholder="Enter late fee percentage"
                />
                <SettingField
                  label="Grace Period (days)"
                  name="gracePeriodDays"
                  type="number"
                  placeholder="Enter grace period in days"
                />
              </div>
            </SettingSection>
          )}

          {activeTab === 'system' && (
            <SettingSection title="System Settings" icon={<FiSettings size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingField
                  label="Timezone"
                  name="timezone"
                  type="select"
                  options={[
                    { value: 'Asia/Karachi', label: 'Asia/Karachi (Pakistan)' },
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'America/New_York' },
                    { value: 'Europe/London', label: 'Europe/London' },
                  ]}
                />
                <SettingField
                  label="Date Format"
                  name="dateFormat"
                  type="select"
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
                <SettingField
                  label="Language"
                  name="language"
                  type="select"
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'ur', label: 'Urdu' },
                    { value: 'ar', label: 'Arabic' },
                  ]}
                />
                <SettingField
                  label="Maintenance Mode"
                  name="maintenanceMode"
                  type="checkbox"
                />
              </div>
            </SettingSection>
          )}

          {activeTab === 'notifications' && (
            <SettingSection title="Notification Settings" icon={<FiBell size={20} />}>
              <div className="space-y-4">
                <SettingField
                  label="Email Notifications"
                  name="emailNotifications"
                  type="checkbox"
                  note="Send notifications via email"
                />
                <SettingField
                  label="SMS Notifications"
                  name="smsNotifications"
                  type="checkbox"
                  note="Send notifications via SMS"
                />
                <SettingField
                  label="Push Notifications"
                  name="pushNotifications"
                  type="checkbox"
                  note="Send push notifications to mobile app"
                />
                <SettingField
                  label="Notification Sound"
                  name="notificationSound"
                  type="checkbox"
                  note="Play sound for new notifications"
                />
              </div>
            </SettingSection>
          )}

          {activeTab === 'security' && (
            <SettingSection title="Security Settings" icon={<FiShield size={20} />}>
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Security Recommendations</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Enable two-factor authentication for all admin accounts</li>
                    <li>• Regularly update passwords and use strong passwords</li>
                    <li>• Review user permissions and access logs regularly</li>
                    <li>• Keep system software updated to latest versions</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Password Policy</h4>
                    <div className="space-y-3">
                      <SettingField
                        label="Minimum Password Length"
                        name="minPasswordLength"
                        type="number"
                        placeholder="8"
                      />
                      <SettingField
                        label="Password Expiry (days)"
                        name="passwordExpiryDays"
                        type="number"
                        placeholder="90"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Session Management</h4>
                    <div className="space-y-3">
                      <SettingField
                        label="Session Timeout (minutes)"
                        name="sessionTimeout"
                        type="number"
                        placeholder="30"
                      />
                      <SettingField
                        label="Max Login Attempts"
                        name="maxLoginAttempts"
                        type="number"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Data Protection</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Automatic Backup</p>
                      <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Run Backup Now
                    </button>
                  </div>
                </div>
              </div>
            </SettingSection>
          )}
        </div>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <FiDatabase size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Database Status</p>
              <p className="font-semibold text-gray-900">Connected</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FiSettings size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">System Version</p>
              <p className="font-semibold text-gray-900">v2.1.0</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <FiClock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Uptime</p>
              <p className="font-semibold text-gray-900">99.8%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminGeneralSettings;