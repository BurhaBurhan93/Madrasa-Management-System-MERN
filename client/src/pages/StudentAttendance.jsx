import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FiActivity, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiFilter, 
  FiPieChart,
  FiArrowRight
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseIdParam = queryParams.get('courseId');

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/attendance`, config);
      setAttendanceData(response.data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to fetch attendance records. Please try again.');
      setAttendanceData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const stats = React.useMemo(() => {
    const data = courseIdParam 
      ? attendanceData.filter(r => r.course?._id === courseIdParam || r.course === courseIdParam)
      : attendanceData;
      
    const total = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent = data.filter(r => r.status === 'absent').length;
    const late = data.filter(r => r.status === 'late').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    return { total, present, absent, late, rate, data };
  }, [attendanceData, courseIdParam]);

  const chartData = [
    { name: 'Present', value: stats.present, color: '#10B981' },
    { name: 'Absent', value: stats.absent, color: '#EF4444' },
    { name: 'Late', value: stats.late, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  const filteredRecords = stats.data.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present': return <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">Present</Badge>;
      case 'absent': return <Badge variant="danger" className="font-black uppercase tracking-widest text-[10px]">Absent</Badge>;
      case 'late': return <Badge variant="warning" className="font-black uppercase tracking-widest text-[10px]">Late</Badge>;
      default: return <Badge className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            {courseIdParam ? 'Course-specific attendance tracking' : 'Overall institutional attendance record'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['all', 'present', 'absent', 'late'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Overall Rate', value: `${stats.rate}%`, icon: <FiActivity />, color: 'cyan' },
          { label: 'Days Present', value: stats.present, icon: <FiCheckCircle />, color: 'emerald' },
          { label: 'Days Absent', value: stats.absent, icon: <FiXCircle />, color: 'rose' },
          { label: 'Days Late', value: stats.late, icon: <FiClock />, color: 'amber' }
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
        {/* Attendance List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Attendance History" className="rounded-[32px] p-8">
            <div className="space-y-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 
                        record.status === 'absent' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <FiCalendar />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{formatDate(record.date)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {record.course?.name || 'General Session'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiCalendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No records found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-8">
          <Card title="Distribution" className="rounded-[32px] p-8">
            {chartData.length > 0 ? (
              <PieChartComponent 
                data={chartData}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-300">
                <FiPieChart className="w-12 h-12 mb-4" />
                <p className="font-bold text-sm">Insufficient data</p>
              </div>
            )}
            <div className="mt-6 space-y-3">
              {chartData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-slate-900">{Math.round((item.value / stats.total) * 100)}%</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Need Leave?</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Apply for absence or medical leave through our portal.</p>
              <Button 
                variant="primary" 
                className="w-full rounded-2xl py-4 bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest"
                onClick={() => navigate('/student/leave')}
              >
                Apply for Leave
              </Button>
            </div>
            <FiCalendar className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 transform -rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
