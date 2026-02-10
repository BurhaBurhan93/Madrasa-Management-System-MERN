import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import { formatDate, formatGrade } from '../lib/utils';

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Calculus Problem Set 3',
      course: 'MATH201',
      dueDate: '2024-02-20',
      status: 'pending',
      type: 'homework',
      points: 100,
      submitted: false,
      submissionDate: null,
      grade: null,
      feedback: null,
      description: 'Complete problems 1-20 from chapter 5 on integration techniques.',
      attachments: [
        { name: 'calc-problems.pdf', size: '2.4 MB', type: 'pdf' }
      ]
    },
    {
      id: 2,
      title: 'Arabic Grammar Exercise',
      course: 'ARAB101',
      dueDate: '2024-02-18',
      status: 'submitted',
      type: 'exercise',
      points: 50,
      submitted: true,
      submissionDate: '2024-02-17',
      grade: 45,
      feedback: 'Good work on the exercises. Pay attention to verb conjugations in exercise 15-20.',
      description: 'Practice Arabic grammar rules focusing on verb conjugations.',
      attachments: [
        { name: 'grammar-exercise.docx', size: '1.2 MB', type: 'docx' }
      ]
    },
    {
      id: 3,
      title: 'Islamic Ethics Essay',
      course: 'ISLM202',
      dueDate: '2024-02-25',
      status: 'pending',
      type: 'essay',
      points: 75,
      submitted: false,
      submissionDate: null,
      grade: null,
      feedback: null,
      description: 'Write a 1500-word essay on the importance of ethics in Islamic teachings.',
      attachments: []
    },
    {
      id: 4,
      title: 'English Literature Analysis',
      course: 'ENG102',
      dueDate: '2024-02-15',
      status: 'graded',
      type: 'analysis',
      points: 80,
      submitted: true,
      submissionDate: '2024-02-14',
      grade: 72,
      feedback: 'Strong analysis of themes. Work on citing sources properly in your next paper.',
      description: 'Analyze the themes in the assigned novel and discuss their relevance today.',
      attachments: [
        { name: 'literature-analysis.pdf', size: '3.1 MB', type: 'pdf' }
      ]
    },
    {
      id: 5,
      title: 'Physics Lab Report',
      course: 'PHYS101',
      dueDate: '2024-02-22',
      status: 'pending',
      type: 'lab',
      points: 60,
      submitted: false,
      submissionDate: null,
      grade: null,
      feedback: null,
      description: 'Complete the lab report for the experiment on motion and forces.',
      attachments: [
        { name: 'lab-instructions.pdf', size: '1.8 MB', type: 'pdf' }
      ]
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all'
  });

  const filteredAssignments = assignments.filter(assignment => {
    return (
      (filters.status === 'all' || assignment.status === filters.status) &&
      (filters.course === 'all' || assignment.course === filters.course)
    );
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSubmission = (assignmentId) => {
    // In a real app, this would open a submission form
    console.log(`Submitting assignment ${assignmentId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'homework':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
      case 'essay':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        );
      case 'lab':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
        );
      case 'analysis':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'exercise':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Manage your assignments and submissions</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Course:</span>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="MATH201">MATH201</option>
              <option value="ARAB101">ARAB101</option>
              <option value="ISLM202">ISLM202</option>
              <option value="ENG102">ENG102</option>
              <option value="PHYS101">PHYS101</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'submitted').length}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'graded').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {filteredAssignments.map(assignment => (
          <Card key={assignment.id}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getTypeIcon(assignment.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <div className="flex flex-wrap items-center mt-1 space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        {assignment.course}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Due: {formatDate(assignment.dueDate)}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Points: {assignment.points}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{assignment.description}</p>
                    
                    {assignment.attachments.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">Attachments:</span>
                        <ul className="mt-1 space-y-1">
                          {assignment.attachments.map((attachment, idx) => (
                            <li key={idx} className="flex items-center text-sm text-blue-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                              </svg>
                              {attachment.name} ({attachment.size})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
                
                {assignment.status === 'graded' && assignment.grade !== null && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {assignment.grade}/{assignment.points}
                    </div>
                    <div className={`text-sm font-medium ${formatGrade(assignment.grade / assignment.points * 100).color}`}>
                      {formatGrade(assignment.grade / assignment.points * 100).letter}
                    </div>
                  </div>
                )}
                
                {assignment.status === 'pending' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleSubmission(assignment.id)}
                  >
                    Submit Assignment
                  </Button>
                )}
                
                {assignment.status === 'submitted' && (
                  <div className="text-sm text-gray-600">
                    Submitted: {formatDate(assignment.submissionDate)}
                  </div>
                )}
              </div>
            </div>
            
            {assignment.feedback && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Feedback:</h4>
                <p className="mt-1 text-sm text-gray-600">{assignment.feedback}</p>
              </div>
            )}
          </Card>
        ))}
        
        {filteredAssignments.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status !== 'all' || filters.course !== 'all' 
                  ? 'No assignments match your current filters.'
                  : 'There are no assignments at the moment.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;