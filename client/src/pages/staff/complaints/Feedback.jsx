import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PieChartComponent } from '../../../components/UIHelper/ECharts';
import { FiMessageSquare, FiSmile, FiStar, FiThumbsUp } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const complaintFeedbackConfig = {
  title: 'Complaint Feedback',
  subtitle: 'Manage feedback records with the same reusable complaints table and form system.',
  endpoint: '/staff/complaint-feedbacks',
  columns: [
    { key: 'complaint', header: 'Complaint', render: (value) => value?.complaintCode || value?.subject || '-' },
    { key: 'satisfactionLevel', header: 'Satisfaction (1-5)' },
    { key: 'comments', header: 'Comments' },
    { key: 'feedbackDate', header: 'Feedback Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'resolutionTime', header: 'Resolution Time (hrs)' },
    { key: 'escalationRequired', header: 'Escalation', render: (value) => value ? 'Yes' : 'No' }
  ],
  formFields: [
    { name: 'complaint', label: 'Complaint', type: 'relation', relationEndpoint: '/staff/complaints', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.complaintCode || 'No Code'} - ${row.subject || 'Complaint'}` },
    { name: 'satisfactionLevel', label: 'Satisfaction Level (1-5)', type: 'number', required: true },
    { name: 'comments', label: 'Comments', type: 'textarea', rows: 4 },
    { name: 'feedbackDate', label: 'Feedback Date', type: 'date' },
    { name: 'resolutionTime', label: 'Resolution Time (hours)', type: 'number' },
    { name: 'escalationRequired', label: 'Escalation Required', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ],
  initialForm: { complaint: '', satisfactionLevel: 5, comments: '', feedbackDate: '', resolutionTime: '', escalationRequired: 'false' },
  mapFormToPayload: (form) => ({ 
    ...form, 
    satisfactionLevel: Number(form.satisfactionLevel || 5), 
    feedbackDate: form.feedbackDate || null,
    resolutionTime: form.resolutionTime ? Number(form.resolutionTime) : undefined,
    escalationRequired: String(form.escalationRequired) === 'true'
  }),
  mapRowToForm: (row) => ({ 
    complaint: row.complaint?._id || row.complaint || '', 
    satisfactionLevel: row.satisfactionLevel ?? 5, 
    comments: row.comments || '', 
    feedbackDate: row.feedbackDate ? new Date(row.feedbackDate).toISOString().slice(0, 10) : '',
    resolutionTime: row.resolutionTime || '',
    escalationRequired: String(row.escalationRequired ?? false)
  })
};

const StaffComplaintFeedback = () => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageSatisfaction: 0,
    highSatisfaction: 0,
    lowSatisfaction: 0,
    bySatisfaction: [],
    monthlyFeedback: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/complaint-feedbacks`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const feedbacks = data.data || [];
        
        const totalFeedback = feedbacks.length;
        const avgSatisfaction = totalFeedback > 0 
          ? (feedbacks.reduce((sum, f) => sum + (f.satisfactionLevel || 0), 0) / totalFeedback).toFixed(1)
          : 0;
        const highSatisfaction = feedbacks.filter(f => (f.satisfactionLevel || 0) >= 4).length;
        const lowSatisfaction = feedbacks.filter(f => (f.satisfactionLevel || 0) <= 2).length;
        
        // By Satisfaction Level
        const satisfactionMap = {};
        feedbacks.forEach(f => {
          const level = f.satisfactionLevel || 0;
          const key = `${level} Star${level !== 1 ? 's' : ''}`;
          satisfactionMap[key] = (satisfactionMap[key] || 0) + 1;
        });
        const bySatisfaction = Object.entries(satisfactionMap)
          .map(([name, value]) => ({ name, value }));
        
        // Monthly Trend
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        feedbacks.forEach(f => {
          if (f.feedbackDate) {
            const date = new Date(f.feedbackDate);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const monthlyFeedback = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalFeedback,
          averageSatisfaction: avgSatisfaction,
          highSatisfaction,
          lowSatisfaction,
          bySatisfaction,
          monthlyFeedback
        });
      }
    } catch (err) {
      console.error('Error fetching feedback stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Complaints" title="Complaint Feedback">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Complaints" title="Complaint Feedback" subtitle="Manage feedback records with the same reusable complaints table and form system.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Feedback</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalFeedback}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiMessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900">{stats.averageSatisfaction}/5</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiStar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">High Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900">{stats.highSatisfaction}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FiSmile className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Needs Improvement</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lowSatisfaction}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiThumbsUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Satisfaction Distribution</h3>
          {stats.bySatisfaction.length > 0 ? (
            <PieChartComponent data={stats.bySatisfaction} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Feedback Trend</h3>
          {stats.monthlyFeedback.length > 0 ? (
            <BarChartComponent data={stats.monthlyFeedback} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage title={complaintFeedbackConfig.title} subtitle={complaintFeedbackConfig.subtitle} endpoint={complaintFeedbackConfig.endpoint} columns={complaintFeedbackConfig.columns} createPath="/staff/complaints/feedback/create" editPathForRow={(row) => `/staff/complaints/feedback/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/complaints/feedback/view/${getId(row)}`} searchPlaceholder="Search complaint feedback..." clientSidePagination={true} />
    </StaffPageLayout>
  );
};

export default StaffComplaintFeedback;
