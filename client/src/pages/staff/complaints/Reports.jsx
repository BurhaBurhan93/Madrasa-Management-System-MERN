import React from 'react';
import Card from '../../../components/UIHelper/Card';

const StaffComplaintReports = () => {
  const summary = {
    total: 120,
    open: 18,
    inProgress: 23,
    closed: 79,
    highPriority: 12,
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Reports</h1>
        <p className="text-gray-600">Overview and KPIs</p>
      </div>

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
    </div>
  );
};

export default StaffComplaintReports;
