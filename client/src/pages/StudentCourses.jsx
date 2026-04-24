import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiBook, 
  FiSearch, 
  FiFilter, 
  FiArrowRight, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiUser,
  FiActivity,
  FiTrendingUp,
  FiPlayCircle,
  FiAward,
  FiGrid
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/courses`, config);
      const coursesData = response.data || [];
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again.');
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from courses data
  const courseStats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter(c => c.status === 'active').length;
    const completed = courses.filter(c => c.status === 'completed').length;
    const dropped = courses.filter(c => c.status === 'dropped').length;
    const avgProgress = courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
      : 0;
    
    return { total, active, completed, dropped, avgProgress };
  }, [courses]);

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.status === filter;
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="primary" className="font-black uppercase tracking-widest text-[10px]">Active</Badge>;
      case 'completed':
        return <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">Completed</Badge>;
      case 'dropped':
        return <Badge variant="danger" className="font-black uppercase tracking-widest text-[10px]">Dropped</Badge>;
      default:
        return <Badge className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Managing {courses.length} courses this semester</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate('/student/schedule')}
          >
            <FiClock className="w-4 h-4" />
            View Schedule
          </Button>
          <div className={`h-12 px-6 rounded-2xl border flex items-center gap-3 ${
            courseStats.dropped > 0
              ? 'bg-red-50 border-red-100 text-red-600'
              : courseStats.avgProgress >= 75
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            <FiTrendingUp className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">
              {courseStats.avgProgress}% Avg Progress
            </span>
          </div>
        </div>
      </div>

      {/* Course Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FiGrid className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Courses</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{courseStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">This semester</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiPlayCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{courseStats.active}</p>
            <p className="text-sm text-slate-500 mt-1">In progress</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{courseStats.completed}</p>
            <p className="text-sm text-slate-500 mt-1">Finished courses</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Progress</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{courseStats.avgProgress}%</p>
            <div className="mt-2">
              <Progress value={courseStats.avgProgress} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Course Status Distribution" className="rounded-[32px] p-8">
            <PieChartComponent
              data={[
                { name: 'Active', value: courseStats.active },
                { name: 'Completed', value: courseStats.completed },
                { name: 'Not Started', value: courseStats.total - courseStats.active - courseStats.completed }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>

          <Card title="Course Progress Overview" className="rounded-[32px] p-8">
            <BarChartComponent
              data={courses.slice(0, 6).map(course => ({
                name: course.name?.substring(0, 10) || 'Course',
                progress: course.progress || course.grade?.score || 0
              }))}
              dataKey="progress"
              nameKey="name"
              height={300}
            />
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Browse Courses</p>
          <h2 className="text-2xl font-black text-slate-900">Course Catalog</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none w-full sm:w-64 font-medium text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['all', 'active', 'completed'].map((f) => (
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Card key={course._id} className="group relative overflow-hidden rounded-[32px] p-0 border-none bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-100 transition-all duration-300 transform hover:-translate-y-2">
              {/* Card Header Decoration */}
              <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex justify-between items-start relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">{course.courseCode || 'CRS-101'}</p>
                  <h3 className="text-white font-black text-lg line-clamp-1">{course.name}</h3>
                </div>
                <div className="relative z-10">
                  {getStatusBadge(course.status)}
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 bottom-0 opacity-10">
                  <FiBook className="w-24 h-24 transform rotate-12 translate-x-4 translate-y-4" />
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructor</p>
                      <p className="text-sm font-black text-slate-900">{course.teacher?.name || 'Dr. Ahmad Sarwari'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                      <FiClock />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                      <p className="text-sm font-black text-slate-900">{course.schedule || 'Mon, Wed • 10:00 AM'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Progress</p>
                    <p className="text-sm font-black text-cyan-600">{course.progress || 0}%</p>
                  </div>
                  <Progress value={course.progress || 0} max={100} className="h-2 rounded-full" />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    variant="primary" 
                    className="flex-1 rounded-2xl py-4 font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                  >
                    Course Hub
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-14 rounded-2xl border-slate-100 bg-slate-50 flex items-center justify-center hover:bg-white hover:border-cyan-500 hover:text-cyan-600 transition-all"
                    onClick={() => navigate(`/student/attendance?courseId=${course._id}`)}
                  >
                    <FiActivity />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 text-5xl mb-6 border border-slate-100">
              <FiBook />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Courses Found</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">We couldn't find any courses matching your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-8 rounded-2xl px-8 font-black text-xs uppercase tracking-widest border-slate-200"
              onClick={() => { setFilter('all'); setSearchTerm(''); }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
