import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import { formatGrade } from '../lib/utils';

const StudentCourses = () => {
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'MATH101',
      name: 'Calculus I',
      instructor: 'Dr. Ahmed Hassan',
      credits: 4,
      semester: 'Fall 2023',
      status: 'active',
      progress: 75,
      grade: { score: 85, letter: 'B', gpa: 3.3 },
      schedule: 'Mon/Wed 09:00-10:30 AM',
      location: 'Room 201'
    },
    {
      id: 2,
      code: 'PHYS101',
      name: 'General Physics I',
      instructor: 'Prof. Sarah Ali',
      credits: 3,
      semester: 'Fall 2023',
      status: 'active',
      progress: 90,
      grade: { score: 92, letter: 'A-', gpa: 3.7 },
      schedule: 'Tue/Thu 11:00-12:30 PM',
      location: 'Room 305'
    },
    {
      id: 3,
      code: 'CHEM101',
      name: 'General Chemistry I',
      instructor: 'Dr. Mohammed Khan',
      credits: 3,
      semester: 'Fall 2023',
      status: 'active',
      progress: 60,
      grade: { score: 78, letter: 'C+', gpa: 2.3 },
      schedule: 'Mon/Wed 02:00-03:30 PM',
      location: 'Room 402'
    },
    {
      id: 4,
      code: 'ARAB101',
      name: 'Arabic Language I',
      instructor: 'Dr. Fatima Al-Rashid',
      credits: 2,
      semester: 'Fall 2023',
      status: 'active',
      progress: 85,
      grade: { score: 95, letter: 'A', gpa: 4.0 },
      schedule: 'Tue/Thu 09:00-10:00 AM',
      location: 'Room 105'
    },
    {
      id: 5,
      code: 'HIST101',
      name: 'Islamic History',
      instructor: 'Dr. Omar Farooq',
      credits: 3,
      semester: 'Fall 2023',
      status: 'completed',
      progress: 100,
      grade: { score: 88, letter: 'B+', gpa: 3.3 },
      schedule: 'Mon/Wed 10:30-12:00 PM',
      location: 'Room 210'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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
    navigate(`/courses/${courseId}`);
  };

  const handleViewSyllabus = (courseId) => {
    // Navigate to syllabus view
    navigate(`/courses/${courseId}/syllabus`);
  };

  const handleViewGrades = (courseId) => {
    // Navigate to grades view
    navigate(`/courses/${courseId}/grades`);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">View and manage your enrolled courses</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8">
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
    </div>
  );
};

export default StudentCourses;