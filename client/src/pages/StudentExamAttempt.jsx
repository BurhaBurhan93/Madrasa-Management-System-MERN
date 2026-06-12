import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiBookOpen, 
  FiActivity, 
  FiArrowRight,
  FiFileText,
  FiHelpCircle,
  FiTarget
} from 'react-icons/fi';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => { 
    fetchExam(); 
    checkSubmission(); 
  }, [examId]);

  useEffect(() => {
    if (exam && !submission && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam, submission, timeLeft]);

  const fetchExam = async () => {
    try {
      const res = await axios.get(`${API_BASE}/student/exams/${examId}`, api());
      if (res.data.success) {
        const examData = res.data.data;
        setExam(examData);
        setTimeLeft(examData.duration * 60);
      }
    } catch (e) { 
      console.error(e);
      setError('The examination portal is currently unavailable.');
      setExam(null); // Set null on error
    } finally { setLoading(false); }
  };

  const checkSubmission = async () => {
    try {
      const res = await axios.get(`${API_BASE}/student/exams/${examId}/my-submission`, api());
      if (res.data.success && res.data.data) setSubmission(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Confirm Submission? Once submitted, you cannot modify your answers.')) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/student/exams/${examId}/submit`, { answers }, api());
      if (res.data.success) {
        setSubmission(res.data.data);
        alert(`Assessment completed. Your preliminary score: ${res.data.data.score} / ${res.data.data.totalMarks}`);
        navigate('/student/exams');
      }
    } catch (e) { 
      alert(e.response?.data?.message || 'Submission failed. Check your connection.'); 
    } finally { setSubmitting(false); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <PageSkeleton variant="form" />;
  }

  if (submission) return (
    <div className="max-w-2xl mx-auto py-20 animate-in zoom-in duration-500">
      <Card className="text-center p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border-none bg-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <FiCheckCircle className="text-5xl text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Assessment Completed</h2>
          <p className="text-slate-400 font-medium italic mb-10">Your submission has been securely recorded.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-3xl font-black text-slate-900">{submission.score} / {submission.totalMarks}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-3xl font-black text-emerald-600">{Math.round((submission.score / submission.totalMarks) * 100)}%</p>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full rounded-2xl py-4 bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
            onClick={() => navigate('/student/exams')}
          >
            Back to Examinations
          </Button>
        </div>
        <FiAward className="absolute -right-8 -bottom-8 w-48 h-48 text-slate-50 transform -rotate-12" />
      </Card>
    </div>
  );

  if (!exam) return <div className="p-6 text-red-500 text-center font-bold">Examination details not found.</div>;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Sticky Timer Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 -mx-4 px-4 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
              {exam.title?.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">{exam.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.subject?.name || 'Academic Module'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</p>
              <p className={`text-2xl font-black tabular-nums ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-cyan-600'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
            <Button 
              variant="primary" 
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Final Submission'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Exam Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Questions', value: exam.questions?.length || 0, icon: <FiHelpCircle />, color: 'blue' },
            { label: 'Total Marks', value: exam.totalMarks || 0, icon: <FiTarget />, color: 'purple' },
            { label: 'Time Limit', value: `${exam.duration} Min`, icon: <FiClock />, color: 'amber' }
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {exam.questions?.map((q, i) => (
            <Card key={q._id} className="group rounded-[40px] p-10 bg-white border-none shadow-2xl shadow-slate-200/50 hover:shadow-cyan-100 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                    {i + 1}
                  </div>
                  <div>
                    <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[10px] uppercase tracking-widest mb-2">
                      {q.questionType?.toUpperCase()}
                    </Badge>
                    <h3 className="text-xl font-black text-slate-900 leading-relaxed tracking-tight">
                      {q.question}
                    </h3>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-cyan-50 text-cyan-600 text-xs font-black uppercase tracking-widest">
                  {q.marks} Pts
                </div>
              </div>

              <div className="space-y-4 pl-18">
                {q.questionType === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options?.map((opt, j) => (
                      <label 
                        key={j} 
                        className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                          answers[q._id] === opt 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xl' 
                            : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={q._id} 
                          value={opt} 
                          checked={answers[q._id] === opt} 
                          onChange={() => handleAnswer(q._id, opt)} 
                          className="sr-only" 
                        />
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${answers[q._id] === opt ? 'bg-white/20' : 'bg-white'}`}>
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span className="font-bold text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'truefalse' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map(opt => (
                      <label 
                        key={opt} 
                        className={`flex-1 flex items-center justify-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                          answers[q._id] === opt 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xl' 
                            : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswer(q._id, opt)} className="sr-only" />
                        <span className="font-black uppercase tracking-widest text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(q.questionType === 'short' || q.questionType === 'essay') && (
                  <textarea 
                    value={answers[q._id] || ''} 
                    onChange={e => handleAnswer(q._id, e.target.value)} 
                    rows={q.questionType === 'essay' ? 6 : 2} 
                    placeholder="Type your comprehensive response here..." 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-300" 
                  />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Completion Status Footer */}
        <div className="p-10 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-200">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center text-3xl">
              <FiActivity className="text-cyan-400" />
            </div>
            <div>
              <h4 className="text-xl font-black tracking-tight">Progress Check</h4>
              <p className="text-slate-400 font-medium">{Object.keys(answers).length} of {exam.questions?.length} questions answered</p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button 
              variant="primary" 
              className="w-full md:w-auto px-12 py-5 rounded-3xl bg-cyan-600 hover:bg-cyan-700 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-cyan-900/20"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Finalizing...' : 'Submit Assessment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamAttempt;
