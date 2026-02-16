import React, { useState } from 'react';
import Card from "../../components/UIHelper/Card";
import Input from "../../components/UIHelper/Input";
import Button from "../../components/UIHelper/Button";
import { validatePassword } from '../../lib/utils';

const Security = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginHistory, setLoginHistory] = useState([
    { id: 1, date: '2024-02-10 10:30 AM', ip: '192.168.1.100', location: 'Local', status: 'Success' },
    { id: 2, date: '2024-02-09 3:45 PM', ip: '203.0.113.45', location: 'Remote', status: 'Success' },
    { id: 3, date: '2024-02-08 8:15 AM', ip: '198.51.100.23', location: 'Remote', status: 'Failed' }
  ]);

  const [errors, setErrors] = useState({});

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      // In a real app, you would send to the backend
      alert('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    alert(`Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'} successfully!`);
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600">Manage your account security and privacy settings</p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={errors.currentPassword}
              placeholder="Enter your current password"
            />

            <Input
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={errors.newPassword}
              placeholder="Enter your new password"
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
            />

            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
            />

            <div className="flex justify-end">
              <Button type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable 2FA</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Setup Instructions</h4>
              <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
                <li>Download Google Authenticator or similar app</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code from the app</li>
                <li>Click verify to complete setup</li>
              </ol>
            </div>
          )}
        </Card>

        {/* Session Management */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loginHistory.map(session => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Browser</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'Success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline">
              Log Out All Other Sessions
            </Button>
          </div>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Security Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800">Password Strength</h3>
              <p className="text-sm text-green-700 mt-1">Your password is strong and secure.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800">Two-Factor Auth</h3>
              <p className="text-sm text-blue-700 mt-1">Consider enabling 2FA for better security.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Security;