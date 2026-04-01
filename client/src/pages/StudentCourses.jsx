import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import ErrorPage from '../components/UIHelper/ErrorPage';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import { formatGrade } from '../lib/utils';
import axios from 'axios';

const StudentCourses = () => {
  console.log('[StudentCourses] Component initializing...');
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentCourses] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentCourses] useEffect triggered - fetching data from API...');
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentCourses] Fetching courses from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/courses', config);
      
      console.log('[StudentCourses] API response:', response.data);
      setCourses(response.data || []);
    } catch (err) {
      console.error('[StudentCourses] Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses
    .filter(course => {
      if (filter === 'all') return true;
      return course.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'grade') {
        return (b.grade?.score || 0) - (a.grade?.score || 0);
      } else if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'dropped':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'dropped':
        return 'Dropped';
      default:
        return status;
    }
  };

  const handleViewCourse = (courseId) => {
    console.log('[StudentCourses] Viewing course:', courseId);
    navigate(`/courses/${courseId}`);
  };

  const handleViewSyllabus = (courseId) => {
    console.log('[StudentCourses] Viewing syllabus:', courseId);
    navigate(`/courses/${courseId}/syllabus`);
  };

  const handleViewGrades = (courseId) => {
    console.log('[StudentCourses] Viewing grades:', courseId);
    navigate(`/courses/${courseId}/grades`);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">View and manage your enrolled courses</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="generic" 
          title="Unable to Load Courses"
          message={error}
          onRetry={fetchCoursesData}
          onHome={() => window.location.href = '/student/dashboard'}
          showBackButton={false}
        />
      )}

      {loading && courses.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      ) : (
      <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {courses.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Courses</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {courses.reduce((sum, course) => sum + course.credits, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Credits</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {courses.filter(c => c.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Course Status Distribution">
          <PieChartComponent 
            data={[
              { name: 'Active', value: courses.filter(c => c.status === 'active').length, color: '#3B82F6' },
              { name: 'Completed', value: courses.filter(c => c.status === 'completed').length, color: '#10B981' },
              { name: 'Dropped', value: courses.filter(c => c.status === 'dropped').length, color: '#EF4444' }
            ].filter(d => d.value > 0)}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>

        <Card title="Credits by Course">
          <BarChartComponent 
            data={courses.map(c => ({
              name: c.name?.substring(0, 15) || 'Unknown',
              value: c.credits || 0
            }))}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="grade">Sort by Grade</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.code}</p>
                </div>
                <Badge variant={getStatusColor(course.status)}>
                  {getStatusText(course.status)}
                </Badge>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                <p className="text-sm text-gray-600">Credits: {course.credits}</p>
                <p className="text-sm text-gray-600">Semester: {course.semester}</p>
              </div>
              
              {course.grade && (
                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Grade:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {course.grade.score} ({course.grade.letter})
                    </span>
                  </div>
                  <Progress 
                    value={course.progress} 
                    max={100} 
                    label="Progress" 
                    className="mt-2" 
                  />
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Schedule: {course.schedule}</p>
                <p className="text-sm text-gray-600">Location: {course.location}</p>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewCourse(course.id)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewSyllabus(course.id)}
                >
                  Syllabus
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewGrades(course.id)}
                >
                  Grades
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      </div>
      )}
    </div>
  );
};

export default StudentCourses;
