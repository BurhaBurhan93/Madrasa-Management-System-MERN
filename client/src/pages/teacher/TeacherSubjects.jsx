import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Progress from '../../components/UIHelper/Progress';

const Panel = ({ title, subtitle, children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const statusVariants = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-sky-100 text-sky-700',
  upcoming: 'bg-amber-100 text-amber-700',
  inactive: 'bg-rose-100 text-rose-700',
  default: 'bg-slate-100 text-slate-600',
};

const TeacherSubjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const uniqueFields = ['all', ...new Set(subjects.map(s => s.field).filter(Boolean))];

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/teacher/subjects', config);
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects
    .filter(sub => {
      const matchStatus = filter === 'all' || (sub.status || 'active') === filter;
      const matchField = fieldFilter === 'all' || sub.field === fieldFilter;
      return matchStatus && matchField;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      return 0;
    });

  const totalStudents = subjects.reduce((sum, s) => sum + (s.students || 0), 0);
  const totalHours = subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Subjects', value: subjects.length, accent: 'bg-cyan-500' },
    { label: 'Active Classes', value: subjects.filter(s => (s.status || s.isActive) === 'active' || s.isActive === true).length, accent: 'bg-emerald-500' },
    { label: 'Total Students', value: totalStudents, accent: 'bg-violet-500' },
    { label: 'Weekly Hours', value: totalHours, accent: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Subjects</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your teaching subjects and workload</p>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {statCards.map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <Panel className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'completed', 'upcoming', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${filter === status ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <select value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
                {uniqueFields.map(f => <option key={f} value={f}>{f === 'all' ? 'All Fields' : f}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
                <option value="name">Sort by Name</option>
                <option value="students">Sort by Students</option>
                <option value="progress">Sort by Progress</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* Subject Cards */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.length > 0 ? filteredSubjects.map(subject => {
            const statusKey = subject.status || 'default';
            const badgeClass = statusVariants[statusKey] || statusVariants.default;
            return (
              <div key={subject.id || subject._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{subject.name || 'Unnamed Subject'}</h3>
                    <p className="mt-1 text-sm text-slate-500">{subject.code || 'N/A'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                    {subject.status || (subject.isActive ? 'active' : 'inactive')}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p><span className="text-slate-400">Credits:</span> {subject.credits || 'N/A'}</p>
                  <p><span className="text-slate-400">Description:</span> {subject.description || 'No description'}</p>
                </div>

                <div className="mt-4">
                  <Progress value={subject.progress || 50} max={100} label="Syllabus Progress" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { label: 'Students', path: `/teacher/students?subjectId=${subject._id}` },
                    { label: 'Attendance', path: `/teacher/attendance?subjectId=${subject._id}` },
                    { label: 'Exams', path: `/teacher/exams?subjectId=${subject._id}` },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={() => navigate(btn.path)}
                      className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-3 rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
              No subjects found
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default TeacherSubjects;
