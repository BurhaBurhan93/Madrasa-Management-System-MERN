import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';

const StaffComplaintReports = () => {
  console.log('[StaffComplaintReports] Component initializing...');
  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StaffComplaintReports] Token exists:', !!token);
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    console.log('[StaffComplaintReports] useEffect triggered - fetching data from API...');
    fetchComplaintStats();
  }, []);

  const fetchComplaintStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StaffComplaintReports] Fetching complaint stats from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/complaints/stats', config);
      
      console.log('[StaffComplaintReports] Stats API response:', response.data);
      setSummary(response.data);
    } catch (err) {
      console.error('[StaffComplaintReports] Error fetching stats:', err);
      setError('Failed to fetch complaint statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Reports</h1>
        <p className="text-gray-600">Overview and KPIs</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-700">{summary.open}</div>
          <div className="text-sm text-gray-600">Open</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.closed}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.highPriority}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
        <div className="p-4 bg-white rounded border border-gray-200">
          <p className="text-sm text-gray-600">Use filters on the Complaints page to drill down by status, priority, and category.</p>
        </div>
      </Card>
      </>
      )}
    </div>
  );
};

export default StaffComplaintReports;
