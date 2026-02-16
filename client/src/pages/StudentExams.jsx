import React, { useState } from 'react';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';

const StudentExams = () => {
  const [exams, setExams] = useState([
    {
      id: 1,
      title: 'Midterm Examination',
      course: 'Mathematics',
      date: '2024-03-15',
      time: '09:00 AM',
      duration: '2 hours',
      location: 'Room 201',
      type: 'midterm',
      status: 'scheduled',
      description: 'Comprehensive exam covering chapters 1-5'
    },
    {
      id: 2,
      title: 'Physics Final Exam',
      course: 'Physics',
      date: '2024-03-20',
      time: '10:30 AM',
      duration: '3 hours',
      location: 'Auditorium A',
      type: 'final',
      status: 'scheduled',
      description: 'Final examination for Physics course'
    },
    {
      id: 3,
      title: 'Arabic Quiz',
      course: 'Arabic Language',
      date: '2024-02-25',
      time: '11:00 AM',
      duration: '1 hour',
      location: 'Room 105',
      type: 'quiz',
      status: 'completed',
      description: 'Quiz on Arabic grammar and literature',
      score: 85
    },
    {
      id: 4,
      title: 'Islamic Studies Test',
      course: 'Islamic Studies',
      date: '2024-03-05',
      time: '02:00 PM',
      duration: '1.5 hours',
      location: 'Room 301',
      type: 'test',
      status: 'upcoming',
      description: 'Test on Islamic history and jurisprudence'
    }
  ]);

  const [pastExams, setPastExams] = useState([
    {
      id: 5,
      title: 'Calculus Quiz',
      course: 'Mathematics',
      date: '2024-02-10',
      score: 92,
      maxScore: 100,
      grade: 'A',
      feedback: 'Excellent performance on derivatives'
    },
    {
      id: 6,
      title: 'Chemistry Midterm',
      course: 'Chemistry',
      date: '2024-02-01',
      score: 78,
      maxScore: 100,
      grade: 'C+',
      feedback: 'Need improvement in organic chemistry'
    }
  ]);

  const [activeTab, setActiveTab] = useState('upcoming');

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
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
        <p className="text-gray-600">View and manage your examination schedule and results</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8">
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
            {exams
              .filter(exam => exam.status !== 'completed')
              .map(exam => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <p className="text-gray-600">{exam.course}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={getTypeColor(exam.type)}>
                        {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                      </Badge>
                      <Badge variant={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(exam.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{exam.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{exam.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{exam.location}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{exam.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="primary" size="sm">
                      Prepare for Exam
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {pastExams.map(exam => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-gray-600">{exam.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{exam.score}%</p>
                    <p className="text-sm text-gray-600">Grade: {exam.grade}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(exam.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-medium">{exam.score}/{exam.maxScore}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Feedback:</p>
                  <p className="text-gray-700">{exam.feedback}</p>
                </div>
              </Card>
            ))}
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
      </div>
    </div>
  );
};

export default StudentExams;