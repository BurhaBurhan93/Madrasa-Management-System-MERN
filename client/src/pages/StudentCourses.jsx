import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import { BarChartComponent } from '../components/UIHelper/Chart';
import { formatGrade } from '../lib/utils';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'MATH201',
      title: 'Advanced Mathematics',
      instructor: 'Dr. Ali Hassan',
      credits: 3,
      semester: 'Spring 2024',
      status: 'active',
      progress: 75,
      grade: 85,
      assignmentsCompleted: 4,
      assignmentsTotal: 5,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      code: 'ARAB101',
      title: 'Arabic Language Fundamentals',
      instructor: 'Prof. Fatima Ahmed',
      credits: 4,
      semester: 'Spring 2024',
      status: 'active',
      progress: 90,
      grade: 92,
      assignmentsCompleted: 6,
      assignmentsTotal: 6,
      color: 'bg-green-500'
    },
    {
      id: 3,
      code: 'ISLM202',
      title: 'Islamic Jurisprudence',
      instructor: 'Sheikh Omar Farooq',
      credits: 3,
      semester: 'Spring 2024',
      status: 'active',
      progress: 60,
      grade: 78,
      assignmentsCompleted: 3,
      assignmentsTotal: 5,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      code: 'ENG102',
      title: 'English Composition',
      instructor: 'Ms. Sarah Johnson',
      credits: 3,
      semester: 'Spring 2024',
      status: 'active',
      progress: 85,
      grade: 88,
      assignmentsCompleted: 5,
      assignmentsTotal: 5,
      color: 'bg-yellow-500'
    },
    {
      id: 5,
      code: 'PHYS101',
      title: 'Physics Fundamentals',
      instructor: 'Dr. Muhammad Khan',
      credits: 4,
      semester: 'Spring 2024',
      status: 'active',
      progress: 70,
      grade: 82,
      assignmentsCompleted: 4,
      assignmentsTotal: 6,
      color: 'bg-red-500'
    }
  ]);

  // Mock data for performance chart
  const performanceData = courses.map(course => ({
    name: course.code,
    grade: course.grade
  }));

  const handleViewCourse = (courseId) => {
    // In a real app, this would navigate to the course details page
    console.log(`Viewing course ${courseId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">Track your enrolled courses and academic progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Grade</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(courses.reduce((sum, course) => sum + course.grade, 0) / courses.length)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.assignmentsCompleted, 0)}/
                {courses.reduce((sum, course) => sum + course.assignmentsTotal, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <Card title="Overall Performance">
          <BarChartComponent 
            data={performanceData} 
            dataKey="grade" 
            nameKey="name" 
            title="Grade Distribution Across Courses"
            height={300}
          />
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        <Card title="Enrolled Courses">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${course.color} mr-3`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.code}</div>
                          <div className="text-sm text-gray-500">{course.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${course.color}`} 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{course.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formatGrade(course.grade).color}`}>
                        {course.grade}% ({formatGrade(course.grade).letter})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentCourses;