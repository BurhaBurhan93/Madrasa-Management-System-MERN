import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [subjectsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/teacher/subjects', config),
        axios.get('http://localhost:5000/api/teacher/students', config)
      ]);
      setSubjects(subjectsRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const matchesSearch =
      (student.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (student.studentCode || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    subjects: subjects.length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats.total, accent: 'bg-cyan-500' },
    { label: 'Active', value: stats.active, accent: 'bg-emerald-500' },
    { label: 'Inactive', value: stats.inactive, accent: 'bg-rose-500' },
    { label: 'My Subjects', value: stats.subjects, accent: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
          <p className="mt-1 text-sm text-slate-500">Students enrolled in your classes</p>
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
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">All Subjects</option>
              {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center">
            <p className="text-lg font-medium text-slate-500">No students found</p>
            <p className="mt-2 text-sm text-slate-400">Register students via Staff Panel → User Management</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map(student => (
              <div key={student._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-bold text-white">
                      {student.user?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{student.user?.name || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500">{student.studentCode || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {student.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {[
                    { label: 'Class', value: `${student.currentClass?.name || 'Not Assigned'} ${student.currentClass?.section || ''}` },
                    { label: 'Level', value: student.currentLevel || 'N/A' },
                    { label: 'Email', value: student.user?.email || 'N/A' },
                    { label: 'Admission', value: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-slate-400">{row.label}:</span>
                      <span className="font-medium text-slate-700 truncate ml-2">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => navigate('/teacher/attendance')} className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    Mark Attendance
                  </button>
                  <button onClick={() => navigate('/teacher/results/enter-marks')} className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    Enter Marks
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

export default TeacherStudents;
