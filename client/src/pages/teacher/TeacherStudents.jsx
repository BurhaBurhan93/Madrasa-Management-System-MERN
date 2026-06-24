import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const TeacherStudents = () => {
  const { t } = useTranslation();
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
  {
    label: t('teacher.students.totalStudents'),
    value: stats.total,
    accent: 'bg-cyan-500'
  },
  {
    label: t('teacher.students.activeStudents'),
    value: stats.active,
    accent: 'bg-emerald-500'
  },
  {
    label: t('teacher.students.inactiveStudents'),
    value: stats.inactive,
    accent: 'bg-rose-500'
  },
  {
    label: t('teacher.students.mySubjects'),
    value: stats.subjects,
    accent: 'bg-violet-500'
  },
];

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
  {t('teacher.students.title')}
</h1>
          <p className="mt-1 text-sm text-slate-500">
  {t('teacher.students.subtitle')}
</p>
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
              placeholder={t('teacher.students.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">
  {t('teacher.students.allStatus')}
</option>
              <option value="active">
  {t('teacher.common.active')}
</option>
              <option value="inactive">
  {t('teacher.common.inactive')}
</option>
            </select>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="all">
  {t('teacher.students.allSubjects')}
</option>
              {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center">
            <p className="text-lg font-medium text-slate-500">{t('teacher.students.noStudentsFound')}</p>
            <p className="mt-2 text-sm text-slate-400">
  {t('teacher.students.registerStudentsMessage')}
</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map(student => (
              <div key={student._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-bold text-white">
                     {student.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{student.user?.name || t('teacher.students.unknown')}</h3>
                      <p className="text-xs text-slate-500">{student.studentCode || t('teacher.common.na')}</p>
                    </div>
                  </div>
                  <span
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    student.status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-rose-100 text-rose-700'
  }`}
>
  {student.status === 'active'
    ? t('teacher.common.active')
    : t('teacher.common.inactive')}
</span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
  {[
    {
      label: t('teacher.students.class'),
      value: `${student.currentClass?.name || t('teacher.students.notAssigned')} ${student.currentClass?.section || ''}`
    },
    {
      label: t('teacher.students.level'),
      value: student.currentLevel || t('teacher.common.na')
    },
    {
      label: t('teacher.students.email'),
      value: student.user?.email || t('teacher.common.na')
    },
    {
      label: t('teacher.students.admission'),
      value: student.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString()
        : t('teacher.common.na')
    }
  ].map((row) => (
    <div key={row.label} className="flex justify-between">
      <span className="text-slate-400">{row.label}:</span>
      <span className="ml-2 truncate font-medium text-slate-700">
        {row.value}
      </span>
    </div>
  ))}
</div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => navigate('/teacher/attendance')} className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    {t('teacher.students.markAttendance')}
                  </button>
                  <button onClick={() => navigate('/teacher/results/enter-marks')} className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    {t('teacher.students.enterMarks')}
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
