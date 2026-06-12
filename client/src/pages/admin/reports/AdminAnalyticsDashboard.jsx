import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data?.data || data || null);
      } catch { setStats(null); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = stats ? [
    { label: 'Total Students', value: stats.students || 0, color: 'cyan' },
    { label: 'Total Teachers', value: stats.teachers || 0, color: 'emerald' },
    { label: 'Active Classes', value: stats.activeClasses || 0, color: 'amber' },
    { label: 'Library Books', value: stats.libraryBooks || 0, color: 'violet' },
    { label: 'Departments', value: stats.departments || 0, color: 'blue' },
    { label: 'Total Users', value: stats.totalUsers || 0, color: 'rose' },
    { label: 'Courses', value: stats.courses || 0, color: 'indigo' },
    { label: 'Satisfaction', value: `${stats.satisfaction || 0}%`, color: 'teal' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Institution-wide analytics and performance metrics</p>
      </div>
      {loading ? <p className="text-slate-400">Loading analytics...</p> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {cards.map((c, i) => (
              <div key={i} className={`rounded-2xl border border-${c.color}-200 bg-${c.color}-50 p-5`}>
                <p className={`text-xs font-medium text-${c.color}-600`}>{c.label}</p>
                <p className={`mt-1 text-2xl font-bold text-${c.color}-700`}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Enrollment Trends</h2>
              <p className="text-slate-400">Monthly enrollment trends chart will appear here.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Revenue Trends</h2>
              <p className="text-slate-400">Monthly revenue trends chart will appear here.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Department Performance</h2>
              <p className="text-slate-400">Department-wise performance metrics will appear here.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Key Insights</h2>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• Total enrollment has reached <span className="font-semibold text-slate-700">{stats?.students || 0} students</span></li>
                <li>• Faculty strength: <span className="font-semibold text-slate-700">{stats?.teachers || 0} teachers</span></li>
                <li>• Library houses <span className="font-semibold text-slate-700">{stats?.libraryBooks || 0} books</span></li>
                <li>• Overall satisfaction rate: <span className="font-semibold text-slate-700">{stats?.satisfaction || 0}%</span></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;
