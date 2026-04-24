import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFlag, FiTrendingUp } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const complaintsConfig = {
  title: 'Complaints',
  subtitle: 'Track complaint records with the same clean table, filters, and status workflow.',
  endpoint: '/staff/complaints',
  columns: [
    { key: 'complaintCode', header: 'Complaint Code' },
    { key: 'subject', header: 'Subject' },
    { key: 'complaintCategory', header: 'Category' },
    { key: 'priorityLevel', header: 'Priority' },
    { key: 'complaintStatus', header: 'Status' },
    { key: 'complainantType', header: 'Type' },
    { key: 'assignedTo', header: 'Assigned To', render: (value) => value?.name || '-' },
    { key: 'submittedDate', header: 'Submitted Date', render: (value, row) => value || row.createdAt ? new Date(value || row.createdAt).toISOString().slice(0, 10) : '-' },
    { key: 'confidentialityLevel', header: 'Confidentiality' }
  ],
  formFields: [
    { name: 'complaintCode', label: 'Complaint Code', required: true },
    { name: 'complainantType', label: 'Complainant Type', type: 'select', options: [
      { value: 'student', label: 'Student' },
      { value: 'staff', label: 'Staff' },
      { value: 'other', label: 'Other' }
    ], required: true },
    { name: 'complaintCategory', label: 'Category' },
    { name: 'subject', label: 'Subject' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ] },
    { name: 'complaintStatus', label: 'Status', type: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'closed', label: 'Closed' }
    ] },
    { name: 'confidentialityLevel', label: 'Confidentiality Level', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]}
  ]
};

const StaffComplaintsList = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    closedComplaints: 0,
    highPriority: 0,
    byCategory: [],
    byPriority: [],
    byType: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchComplaintStats();
  }, []);

  const fetchComplaintStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/complaints`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const complaints = data.data || [];
        
        const totalComplaints = complaints.length;
        const openComplaints = complaints.filter(c => c.complaintStatus === 'open').length;
        const inProgressComplaints = complaints.filter(c => c.complaintStatus === 'in_progress').length;
        const closedComplaints = complaints.filter(c => c.complaintStatus === 'closed').length;
        const highPriority = complaints.filter(c => c.priorityLevel === 'high').length;
        
        // By Category
        const categoryMap = {};
        complaints.forEach(c => {
          const cat = c.complaintCategory || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // By Priority
        const priorityMap = {};
        complaints.forEach(c => {
          const priority = c.priorityLevel || 'medium';
          priorityMap[priority] = (priorityMap[priority] || 0) + 1;
        });
        const byPriority = Object.entries(priorityMap)
          .map(([name, value]) => ({ name, value }));
        
        // By Type
        const typeMap = {};
        complaints.forEach(c => {
          const type = c.complainantType || 'unknown';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });
        const byType = Object.entries(typeMap)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalComplaints,
          openComplaints,
          inProgressComplaints,
          closedComplaints,
          highPriority,
          byCategory,
          byPriority,
          byType
        });
      }
    } catch (err) {
      console.error('Error fetching complaint stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Complaints" title="Complaints">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Complaints" title="Complaints" subtitle="Track complaint records with the same clean table, filters, and status workflow.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-gray-50 to-slate-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Open</p>
              <p className="text-2xl font-bold text-slate-900">{stats.openComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">{stats.inProgressComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Closed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.closedComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">High Priority</p>
              <p className="text-2xl font-bold text-slate-900">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiFlag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Complaints by Category</h3>
          {stats.byCategory.length > 0 ? (
            <PieChartComponent data={stats.byCategory} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Complaints by Priority</h3>
          {stats.byPriority.length > 0 ? (
            <BarChartComponent data={stats.byPriority} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={complaintsConfig.title}
        subtitle={complaintsConfig.subtitle}
        endpoint={complaintsConfig.endpoint}
        columns={complaintsConfig.columns}
        viewPathForRow={(row) => `/staff/complaints/view/${getId(row)}`}
        searchPlaceholder="Search complaints..."
        clientSidePagination={true}
        deleteEnabled={false}
        extraActionItemsForRow={(row) => [
          row.complaintStatus !== 'in_progress' ? { label: 'Mark In Progress', className: 'text-amber-700 hover:bg-amber-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'in_progress' }) }); window.location.reload(); } } : null,
          row.complaintStatus !== 'closed' ? { label: 'Close Complaint', className: 'text-rose-700 hover:bg-rose-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'closed' }) }); window.location.reload(); } } : null
        ].filter(Boolean)}
      />
    </StaffPageLayout>
  );
};

export default StaffComplaintsList;
