import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';

const StaffComplaintReports = () => {
  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchComplaintStats();
  }, []);

  const fetchComplaintStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/complaints/stats', config);
      
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching complaint stats:', err);
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

      {error && !loading && (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">Unable to Load Reports</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button onClick={fetchComplaintStats} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Card>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Complaint Status Distribution">
          <PieChartComponent 
            data={[
              { name: 'Open', value: summary.open, color: '#6B7280' },
              { name: 'In Progress', value: summary.inProgress, color: '#F59E0B' },
              { name: 'Closed', value: summary.closed, color: '#10B981' },
              { name: 'High Priority', value: summary.highPriority, color: '#EF4444' }
            ].filter(d => d.value > 0)}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>

        <Card title="Complaint Overview">
          <BarChartComponent 
            data={[
              { name: 'Total', value: summary.total },
              { name: 'Open', value: summary.open },
              { name: 'In Progress', value: summary.inProgress },
              { name: 'Closed', value: summary.closed },
              { name: 'High Priority', value: summary.highPriority }
            ]}
            dataKey="value"
            nameKey="name"
            height={300}
          />
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
