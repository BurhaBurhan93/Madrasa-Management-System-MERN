import { useState } from 'react';

const Results = () => {
  const [results, setResults] = useState([
    {
      id: 1,
      examTitle: 'Midterm Examination - Calculus',
      course: 'MATH201',
      examDate: '2024-02-15',
      totalMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: 'A',
      status: 'published',
      feedback: 'Good understanding of calculus concepts. Work on integration techniques.'
    },
    {
      id: 2,
      examTitle: 'Arabic Language Proficiency Test',
      course: 'ARAB101',
      examDate: '2024-02-10',
      totalMarks: 75,
      obtainedMarks: 68,
      percentage: 91,
      grade: 'A-',
      status: 'published',
      feedback: 'Excellent grasp of Arabic grammar. Need improvement in writing skills.'
    },
    {
      id: 3,
      examTitle: 'Islamic Jurisprudence Quiz',
      course: 'ISLM202',
      examDate: '2024-02-05',
      totalMarks: 50,
      obtainedMarks: 45,
      percentage: 90,
      grade: 'A-',
      status: 'published',
      feedback: 'Strong knowledge of Islamic jurisprudence fundamentals.'
    },
    {
      id: 4,
      examTitle: 'Physics Mechanics Exam',
      course: 'PHYS101',
      examDate: '2024-01-28',
      totalMarks: 120,
      obtainedMarks: 108,
      percentage: 90,
      grade: 'A-',
      status: 'published',
      feedback: 'Excellent performance in mechanics problems. Good problem-solving approach.'
    },
    {
      id: 5,
      examTitle: 'English Literature Analysis',
      course: 'ENG102',
      examDate: '2024-01-20',
      totalMarks: 150,
      obtainedMarks: 132,
      percentage: 88,
      grade: 'B+',
      status: 'published',
      feedback: 'Well-structured analysis with good critical thinking. Work on citation format.'
    }
  ]);

  const [semesterResults, setSemesterResults] = useState([
    {
      semester: 'Fall 2023',
      sgpa: 3.75,
      cgpa: 3.68,
      totalCredits: 15,
      completedCredits: 15,
      subjects: [
        { course: 'MATH101', grade: 'A-', credits: 3, marks: 82 },
        { course: 'CS101', grade: 'B+', credits: 4, marks: 78 },
        { course: 'ENG101', grade: 'A', credits: 3, marks: 88 },
        { course: 'ISLM101', grade: 'A', credits: 2, marks: 90 },
        { course: 'ARAB101', grade: 'B+', credits: 3, marks: 76 }
      ]
    },
    {
      semester: 'Spring 2024',
      sgpa: 3.82,
      cgpa: 3.75,
      totalCredits: 16,
      completedCredits: 12,
      subjects: [
        { course: 'MATH201', grade: 'A', credits: 3, marks: 85 },
        { course: 'PHYS101', grade: 'A-', credits: 4, marks: 87 },
        { course: 'ENG102', grade: 'B+', credits: 3, marks: 80 },
        { course: 'ISLM202', grade: 'A-', credits: 3, marks: 83 }
      ]
    }
  ]);

  const [selectedResult, setSelectedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('exam-results');

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'A-':
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'B':
      case 'B-':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
      case 'C-':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
  };

  const handleBackToList = () => {
    setSelectedResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Results & Performance</h2>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>All Semesters</option>
            <option>Fall 2023</option>
            <option>Spring 2024</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current CGPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {semesterResults[semesterResults.length - 1]?.cgpa || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current SGPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {semesterResults[semesterResults.length - 1]?.sgpa || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {semesterResults.reduce((acc, sem) => acc + sem.completedCredits, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((results.filter(r => r.percentage >= 50).length / results.length) * 100) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('exam-results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exam-results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exam Results
            </button>
            <button
              onClick={() => setActiveTab('semester-results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'semester-results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Semester Results
            </button>
            <button
              onClick={() => setActiveTab('performance-analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance-analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'exam-results' && (
            <div className="space-y-4">
              {results.map(result => (
                <div 
                  key={result.id} 
                  className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewResult(result)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{result.examTitle}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600">{result.course}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">Obtained: {result.obtainedMarks}/{result.totalMarks}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">Date: {formatDate(result.examDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPerformanceColor(result.percentage)}`}
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 mt-1">Performance</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'semester-results' && (
            <div className="space-y-6">
              {semesterResults.map((semester, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">{semester.semester}</h3>
                      <div className="flex space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">SGPA</p>
                          <p className="text-xl font-bold text-gray-800">{semester.sgpa}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">CGPA</p>
                          <p className="text-xl font-bold text-gray-800">{semester.cgpa}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Credits</p>
                          <p className="text-xl font-bold text-gray-800">{semester.completedCredits}/{semester.totalCredits}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Subjects</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {semester.subjects.map((subject, subIndex) => (
                            <tr key={subIndex} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.course}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.marks}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                                  {subject.grade}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance-analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Distribution</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">A Grades (90-100%)</span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.filter(r => r.percentage >= 90).length}/{results.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(results.filter(r => r.percentage >= 90).length / results.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">B Grades (80-89%)</span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.filter(r => r.percentage >= 80 && r.percentage < 90).length}/{results.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(results.filter(r => r.percentage >= 80 && r.percentage < 90).length / results.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">C Grades (70-79%)</span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.filter(r => r.percentage >= 70 && r.percentage < 80).length}/{results.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(results.filter(r => r.percentage >= 70 && r.percentage < 80).length / results.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Below C (Under 70%)</span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.filter(r => r.percentage < 70).length}/{results.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(results.filter(r => r.percentage < 70).length / results.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Performance</h4>
                  <div className="space-y-4">
                    {['MATH201', 'ARAB101', 'ISLM202', 'ENG102', 'PHYS101'].map(course => {
                      const courseResults = results.filter(r => r.course === course);
                      if (courseResults.length === 0) return null;
                      
                      const avgPercentage = courseResults.reduce((sum, r) => sum + r.percentage, 0) / courseResults.length;
                      
                      return (
                        <div key={course}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{course}</span>
                            <span className="text-sm font-medium text-gray-700">{Math.round(avgPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getPerformanceColor(avgPercentage)} h-2 rounded-full`} 
                              style={{ width: `${avgPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Progress</h4>
                <div className="flex items-end justify-between h-40 pt-10">
                  {semesterResults.map((semester, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-8 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${(semester.sgpa / 4) * 100}px` }}
                        title={`SGPA: ${semester.sgpa}`}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 text-center">{semester.semester.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">{selectedResult.examTitle}</h3>
                <button 
                  onClick={handleBackToList}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Result Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">{selectedResult.course}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedResult.examDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Marks:</span>
                      <span className="font-medium">{selectedResult.totalMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Obtained Marks:</span>
                      <span className="font-medium">{selectedResult.obtainedMarks}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Grade Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Percentage:</span>
                      <span className="font-medium">{selectedResult.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className={`font-medium px-2 py-1 rounded ${getGradeColor(selectedResult.grade)}`}>
                        {selectedResult.grade}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Published</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Performance Analysis</h4>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`${getPerformanceColor(selectedResult.percentage)} h-4 rounded-full`}
                    style={{ width: `${selectedResult.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span>Your Score: {selectedResult.percentage}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              {selectedResult.feedback && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Instructor Feedback</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedResult.feedback}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Download Certificate
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Download Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;