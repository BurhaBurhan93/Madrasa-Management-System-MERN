import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
import { 
  FiEdit, 
  FiClock, 
  FiCalendar, 
  FiCheckCircle, 
  FiAward, 
  FiFileText,
  FiArrowRight,
  FiActivity,
  FiAlertCircle,
  FiTrendingUp,
  FiClipboard,
  FiList
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';
import { useTranslation } from 'react-i18next';



const MOCK_EXAMS = [
  { _id: 'e1', title: 'Mathematics Midterm', subject: { name: 'Mathematics' }, duration: 60, publishDate: '2024-10-15T09:00:00Z', status: 'published', description: 'Covers chapters 1-5' },
  { _id: 'e2', title: 'Quranic Studies Quiz', subject: { name: 'Quran' }, duration: 45, publishDate: '2024-10-20T10:00:00Z', status: 'published', description: 'Surah Al-Baqarah verses 1-50' },
  { _id: 'e3', title: 'Arabic Grammar Test', subject: { name: 'Arabic' }, duration: 30, publishDate: '2024-10-25T11:00:00Z', status: 'scheduled', description: 'Nouns and verbs' },
  { _id: 'e4', title: 'Islamic History Essay', subject: { name: 'History' }, duration: 90, publishDate: '2024-11-01T09:00:00Z', status: 'published', description: 'The Golden Age of Islam' },
  { _id: 'e5', title: 'Computer Science Practical', subject: { name: 'Computer Science' }, duration: 120, publishDate: '2024-11-05T14:00:00Z', status: 'scheduled', description: 'Programming fundamentals' },
];

const MOCK_RESULTS = [
  { _id: 'r1', exam: { title: 'Quiz 1', subject: { name: 'Mathematics' } }, score: 85, totalMarks: 100, createdAt: '2024-09-20T10:00:00Z', grade: 'A' },
  { _id: 'r2', exam: { title: 'Quran Test', subject: { name: 'Quran' } }, score: 92, totalMarks: 100, createdAt: '2024-09-22T10:00:00Z', grade: 'A+' },
  { _id: 'r3', exam: { title: 'Midterm Exam', subject: { name: 'Arabic' } }, score: 70, totalMarks: 100, createdAt: '2024-09-25T10:00:00Z', grade: 'B' },
  { _id: 'r4', exam: { title: 'History Assignment', subject: { name: 'History' } }, score: 45, totalMarks: 100, createdAt: '2024-09-28T10:00:00Z', grade: 'D' },
  { _id: 'r5', exam: { title: 'CS Lab 1', subject: { name: 'Computer Science' } }, score: 88, totalMarks: 100, createdAt: '2024-09-30T10:00:00Z', grade: 'A' },
];

const StudentExams = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common']);
  
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchExamsData = async () => {
    try {
      const res = await apiFetch('/student/exams');
      const data = await parseJsonSafe(res);
      const examsData = Array.isArray(data) ? data : [];
      setExams(examsData.length > 0 ? examsData : MOCK_EXAMS);
      
      const submissionsData = [];
      const activeExams = examsData.length > 0 ? examsData : MOCK_EXAMS;
      for (const exam of activeExams) {
        try {
          const subRes = await apiFetch(`/student/exams/${exam._id || exam.id}/my-submission`);
          const subData = await parseJsonSafe(subRes);
          if (subData) {
            submissionsData.push({
              examId: exam._id || exam.id,
              ...subData
            });
          }
        } catch (err) {
          // No submission for this exam
        }
      }
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(t('exams.offlineError'));
      setExams(MOCK_EXAMS);
    }
  };

  const fetchExamResults = async () => {
    try {
      const res = await apiFetch('/student/results');
      const data = await parseJsonSafe(res);
      const resultsData = Array.isArray(data) ? data : [];
      setExamResults(resultsData.length > 0 ? resultsData : MOCK_RESULTS);
    } catch (err) {
      console.error('Error fetching exam results:', err);
      setError(t('exams.offlineError'));
      setExamResults(MOCK_RESULTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchExamsData(), fetchExamResults()]).then(() => {
      setLoading(false);
    });
  }, []);

  // Calculate exam stats
  const examStats = useMemo(() => {
    const totalExams = exams.length;
    const completed = examResults.length;
    const upcoming = totalExams - submissions.length;
    const avgScore = examResults.length > 0
      ? Math.round(examResults.reduce((sum, r) => {
          const pct = r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0;
          return sum + pct;
        }, 0) / examResults.length)
      : 0;
    const passed = examResults.filter(r => r.totalMarks > 0 && (r.score / r.totalMarks) >= 0.5).length;
    const missed = Math.max(0, totalExams - submissions.length);
    
    return { totalExams, completed, upcoming, avgScore, passed, missed };
  }, [exams, examResults, submissions]);

  const hasSubmitted = (examId) => {
    return submissions.find(s => s.examId === examId || s.exam === examId);
  };

  const publishedExams = exams.filter(e => e.status === 'published' || e.status === 'scheduled');

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('academic')}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('exams.title')}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">{t('exams.subtitle')}</p>
        </div>
        <div className="flex p-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm">
          {[
            { id: 'upcoming', label: t('exams.upcoming'), icon: <FiClock /> },
            { id: 'past', label: t('exams.results'), icon: <FiAward /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-slate-900 dark:bg-gray-600 text-white shadow-lg' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 dark:bg-cyan-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <FiClipboard className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('exams.totalExams')}</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{examStats.totalExams}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('exams.publishedExams')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('common:completed')}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{examStats.completed}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('exams.examsTaken')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('exams.upcoming')}</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{examStats.upcoming}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('exams.notAttempted')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('exams.avgScore')}</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{examStats.avgScore}%</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('exams.examsPassed', { count: examStats.passed })}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {exams.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title={t('exams.statusDistribution')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <PieChartComponent
              data={[
                { name: t('exams.upcoming'), value: examStats.upcoming },
                { name: t('common:completed'), value: examStats.completed },
                { name: t('exams.missed'), value: examStats.missed || 0 }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>

          <Card title={t('exams.performanceOverview')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            {examResults.length > 0 ? (
              <BarChartComponent
                data={examResults.slice(0, 6).map(result => ({
                  name: result.exam?.title?.substring(0, 10) || 'Exam',
                  score: result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0
                }))}
                dataKey="score"
                nameKey="name"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <p className="font-bold">{t('exams.noResults')}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-[32px] flex items-center gap-4 text-rose-600">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
          <Button variant="outline" size="sm" className="ml-auto rounded-xl border-rose-200 text-rose-600" onClick={fetchExamResults}>{t('common:retry')}</Button>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publishedExams.length > 0 ? (
            publishedExams.map(exam => (
              <Card key={exam._id || exam.id} className="group relative overflow-hidden rounded-[32px] p-0 border-none bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-gray-900/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-2 bg-cyan-500 w-full"></div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{exam.course || exam.subject?.name || t('common:general')}</p>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{exam.title}</h3>
                    </div>
                    <Badge variant="primary" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest">{t('exams.live')}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t('exams.dateTime')}</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-gray-300">
                        <FiCalendar className="text-cyan-500" />
                        {exam.publishDate || exam.startDate ? formatDate(exam.publishDate || exam.startDate) : t('exams.tbd')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t('exams.duration')}</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-gray-300">
                        <FiClock className="text-cyan-500" />
                        {exam.duration} {t('exams.minutes')}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl border border-slate-100 dark:border-gray-700 mb-8">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-400 leading-relaxed italic line-clamp-2">
                      {      exam.description || t('exams.defaultDescription')}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!hasSubmitted(exam._id || exam.id) ? (
                      <Button
                        variant="primary"
                        className="flex-1 rounded-2xl py-4 font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-gray-900 flex items-center justify-center gap-2"
                        onClick={() => navigate(`/student/exams/${exam._id || exam.id}/attempt`)}
                      >
                        {t('exams.startExam')} <FiArrowRight />
                      </Button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest border border-emerald-100">
                        <FiCheckCircle /> {t('exams.alreadySubmitted')}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-gray-600 text-5xl mx-auto mb-6 border border-slate-100 dark:border-gray-700">
                  <FiFileText />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('exams.noUpcoming')}</h3>
              <p className="text-slate-500 font-medium">{t('exams.noUpcomingDesc')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6">
          <Card title={t('exams.academicResults')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              {examResults.length > 0 ? (
                examResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-700 hover:border-cyan-200 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-transparent shadow-sm flex items-center justify-center text-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                        <FiAward />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{result.course?.name || t('academic')}</p>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{result.exam?.title || t('exams.fallbackTitle')}</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-gray-500">{formatDate(result.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t('exams.score')}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0}%</p>
                      <Badge variant={result.totalMarks > 0 && (result.score / result.totalMarks) >= 0.5 ? 'success' : 'danger'} className="mt-1">
                        {result.totalMarks > 0 && (result.score / result.totalMarks) >= 0.5 ? t('exams.passed') : t('exams.failed')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiAward className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('exams.noPublishedResults')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentExams;
