import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FiAward, 
  FiTrendingUp, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertCircle,
  FiBook,
  FiDownload
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const MOCK_RESULTS = [
  { _id: 'r1', exam: { title: 'Mathematics Quiz 1', subject: { name: 'Mathematics' } }, score: 85, totalMarks: 100, createdAt: '2024-09-20T10:00:00Z' },
  { _id: 'r2', exam: { title: 'Quran Memorization', subject: { name: 'Quranic Studies' } }, score: 92, totalMarks: 100, createdAt: '2024-09-22T10:00:00Z' },
  { _id: 'r3', exam: { title: 'Arabic Grammar Test', subject: { name: 'Arabic Literature' } }, score: 70, totalMarks: 100, createdAt: '2024-09-25T10:00:00Z' },
  { _id: 'r4', exam: { title: 'Islamic History Essay', subject: { name: 'Islamic History' } }, score: 55, totalMarks: 100, createdAt: '2024-09-28T10:00:00Z' },
  { _id: 'r5', exam: { title: 'CS Programming Lab', subject: { name: 'Computer Science' } }, score: 88, totalMarks: 100, createdAt: '2024-09-30T10:00:00Z' },
  { _id: 'r6', exam: { title: 'English Composition', subject: { name: 'English Language' } }, score: 78, totalMarks: 100, createdAt: '2024-10-02T10:00:00Z' },
];

const StudentResults = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResultsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/student/results');
      const data = await parseJsonSafe(res);
      const resultsData = Array.isArray(data) ? data : [];
      setResults(resultsData.length > 0 ? resultsData : MOCK_RESULTS);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(t('student.results.offlineError'));
      setResults(MOCK_RESULTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsData();
  }, []);

  const performanceData = results.map(r => ({
    subject: r.exam?.title?.substring(0, 10) || r.exam?.subject?.name?.substring(0, 10) || t('common.unknown'),
    score: r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0
  }));

  const gpa = results.length > 0 
    ? (results.reduce((sum, r) => sum + (r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0), 0) / (results.length * 25)).toFixed(2)
    : t('common.na');

  const handleExport = useCallback(() => {
    const rows = results.map(r => [
      r.exam?.title || r.exam?.subject?.name || t('student.academic'),
      r.exam?.subject?.name || t('common.na'),
      r.score,
      r.totalMarks,
      r.totalMarks > 0 ? `${Math.round((r.score / r.totalMarks) * 100)}%` : t('common.na'),
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : t('common.na')
    ]);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text(t('student.results.pdfTitle'), 14, 20);
    doc.setFontSize(10);
    doc.text(`${t('student.results.pdfGpa')}: ${gpa} | ${results.length} ${t('student.results.pdfAssessments')}`, 14, 28);
    doc.setFontSize(8);
    doc.text(`${t('student.results.pdfGenerated')}: ${new Date().toLocaleDateString()}`, 14, 34);
    autoTable(doc, {
      startY: 40,
      head: [[t('student.results.pdfExam'), t('student.results.pdfSubject'), t('student.results.pdfScore'), t('student.results.pdfTotal'), t('student.results.pdfPercentage'), t('common.date')]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59], fontSize: 9, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(t('student.results.pdfFileName'));
  }, [results, gpa]);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('student.academic')}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('student.myResults')}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">{t('student.results.subtitle')}</p>
        </div>
        <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2" onClick={handleExport}>
          <FiDownload /> {t('student.exportTranscript')}
        </Button>
      </div>

      {/* GPA & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 p-10 bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-cyan-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100 mb-4">{t('student.results.currentGpa')}</p>
            <h2 className="text-7xl font-black tracking-tighter mb-4">{gpa}</h2>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">{t('student.results.distinction')}</Badge>
          </div>
          {/* Decorative Pattern */}
          <FiAward className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: t('student.results.coursesCompleted'), value: results.length, icon: <FiCheckCircle />, color: 'emerald' },
            { label: t('student.results.creditsEarned'), value: results.length * 3, icon: <FiTrendingUp />, color: 'blue' },
            { label: t('student.results.passed'), value: results.filter(r => r.totalMarks > 0 && (r.score / r.totalMarks) >= 0.5).length, icon: <FiActivity />, color: 'amber' },
            { label: t('student.results.failed'), value: results.filter(r => r.totalMarks > 0 && (r.score / r.totalMarks) < 0.5).length, icon: <FiAward />, color: 'rose' }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title={t('student.results.subjectPerformance')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            {performanceData.length > 0 ? (
              <BarChartComponent 
                data={performanceData}
                dataKey="score"
                nameKey="subject"
                height={350}
              />
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-slate-200">
                <FiActivity className="w-16 h-16 mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">{t('student.results.insufficientData')}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('student.results.detailedGrades')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((r, i) => {
                  const percentage = r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0;
                  return (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-700 hover:border-cyan-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-black text-slate-900 dark:text-white text-sm">{r.exam?.title || r.exam?.subject?.name || t('student.academic')}</p>
                      <span className="text-xs font-black text-cyan-600">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="text-center py-12">
                  <FiBook className="w-10 h-10 text-slate-100 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-slate-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">{t('student.results.noGrades')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
