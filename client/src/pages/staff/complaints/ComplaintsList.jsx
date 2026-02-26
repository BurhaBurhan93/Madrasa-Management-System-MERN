import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffComplaintsList = () => {
  const [complaints, setComplaints] = useState([
    { id: 'c1', title: 'Library Noise', category: 'Environment', priority: 'low', status: 'open', assignedTo: 'STF2024', date: '2026-02-20' },
    { id: 'c2', title: 'Broken Chair', category: 'Facility', priority: 'high', status: 'in-progress', assignedTo: 'STF2025', date: '2026-02-22' },
    { id: 'c3', title: 'Grade Dispute', category: 'Academic', priority: 'medium', status: 'closed', assignedTo: 'STF2024', date: '2026-02-10' },
  ]);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', search: '' });

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const s = filters.search.toLowerCase();
      const matchSearch = c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s);
      const matchStatus = filters.status === 'all' || c.status === filters.status;
      const matchPriority = filters.priority === 'all' || c.priority === filters.priority;
      const matchCategory = filters.category === 'all' || c.category === filters.category;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [complaints, filters]);

  const changeStatus = (id, status) => setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600">Manage and track complaints</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input className="px-3 py-2 border rounded" placeholder="Search" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
          <select className="px-3 py-2 border rounded" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select className="px-3 py-2 border rounded" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="px-3 py-2 border rounded" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="all">All Categories</option>
            <option value="Facility">Facility</option>
            <option value="Environment">Environment</option>
            <option value="Academic">Academic</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Assigned</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.priority === 'high' ? 'bg-red-100 text-red-800' : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'open' ? 'bg-gray-200 text-gray-800' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{c.assignedTo}</td>
                  <td className="px-4 py-2">{c.date}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => changeStatus(c.id, 'in-progress')}>In Progress</Button>
                      <Button size="sm" variant="secondary" onClick={() => changeStatus(c.id, 'closed')}>Close</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StaffComplaintsList;
