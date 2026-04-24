import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResultsData();
  }, []);

  const fetchResultsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/results`, config);
      const resultsData = response.data || [];
      setResults(resultsData);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch results. Please try again.');
      setResults([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const performanceData = results.map(r => ({
    subject: r.exam?.title?.substring(0, 10) || r.course?.name?.substring(0, 10) || 'Unknown',
    score: r.percentage || r.score || 0
  }));

  const gpa = results.length > 0 
    ? (results.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / (results.length * 25)).toFixed(2)
    : '0.00';

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Performance</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Comprehensive review of your grades and achievements</p>
        </div>
        <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
          <FiDownload /> Export Transcript
        </Button>
      </div>

      {/* GPA & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 p-10 bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-cyan-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100 mb-4">Current GPA</p>
            <h2 className="text-7xl font-black tracking-tighter mb-4">{gpa}</h2>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">Distinction</Badge>
          </div>
          {/* Decorative Pattern */}
          <FiAward className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Courses Completed', value: results.length, icon: <FiCheckCircle />, color: 'emerald' },
            { label: 'Credits Earned', value: results.length * 3, icon: <FiTrendingUp />, color: 'blue' },
            { label: 'Rank in Class', value: '#12', icon: <FiActivity />, color: 'amber' },
            { label: 'Certificates', value: '4', icon: <FiAward />, color: 'rose' }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Subject Performance" className="rounded-[32px] p-8">
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
                <p className="font-bold text-sm uppercase tracking-widest">Insufficient data</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Detailed Grades" className="rounded-[32px] p-8">
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((result, i) => {
                  const percentage = result.percentage || result.score || 0;
                  return (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-black text-slate-900 text-sm">{result.exam?.title || result.course?.name || 'Academic'}</p>
                      <span className="text-xs font-black text-cyan-600">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
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
                  <FiBook className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No grades recorded</p>
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
