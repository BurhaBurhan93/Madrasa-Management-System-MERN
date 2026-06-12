import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import axios from 'axios';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentExams = () => {
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    Promise.all([fetchExamsData(), fetchExamResults()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchExamsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/exams`, config);
      const examsData = response.data || [];
      setExams(examsData);
      
      // Also fetch submissions
      const submissionsData = [];
      for (const exam of examsData) {
        try {
          const submissionRes = await axios.get(`${API_BASE}/student/exams/${exam._id || exam.id}/my-submission`, config);
          if (submissionRes.data) {
            submissionsData.push({
              examId: exam._id || exam.id,
              ...submissionRes.data
            });
          }
        } catch (err) {
          // No submission for this exam
        }
      }
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to fetch exams. Please try again.');
      setExams([]); // Set empty array on error
    }
  };

  const fetchExamResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/final-results`, config);
      const resultsData = response.data || [];
      setExamResults(resultsData);
    } catch (err) {
      console.error('Error fetching exam results:', err);
      setError('Failed to fetch exam results. Please try again.');
      setExamResults([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Calculate exam stats
  const examStats = useMemo(() => {
    const totalExams = exams.length;
    const completed = examResults.length;
    const upcoming = totalExams - submissions.length;
    const avgScore = examResults.length > 0
      ? Math.round(examResults.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / examResults.length)
      : 0;
    const passed = examResults.filter(r => (r.percentage || r.score || 0) >= 50).length;
    
    return { totalExams, completed, upcoming, avgScore, passed };
  }, [exams, examResults, submissions]);

  const hasSubmitted = (examId) => {
    return submissions.find(s => s.examId === examId || s.exam === examId);
  };

  const publishedExams = exams.filter(e => e.status === 'published' || e.status === 'scheduled');

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Examinations</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track upcoming tests and review your performance</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: <FiClock /> },
            { id: 'past', label: 'Results', icon: <FiAward /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
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
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FiClipboard className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Exams</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{examStats.totalExams}</p>
            <p className="text-sm text-slate-500 mt-1">Published exams</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{examStats.completed}</p>
            <p className="text-sm text-slate-500 mt-1">Exams taken</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upcoming</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{examStats.upcoming}</p>
            <p className="text-sm text-slate-500 mt-1">Not yet attempted</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Score</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{examStats.avgScore}%</p>
            <p className="text-sm text-slate-500 mt-1">{examStats.passed} exams passed</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {exams.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Exam Status Distribution" className="rounded-[32px] p-8">
            <PieChartComponent
              data={[
                { name: 'Upcoming', value: examStats.upcoming },
                { name: 'Completed', value: examStats.completed },
                { name: 'Missed', value: examStats.missed }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>

          <Card title="Exam Performance Overview" className="rounded-[32px] p-8">
            {examResults.length > 0 ? (
              <BarChartComponent
                data={examResults.slice(0, 6).map(result => ({
                  name: result.exam?.title?.substring(0, 10) || 'Exam',
                  score: result.score || result.percentage || 0
                }))}
                dataKey="score"
                nameKey="name"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <p className="font-bold">No exam results yet</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center gap-4 text-rose-600">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
          <Button variant="outline" size="sm" className="ml-auto rounded-xl border-rose-200 text-rose-600" onClick={fetchExamResults}>Retry</Button>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publishedExams.length > 0 ? (
            publishedExams.map(exam => (
              <Card key={exam._id || exam.id} className="group relative overflow-hidden rounded-[32px] p-0 border-none bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-2 bg-cyan-500 w-full"></div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{exam.course || exam.subject?.name || 'GENERAL'}</p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{exam.title}</h3>
                    </div>
                    <Badge variant="primary" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest">LIVE</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <FiCalendar className="text-cyan-500" />
                        {exam.publishDate || exam.startDate ? formatDate(exam.publishDate || exam.startDate) : 'TBD'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <FiClock className="text-cyan-500" />
                        {exam.duration} mins
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                    <p className="text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-2">
                      {exam.description || "Comprehensive assessment covering current module objectives."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!hasSubmitted(exam._id || exam.id) ? (
                      <Button
                        variant="primary"
                        className="flex-1 rounded-2xl py-4 font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                        onClick={() => navigate(`/student/exams/${exam._id || exam.id}/attempt`)}
                      >
                        Start Exam <FiArrowRight />
                      </Button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest border border-emerald-100">
                        <FiCheckCircle /> Already Submitted
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 text-5xl mx-auto mb-6 border border-slate-100">
                <FiFileText />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Upcoming Exams</h3>
              <p className="text-slate-500 font-medium">Your examination schedule is currently clear.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6">
          <Card title="Academic Results" className="rounded-[32px] p-8">
            <div className="space-y-4">
              {examResults.length > 0 ? (
                examResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                        <FiAward />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{result.course?.name || 'Academic'}</p>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{result.exam?.title || 'Examination'}</h4>
                        <p className="text-xs font-bold text-slate-400">{formatDate(result.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                      <p className="text-2xl font-black text-slate-900">{result.percentage}%</p>
                      <Badge variant={result.percentage >= 50 ? 'success' : 'danger'} className="mt-1">
                        {result.percentage >= 50 ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiAward className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No results published yet</p>
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
