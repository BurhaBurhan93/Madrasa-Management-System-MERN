import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiTarget, FiCheckCircle, FiFileText, FiArrowRight } from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
const StudentExamResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0
  });

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch('/student/results');
      const data = await parseJsonSafe(res);
      const examResults = Array.isArray(data) ? data : (data.data || []);
      // Normalize ExamAnswer fields to UI-expected shape
      const normalized = examResults.map(r => ({
        _id: r._id,
        examTitle: r.exam?.title || 'Examination',
        subjectName: r.exam?.subject?.name || 'N/A',
        teacherName: r.exam?.createdBy?.name || 'N/A',
        examType: r.exam?.examType?.name || 'General',
        academicYear: r.exam?.academicYear || '',
        score: r.score || 0,
        totalMarks: r.totalMarks || r.exam?.totalMarks || 0,
        grade: r.grade || null,
        submittedAt: r.submittedAt || r.createdAt,
        createdAt: r.createdAt
      }));
      setResults(normalized);

      if (normalized.length > 0) {
        const scores = normalized.map(r => r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0);
        const passedExams = scores.filter(pct => pct >= 40).length;
        setStats({
          totalExams: normalized.length,
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          highestScore: Math.max(...scores),
          passRate: Math.round((passedExams / normalized.length) * 100)
        });
      }
    } catch (err) {
      console.error('[StudentExamResults] Error:', err);
      setError('Failed to fetch exam results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'success',
      'A': 'success',
      'B': 'primary',
      'C': 'warning',
      'D': 'warning',
      'F': 'danger'
    };
    return gradeColors[grade] || 'default';
  };

  const getStatusBadge = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return <Badge variant="success">Excellent</Badge>;
    if (percentage >= 60) return <Badge variant="primary">Good</Badge>;
    if (percentage >= 40) return <Badge variant="warning">Pass</Badge>;
    return <Badge variant="danger">Needs Improvement</Badge>;
  };

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Exam Results</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">View all your examination results with teacher information</p>
        </div>
        <Button 
          variant="primary" 
          className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
          onClick={() => navigate('/student/exams')}
        >
          <FiFileText /> View All Exams
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Exams', value: stats.totalExams, icon: <FiFileText />, color: 'blue', bg: 'from-blue-500 to-blue-600' },
          { label: 'Average Score', value: `${stats.averageScore}%`, icon: <FiTrendingUp />, color: 'emerald', bg: 'from-emerald-500 to-emerald-600' },
          { label: 'Highest Score', value: stats.highestScore, icon: <FiTarget />, color: 'purple', bg: 'from-purple-500 to-purple-600' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: <FiCheckCircle />, color: 'orange', bg: 'from-orange-500 to-orange-600' }
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${stat.bg} p-6 text-white shadow-xl shadow-slate-200/50`}>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
              <div className="text-white/50 text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50 dark:bg-gray-800">
        <div className="overflow-x-auto -mx-8">
          <table className="w-full">
            <thead>
                <tr className="border-b border-slate-100 dark:border-gray-700">
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest">Exam Details</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-8 py-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 text-4xl mx-auto mb-4">
                      <FiFileText />
                    </div>
                    <p className="text-slate-500 font-medium">No exam results found. Complete exams to see your results here.</p>
                  </td>
                </tr>
              ) : (
                results.map((result, index) => (
                  <tr key={result._id || index} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{result.examTitle || 'Exam'}</p>
                        <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{result.academicYear}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{result.subjectName || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-gray-300 font-black text-sm">
                          {result.teacherName?.charAt(0) || 'T'}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{result.teacherName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="info" className="font-black uppercase tracking-widest text-[10px]">{result.examType || 'General'}</Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{result.score || 0} <span className="text-slate-400 dark:text-gray-500">/ {result.totalMarks || 0}</span></p>
                        <p className="text-xs font-bold text-cyan-600">{Math.round(((result.score || 0) / (result.totalMarks || 1)) * 100)}%</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={getGradeColor(result.grade || 'N/A')} className="font-black uppercase tracking-widest text-[10px]">
                        {result.grade || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(result.score || 0, result.totalMarks || 0)}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-gray-400">{formatDate(result.submittedAt || result.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-100 rounded-[32px]">
            <h4 className="text-lg font-black text-blue-900 mb-3 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" /> Overall Performance
            </h4>
            <p className="text-blue-800/80 font-medium text-sm leading-relaxed">
              You have completed {stats.totalExams} exams with an average score of {stats.averageScore}%. Keep up the good work!
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-100 rounded-[32px]">
            <h4 className="text-lg font-black text-emerald-900 mb-3 flex items-center gap-2">
              <FiAward className="text-emerald-600" /> Achievement
            </h4>
            <p className="text-emerald-800/80 font-medium text-sm leading-relaxed">
              Your highest score is {stats.highestScore}. Congratulations on this outstanding achievement!
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-100 rounded-[32px]">
            <h4 className="text-lg font-black text-purple-900 mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-purple-600" /> Success Rate
            </h4>
            <p className="text-purple-800/80 font-medium text-sm leading-relaxed">
              You have successfully passed {stats.passRate}% of your exams. Excellent progress!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamResults;
