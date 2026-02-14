import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/Chart';
import { formatDate, formatGrade } from '../lib/utils';

const StudentResults = () => {
  const navigate = useNavigate();
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
      feedback: 'Strong knowledge of fundamental concepts. Review the advanced topics.'
    },
    {
      id: 4,
      examTitle: 'English Composition Midterm',
      course: 'ENG102',
      examDate: '2024-02-01',
      totalMarks: 80,
      obtainedMarks: 72,
      percentage: 90,
      grade: 'A-',
      status: 'published',
      feedback: 'Well-structured essays. Focus on grammar and punctuation.'
    },
    {
      id: 5,
      examTitle: 'Physics Fundamentals Exam',
      course: 'PHYS101',
      examDate: '2024-01-28',
      totalMarks: 100,
      obtainedMarks: 82,
      percentage: 82,
      grade: 'B+',
      status: 'published',
      feedback: 'Good grasp of theoretical concepts. Practice more numerical problems.'
    }
  ]);

  // Prepare data for charts
  const subjectPerformanceData = results.map(result => ({
    name: result.course,
    percentage: result.percentage
  }));

  const gradeDistributionData = [
    { name: 'A+', value: results.filter(r => r.grade === 'A+').length },
    { name: 'A', value: results.filter(r => r.grade === 'A').length },
    { name: 'A-', value: results.filter(r => r.grade === 'A-').length },
    { name: 'B+', value: results.filter(r => r.grade === 'B+').length },
    { name: 'B', value: results.filter(r => r.grade === 'B').length },
    { name: 'Others', value: results.filter(r => !['A+', 'A', 'A-', 'B+', 'B'].includes(r.grade)).length }
  ].filter(item => item.value > 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Results & Performance</h1>
        <p className="text-gray-600">View your exam results and academic performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Grade</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatGrade(Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)).letter}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {Math.max(...results.map(result => result.percentage))}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Performance by Subject">
          <BarChartComponent 
            data={subjectPerformanceData} 
            dataKey="percentage" 
            nameKey="name" 
            title="Subject-wise Performance"
            height={300}
          />
        </Card>

        <Card title="Grade Distribution">
          <PieChartComponent 
            data={gradeDistributionData} 
            dataKey="value" 
            nameKey="name" 
            title="Distribution of Grades"
            height={300}
          />
        </Card>
      </div>

      {/* Results Table */}
      <div className="space-y-6">
        <Card title="Exam Results">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.examTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.examDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${result.percentage >= 90 ? 'bg-green-500' : result.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formatGrade(result.percentage).color}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Individual Result Details */}
        {results.map(result => (
          <Card key={result.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{result.examTitle}</h3>
                <p className="text-gray-600">{result.course}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{result.percentage}%</div>
                <div className={`text-lg font-semibold ${formatGrade(result.percentage).color}`}>
                  Grade: {result.grade}
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Total Marks</h4>
                <p className="text-2xl font-bold text-gray-900">{result.totalMarks}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Obtained Marks</h4>
                <p className="text-2xl font-bold text-gray-900">{result.obtainedMarks}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Date</h4>
                <p className="text-2xl font-bold text-gray-900">{formatDate(result.examDate)}</p>
              </div>
            </div>
            
            {result.feedback && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700">Instructor Feedback:</h4>
                <p className="mt-2 text-gray-700">{result.feedback}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentResults;