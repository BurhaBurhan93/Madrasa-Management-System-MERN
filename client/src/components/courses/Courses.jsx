import { useState, useEffect } from 'react';

const Courses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: 1,
      code: 'MATH201',
      title: 'Advanced Mathematics',
      instructor: 'Dr. Ali Hassan',
      credits: 3,
      semester: 'Spring 2024',
      status: 'active',
      progress: 75,
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
      color: 'bg-purple-500'
    },
    {
      id: 4,
      code: 'ENG102',
      title: 'English Composition',
      instructor: 'Ms. Sarah Johnson',
      credits: 2,
      semester: 'Spring 2024',
      status: 'active',
      progress: 45,
      color: 'bg-yellow-500'
    },
    {
      id: 5,
      code: 'PHYS101',
      title: 'Physics Principles',
      instructor: 'Dr. Muhammad Khan',
      credits: 4,
      semester: 'Spring 2024',
      status: 'completed',
      progress: 100,
      color: 'bg-red-500'
    }
  ]);

  const [courseMaterials, setCourseMaterials] = useState({
    1: [
      { id: 1, title: 'Chapter 1: Algebra Basics', type: 'pdf', size: '2.4 MB', date: '2024-01-15' },
      { id: 2, title: 'Homework Assignment 1', type: 'doc', size: '1.1 MB', date: '2024-01-20' },
      { id: 3, title: 'Practice Problems Set', type: 'pdf', size: '3.2 MB', date: '2024-01-25' }
    ],
    2: [
      { id: 4, title: 'Arabic Alphabet Guide', type: 'pdf', size: '1.8 MB', date: '2024-01-10' },
      { id: 5, title: 'Grammar Exercises', type: 'doc', size: '0.9 MB', date: '2024-01-18' }
    ]
  });

  const [announcements, setAnnouncements] = useState({
    1: [
      { id: 1, title: 'Midterm exam scheduled for March 15th', date: '2024-02-10', priority: 'high' },
      { id: 2, title: 'New chapter added to course material', date: '2024-02-05', priority: 'medium' }
    ],
    2: [
      { id: 3, title: 'Quiz on Arabic grammar next week', date: '2024-02-08', priority: 'high' }
    ]
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setActiveTab('materials');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📁';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Request Course Enrollment
        </button>
      </div>

      {!selectedCourse ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map(course => (
            <div 
              key={course.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course)}
            >
              <div className={`${course.color} p-5 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{course.code}</h3>
                    <p className="text-sm opacity-90">{course.semester}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-20'
                  }`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
                <h4 className="font-semibold mt-3">{course.title}</h4>
                <p className="text-sm opacity-90 mt-1">Instructor: {course.instructor}</p>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">{course.credits} Credits</span>
                  <span className="text-sm font-medium">Progress: {course.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${course.color}`} 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    {courseMaterials[course.id]?.length || 0} Materials
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackToCourses}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Courses
            </button>
            <h3 className="text-xl font-bold text-gray-800">{selectedCourse.code} - {selectedCourse.title}</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-800">{selectedCourse.instructor}</h4>
                <p className="text-gray-600">{selectedCourse.credits} Credits • {selectedCourse.semester}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress: {selectedCourse.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${selectedCourse.color}`} 
                  style={{ width: `${selectedCourse.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tabs for course details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'materials'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Course Materials
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'announcements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructor'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Instructor Details
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'materials' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Course Materials</h4>
                  {courseMaterials[selectedCourse.id] && courseMaterials[selectedCourse.id].length > 0 ? (
                    <div className="space-y-3">
                      {courseMaterials[selectedCourse.id].map(material => (
                        <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getFileIcon(material.type)}</span>
                            <div>
                              <h5 className="font-medium text-gray-800">{material.title}</h5>
                              <p className="text-sm text-gray-600">{material.size} • Uploaded: {material.date}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No course materials available yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'announcements' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Course Announcements</h4>
                  {announcements[selectedCourse.id] && announcements[selectedCourse.id].length > 0 ? (
                    <div className="space-y-4">
                      {announcements[selectedCourse.id].map(announcement => (
                        <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                          announcement.priority === 'high' 
                            ? 'border-red-500 bg-red-50' 
                            : announcement.priority === 'medium' 
                              ? 'border-yellow-500 bg-yellow-50' 
                              : 'border-blue-500 bg-blue-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-800">{announcement.title}</h5>
                            <span className="text-sm text-gray-500">{announcement.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No announcements for this course.</p>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Instructor Information</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                        {selectedCourse.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="font-bold text-lg">{selectedCourse.instructor}</h5>
                        <p className="text-gray-600">Professor of {selectedCourse.title.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Contact Information</h6>
                        <p className="text-sm text-gray-600">📧 instructor@example.com</p>
                        <p className="text-sm text-gray-600">📞 +123-456-7890</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Office Hours</h6>
                        <p className="text-sm text-gray-600">Mon/Wed: 2:00 PM - 4:00 PM</p>
                        <p className="text-sm text-gray-600">Tue/Thu: 10:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;