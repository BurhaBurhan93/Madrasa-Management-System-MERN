import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiAward, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiActivity, 
  FiTrendingUp, 
  FiBookOpen,
  FiArrowRight,
  FiInfo,
  FiFileText
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDegree = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledDegrees, setEnrolledDegrees] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    activeDegrees: 0,
    completedDegrees: 0,
    totalCredits: 0
  });

  useEffect(() => {
    fetchDegreeData();
  }, []);

  const fetchDegreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/degrees`, config);
      const enrolled = response.data || [];
      setEnrolledDegrees(enrolled);
      
      setStats({
        totalEnrolled: enrolled.length,
        activeDegrees: enrolled.filter(d => d.status === 'active').length,
        completedDegrees: enrolled.filter(d => d.status === 'completed').length,
        totalCredits: enrolled.reduce((acc, d) => acc + (d.degree?.credits || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching degree data:', err);
      setError('Failed to fetch degree data. Please try again.');
      setEnrolledDegrees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">Active</Badge>;
      case 'completed': return <Badge variant="primary" className="font-black uppercase tracking-widest text-[10px]">Completed</Badge>;
      case 'inactive': return <Badge variant="danger" className="font-black uppercase tracking-widest text-[10px]">Inactive</Badge>;
      default: return <Badge className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  };

  const degreeStatusData = [
    { name: 'Active', value: stats.activeDegrees, color: '#10B981' },
    { name: 'Completed', value: stats.completedDegrees, color: '#3B82F6' },
    { name: 'Inactive', value: stats.totalEnrolled - stats.activeDegrees - stats.completedDegrees, color: '#EF4444' }
  ].filter(d => d.value > 0);

  if (loading && enrolledDegrees.length === 0) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Degree Programs</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Monitor your progress towards graduation</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 bg-white flex items-center gap-2 font-black text-xs uppercase tracking-widest">
            <FiFileText /> View Transcript
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled', value: stats.totalEnrolled, icon: <FiAward />, color: 'blue' },
          { label: 'Active Programs', value: stats.activeDegrees, icon: <FiCheckCircle />, color: 'emerald' },
          { label: 'Completed', value: stats.completedDegrees, icon: <FiTrendingUp />, color: 'purple' },
          { label: 'Total Credits', value: stats.totalCredits, icon: <FiBookOpen />, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Degrees List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="My Enrolled Programs" className="rounded-[32px] p-8">
            {enrolledDegrees.length === 0 ? (
              <div className="text-center py-20">
                <FiAward className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No programs enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledDegrees.map((enrollment) => (
                  <div key={enrollment._id} className="group p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                          <FiAward />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{enrollment.degree?.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {enrollment.degree?.code} • {enrollment.degree?.duration} • {enrollment.academicYear}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                        <p className="text-sm font-black text-slate-700">{enrollment.degree?.credits}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enrolled</p>
                        <p className="text-sm font-black text-slate-700">{formatDate(enrollment.enrollmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Courses</p>
                        <p className="text-sm font-black text-slate-700">{enrollment.completedCourses || 0} / {enrollment.totalCourses || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current GPA</p>
                        <p className="text-sm font-black text-emerald-600">3.85</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Progress</p>
                        <p className="text-sm font-black text-cyan-600">{enrollment.progress || 0}%</p>
                      </div>
                      <Progress value={enrollment.progress || 0} max={100} className="h-2 rounded-full" />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <Button variant="outline" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group/btn">
                        View Curriculum <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Distribution */}
        <div className="space-y-8">
          <Card title="Program Distribution" className="rounded-[32px] p-8">
            {degreeStatusData.length > 0 ? (
              <PieChartComponent 
                data={degreeStatusData}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-200">
                <FiActivity className="w-12 h-12 mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">No data available</p>
              </div>
            )}
          </Card>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Graduation Ready?</h4>
              <p className="text-slate-400 text-sm font-medium mb-6">Apply for your certificate once you complete all requirements.</p>
              <Button variant="primary" className="w-full rounded-2xl py-4 bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest transition-all">
                Apply for Graduation
              </Button>
            </div>
            <FiAward className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDegree;
