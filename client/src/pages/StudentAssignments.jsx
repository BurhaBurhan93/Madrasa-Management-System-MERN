import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import { formatDate } from '../lib/utils';

const StudentAssignments = () => {
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Calculus Homework Chapter 3',
      course: 'Mathematics',
      dueDate: '2024-02-15',
      status: 'pending',
      submitted: false,
      maxPoints: 100,
      description: 'Complete exercises 1-20 from chapter 3',
      attachments: [{ name: 'Chapter3.pdf', type: 'pdf' }]
    },
    {
      id: 2,
      title: 'Physics Lab Report',
      course: 'Physics',
      dueDate: '2024-02-12',
      status: 'submitted',
      submitted: true,
      maxPoints: 100,
      description: 'Lab report on Simple Harmonic Motion experiment',
      attachments: [{ name: 'lab_report.docx', type: 'docx' }],
      submissionDate: '2024-02-11'
    },
    {
      id: 3,
      title: 'History Research Paper',
      course: 'History',
      dueDate: '2024-02-20',
      status: 'in-progress',
      submitted: false,
      maxPoints: 150,
      description: 'Research paper on Islamic Golden Age contributions to science',
      attachments: []
    },
    {
      id: 4,
      title: 'Chemistry Assignment',
      course: 'Chemistry',
      dueDate: '2024-02-08',
      status: 'overdue',
      submitted: false,
      maxPoints: 75,
      description: 'Complete problems 1-30 from textbook chapter 5'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const filteredAssignments = assignments
    .filter(assignment => {
      if (filter === 'all') return true;
      return assignment.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'course') {
        return a.course.localeCompare(b.course);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'success';
      case 'pending':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const handleViewAssignment = (assignmentId) => {
    // Navigate to assignment detail view
    navigate(`/assignments/${assignmentId}`);
  };

  const [showSubmissionModal, setShowSubmissionModal] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    file: null,
    notes: ''
  });

  const handleShowSubmissionModal = (assignmentId) => {
    setShowSubmissionModal(assignmentId);
  };

  const handleHideSubmissionModal = () => {
    setShowSubmissionModal(null);
    setSubmissionData({ file: null, notes: '' });
  };

  const handleSubmissionChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setSubmissionData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setSubmissionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitAssignment = (assignmentId) => {
    // Handle assignment submission
    setAssignments(prev => prev.map(ass => 
      ass.id === assignmentId 
        ? { ...ass, status: 'submitted', submitted: true, submissionDate: new Date().toISOString().split('T')[0] }
        : ass
    ));
    
    // Close modal and reset form
    handleHideSubmissionModal();
    
    alert('Assignment submitted successfully!');
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Manage and track your assignments</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{assignments.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Assignments</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {assignments.filter(a => a.status === 'submitted').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Submitted</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {assignments.filter(a => a.status === 'overdue').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Overdue</div>
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
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'in-progress'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'submitted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overdue
          </button>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="course">Sort by Course</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1 mb-4 md:mb-0 md:pr-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{assignment.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center mt-1 space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="text-sm text-gray-600">{assignment.course}</span>
                  <Badge variant={getStatusColor(assignment.status)}>
                    {getStatusText(assignment.status)}
                  </Badge>
                  {assignment.submitted && assignment.submissionDate && (
                    <span className="text-sm text-green-600">
                      Submitted: {formatDate(assignment.submissionDate)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-500">Attachments:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assignment.attachments.map((file, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-start sm:items-end space-y-3">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className={`font-medium ${
                    assignment.status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
                
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-600">Max Points</p>
                  <p className="font-medium text-gray-900">{assignment.maxPoints}</p>
                </div>
                
                <div className="flex space-x-2">
                  {assignment.status === 'overdue' ? (
                    <Button variant="outline" disabled>
                      Past Due
                    </Button>
                  ) : assignment.status === 'submitted' ? (
                    <Button variant="outline" disabled>
                      View Submission
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewAssignment(assignment.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleShowSubmissionModal(assignment.id)}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Assignment Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Submit Assignment
                </h3>
                <button 
                  onClick={handleHideSubmissionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment
                  </label>
                  <p className="text-gray-900 font-medium">
                    {assignments.find(a => a.id === showSubmissionModal)?.title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach File
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, PNG, JPG (MAX. 10MB)
                        </p>
                      </div>
                      <input 
                        id="file-upload" 
                        name="file" 
                        type="file" 
                        className="hidden" 
                        onChange={handleSubmissionChange}
                      />
                    </label>
                  </div>
                  {submissionData.file && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 truncate">{submissionData.file.name}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={submissionData.notes}
                    onChange={handleSubmissionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes for your instructor..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleHideSubmissionModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSubmitAssignment(showSubmissionModal)}
                  >
                    Submit Assignment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentAssignments;