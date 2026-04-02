import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import axios from 'axios';
import ErrorPage from '../components/UIHelper/ErrorPage';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';

const StudentExams = () => {
  console.log('[StudentExams] Component initializing...');
  const navigate = useNavigate();
  const { exams: contextExams, submissions } = useExam();
  
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentExams] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentExams] useEffect triggered - fetching data from API...');
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentExams] Fetching exam results from API...');
      
      const config = getConfig();
      
      // Fetch exam results from FinalResult model
      const resultsResponse = await axios.get('http://localhost:5000/api/student/final-results', config);
      console.log('[StudentExams] Exam results API response:', resultsResponse.data);
      setExamResults(resultsResponse.data || []);
    } catch (err) {
      console.error('[StudentExams] Error fetching exam results:', err);
      setError('Failed to fetch exam results. Please try again.');
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };


  const hasSubmitted = (examId) => {
    return submissions.find(s => s.examId === examId);
  };

  const publishedExams = contextExams.filter(e => e.status === "published");

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'final':
        return 'danger';
      case 'midterm':
        return 'warning';
      case 'quiz':
        return 'info';
      case 'test':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
        <p className="text-gray-600">View and manage your examination schedule and results</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="generic" 
          title="Unable to Load Exams"
          message={error}
          onRetry={fetchExamResults}
          onHome={() => window.location.href = '/student/dashboard'}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      ) : (
      <>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Exams
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Exams
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
  {publishedExams.map(exam => (
    <Card key={exam.id} className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {exam.title}
          </h3>
          <p className="text-gray-600">
            {exam.course || "—"}
          </p>
        </div>

        <div className="flex space-x-2">
          <Badge variant="success">
            Published
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Date</p>
          <p className="font-medium">
            {exam.publishDate
              ? formatDate(exam.publishDate)
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Duration</p>
          <p className="font-medium">
            {exam.duration} minutes
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="font-medium">
            {exam.totalMarks}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Deadline</p>
          <p className="font-medium">
            {exam.deadline
              ? formatDate(exam.deadline)
              : "—"}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-4">
        {exam.description || "No description provided."}
      </p>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          View Details
        </Button>

        {!hasSubmitted(exam.id) ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(`/exams/${exam.id}/attempt`)
            }
          >
            Attempt Exam
          </Button>
        ) : (
          <Badge variant="info">
            Submitted
          </Badge>
        )}
      </div>
    </Card>
  ))}
</div>

        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {examResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exam results found. Complete exams to see your results here.
              </div>
            ) : (
              examResults.map(result => (
                <Card key={result._id} className="hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.exam?.title || 'Exam Result'}
                      </h3>
                      <p className="text-gray-600">
                        Grade: {result.grade || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {result.totalScore || 0}
                      </p>
                      <p className="text-sm text-gray-600">Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{result.status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {result.createdAt ? formatDate(result.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}


      {/* Exam Preparation Tips */}
      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Exam Preparation Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Plan Your Study Schedule</h4>
              <p className="text-sm text-blue-700 mt-1">Create a study timeline with specific goals for each day leading up to your exams.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Review Regularly</h4>
              <p className="text-sm text-green-700 mt-1">Regular review sessions help retain information better than cramming.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Practice Tests</h4>
              <p className="text-sm text-yellow-700 mt-1">Take practice exams to familiarize yourself with the format and timing.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Stay Healthy</h4>
              <p className="text-sm text-purple-700 mt-1">Maintain good sleep, nutrition, and exercise habits during exam preparation.</p>
            </div>
          </div>
        </Card>
      </div>
      </>
      )}
    </div>
  );
};

export default StudentExams;
