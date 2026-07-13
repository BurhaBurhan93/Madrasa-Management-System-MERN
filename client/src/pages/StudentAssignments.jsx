import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
import { 
  FiEdit, 
  FiClock, 
  FiCalendar, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiSearch, 
  FiFileText,
  FiList,
  FiClock as FiClockIcon,
  FiCheckCircle as FiCheckIcon
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';
import { unwrapArrayResponse } from '../lib/studentData';

const MOCK_ASSIGNMENTS = [
  { _id: 'a1', title: 'Chapter 4 Math Exercises', description: 'Complete exercises 1-10 from chapter 4', subject: { name: 'Mathematics' }, status: 'pending', dueDate: '2026-07-10T23:59:00Z' },
  { _id: 'a2', title: 'Quran Memorization - Surah Yaseen', description: 'Memorize verses 1-20 of Surah Yaseen', subject: { name: 'Quranic Studies' }, status: 'submitted', dueDate: '2026-06-28T23:59:00Z' },
  { _id: 'a3', title: 'Arabic Grammar Worksheet', description: 'Complete the grammar worksheet on verb conjugations', subject: { name: 'Arabic Literature' }, status: 'overdue', dueDate: '2026-06-25T23:59:00Z' },
  { _id: 'a4', title: 'Islamic History Essay', description: 'Write a 1000-word essay on the Golden Age of Islam', subject: { name: 'Islamic History' }, status: 'pending', dueDate: '2026-07-15T23:59:00Z' },
  { _id: 'a5', title: 'Programming Assignment 3', description: 'Implement a binary search tree in Python', subject: { name: 'Computer Science' }, status: 'pending', dueDate: '2026-07-12T23:59:00Z' },
];

const StudentAssignments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common']);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignmentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/student/assignments');
      if (!res.ok) { setAssignments(MOCK_ASSIGNMENTS); return; }
      const data = await parseJsonSafe(res);
      const list = unwrapArrayResponse(data);
      setAssignments(list.length > 0 ? list : MOCK_ASSIGNMENTS);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(t('offlineData', { ns: 'common' }));
      setAssignments(MOCK_ASSIGNMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, []);

  // Calculate assignment stats
  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const submitted = assignments.filter(a => a.status === 'submitted').length;
    const overdue = assignments.filter(a => a.status === 'overdue').length;
    const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    
    return { total, pending, submitted, overdue, completionRate };
  }, [assignments]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          assignment.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">{t('student.assignments.statusSubmitted')}</Badge>;
      case 'pending':
        return <Badge variant="primary" className="font-black uppercase tracking-widest text-[10px]">{t('student.assignments.statusPending')}</Badge>;
      case 'overdue':
        return <Badge variant="danger" className="font-black uppercase tracking-widest text-[10px]">{t('student.assignments.statusOverdue')}</Badge>;
      default:
        return <Badge className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('academic', { ns: 'student' })}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('assignments', { ns: 'student' })}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">{t('assignmentSubtitle', 'Track and submit your coursework')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('searchAssignments', 'Search tasks...')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none w-full sm:w-64 font-medium text-sm transition-all shadow-sm dark:text-gray-100"
            />
          </div>
          <div className="flex p-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm">
            {['all', 'pending', 'submitted'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f === 'all' ? t('all', { ns: 'common' }) : t(f, { ns: 'common' })}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl text-amber-700 dark:text-amber-400 text-sm font-bold text-center">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 dark:bg-gray-700 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                <FiList className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('total', 'Total')}</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{assignmentStats.total}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('allAssignments', { ns: 'student' })}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FiClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('pending', { ns: 'common' })}</span>
            </div>
            <p className="text-3xl font-black text-blue-600">{assignmentStats.pending}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('needsSubmission', 'Need submission')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FiCheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('submitted', { ns: 'common' })}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{assignmentStats.submitted}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('completed', { ns: 'common' })}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('overdue', { ns: 'common' })}</span>
            </div>
            <p className="text-3xl font-black text-rose-600">{assignmentStats.overdue}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('pastDeadline', 'Past deadline')}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title={t('assignmentStatusDistribution', 'Assignment Status Distribution')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <PieChartComponent
              data={[
                { name: 'Pending', value: assignmentStats.pending },
                { name: 'Submitted', value: assignmentStats.submitted },
                { name: 'Overdue', value: assignmentStats.overdue }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>

          <Card title={t('completionRateOverview', 'Completion Rate Overview')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <BarChartComponent
              data={[
                { name: 'Completion Rate', value: assignmentStats.completionRate }
              ]}
              dataKey="value"
              nameKey="name"
              height={300}
            />
            <div className="text-center mt-4">
              <p className="text-4xl font-black text-slate-900 dark:text-white">{assignmentStats.completionRate}%</p>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">{t('overallCompletion', 'Overall Completion')}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <Card key={assignment._id} className="group relative overflow-hidden rounded-[32px] p-0 border-none bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-gray-900/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Left side - Subject & Status */}
                <div className={`md:w-64 p-8 flex flex-col justify-between items-center text-center ${
                  assignment.status === 'submitted' ? 'bg-emerald-50' : 
                  assignment.status === 'overdue' ? 'bg-rose-50' : 'bg-blue-50'
                }`}>
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl mb-4 ${
                    assignment.status === 'submitted' ? 'bg-white text-emerald-600' : 
                    assignment.status === 'overdue' ? 'bg-white text-rose-600' : 'bg-white text-blue-600'
                  } shadow-sm group-hover:scale-110 transition-transform`}>
                    <FiFileText />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                      assignment.status === 'submitted' ? 'text-emerald-600' : 
                      assignment.status === 'overdue' ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                      {assignment.subject?.name || 'Academic'}
                    </p>
                    <div className="mt-2">{getStatusBadge(assignment.status)}</div>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="flex-1 p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{assignment.title}</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium line-clamp-2 italic mb-4">
                      {assignment.description || t('student.assignments.defaultDescription')}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                        <FiCalendar className="text-cyan-500" />
                        {t('student.assignments.dueLabel')} {formatDate(assignment.dueDate)}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                        <FiClock className="text-cyan-500" />
                        {t('student.assignments.timeLabel')}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
                    <div className="flex flex-col items-center gap-3">
                      {getStatusBadge(assignment.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/homework-submission?id=${assignment._id}`)}
                      >
                        {assignment.status === 'submitted'
                          ? t('viewSubmission', 'View Submission')
                          : t('submitHomework', { ns: 'student' })}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-gray-600 text-5xl mx-auto mb-6 border border-slate-100 dark:border-gray-700">
              <FiEdit />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('noAssignmentsFound', 'No Assignments Found')}</h3>
            <p className="text-slate-500 dark:text-gray-400 font-medium">{t('noPendingAssignments', "You're all caught up! No pending tasks at the moment.")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
