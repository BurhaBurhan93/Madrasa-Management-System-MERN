import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import ErrorPage from '../components/UIHelper/ErrorPage';
import axios from 'axios';

const StudentExamResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/exam-results', config);
      
      const examResults = response.data || [];
      setResults(examResults);

      // Calculate statistics
      if (examResults.length > 0) {
        const totalScore = examResults.reduce((sum, r) => sum + (r.score || 0), 0);
        const totalMarks = examResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
        const passedExams = examResults.filter(r => {
          const percentage = (r.score / r.totalMarks) * 100;
          return percentage >= 40; // Assuming 40% is passing
        }).length;

        setStats({
          totalExams: examResults.length,
          averageScore: Math.round(totalScore / examResults.length),
          highestScore: Math.max(...examResults.map(r => r.score || 0)),
          passRate: Math.round((passedExams / examResults.length) * 100)
        });
      }
    } catch (err) {
      console.error('[StudentExamResults] Error:', err);
      setError('Failed to fetch exam results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'success',
      'A': 'success',
      'B': 'primary',
      'C': 'warning',
      'D': 'warning',
      'F': 'danger'
    };
    return gradeColors[grade] || 'default';
  };

  const getStatusBadge = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return <Badge variant="success">Excellent</Badge>;
    if (percentage >= 60) return <Badge variant="primary">Good</Badge>;
    if (percentage >= 40) return <Badge variant="warning">Pass</Badge>;
    return <Badge variant="danger">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exam results...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <ErrorPage 
        type="generic" 
        title="Unable to Load Results"
        message={error}
        onRetry={fetchExamResults}
        onHome={() => navigate('/student/dashboard')}
        showBackButton={false}
      />
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
        <p className="text-gray-600">View all your examination results with teacher information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Exams</p>
              <p className="text-3xl font-bold">{stats.totalExams}</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Average Score</p>
              <p className="text-3xl font-bold">{stats.averageScore}%</p>
            </div>
            <div className="text-green-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Highest Score</p>
              <p className="text-3xl font-bold">{stats.highestScore}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 3z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Pass Rate</p>
              <p className="text-3xl font-bold">{stats.passRate}%</p>
            </div>
            <div className="text-orange-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2">No exam results found. Complete exams to see your results here.</p>
                  </td>
                </tr>
              ) : (
                results.map((result, index) => (
                  <tr key={result._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{result.examTitle || 'Exam'}</p>
                        <p className="text-sm text-gray-500">{result.academicYear}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{result.subjectName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-2">
                          {result.teacherName?.charAt(0) || 'T'}
                        </div>
                        <span className="text-sm text-gray-900">{result.teacherName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{result.examType || 'General'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{result.score || 0} / {result.totalMarks || 0}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(((result.score || 0) / (result.totalMarks || 1)) * 100)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getGradeColor(result.grade || 'N/A')}>
                        {result.grade || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(result.score || 0, result.totalMarks || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(result.submittedAt || result.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Summary */}
      {results.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Overall Performance</h4>
              <p className="text-sm text-blue-700">
                You have completed {stats.totalExams} exams with an average score of {stats.averageScore}%. 
                Keep up the good work!
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Achievement</h4>
              <p className="text-sm text-green-700">
                Your highest score is {stats.highestScore}. Congratulations on this achievement!
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Success Rate</h4>
              <p className="text-sm text-purple-700">
                You have successfully passed {stats.passRate}% of your exams. Excellent progress!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentExamResults;
