import { useState, useRef } from 'react';

const Assignments = () => {
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
      description: 'Complete exercises on Arabic verb conjugations for past tense.',
      attachments: [
        { name: 'grammar-exercise.pdf', size: '1.8 MB', type: 'pdf' }
      ]
    },
    {
      id: 3,
      title: 'Research Paper: Islamic Ethics',
      course: 'ISLM202',
      dueDate: '2024-03-05',
      status: 'in-progress',
      type: 'research-paper',
      points: 200,
      submitted: false,
      submissionDate: null,
      grade: null,
      feedback: null,
      description: 'Write a 1500-word research paper on contemporary applications of Islamic ethics in business.',
      attachments: [
        { name: 'research-guidelines.pdf', size: '3.2 MB', type: 'pdf' },
        { name: 'bibliography-template.docx', size: '0.5 MB', type: 'docx' }
      ]
    },
    {
      id: 4,
      title: 'English Essay: Personal Narrative',
      course: 'ENG102',
      dueDate: '2024-02-25',
      status: 'pending',
      type: 'essay',
      points: 150,
      submitted: false,
      submissionDate: null,
      grade: null,
      feedback: null,
      description: 'Write a personal narrative essay of 800-1000 words focusing on a significant life event.',
      attachments: [
        { name: 'essay-guidelines.pdf', size: '1.2 MB', type: 'pdf' }
      ]
    },
    {
      id: 5,
      title: 'Physics Lab Report: Mechanics',
      course: 'PHYS101',
      dueDate: '2024-02-15',
      status: 'graded',
      type: 'lab-report',
      points: 120,
      submitted: true,
      submissionDate: '2024-02-14',
      grade: 112,
      feedback: 'Excellent lab report. Your calculations were accurate. Consider adding more analysis in the conclusion.',
      description: 'Complete lab report for mechanics experiment including calculations and analysis.',
      attachments: []
    }
  ]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    assignmentId: null,
    notes: '',
    files: []
  });
  const fileInputRef = useRef(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'graded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleBackToList = () => {
    setSelectedAssignment(null);
  };

  const handleStartSubmission = (assignment) => {
    setSubmissionData({
      assignmentId: assignment.id,
      notes: '',
      files: []
    });
    setShowSubmissionModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      file: file
    }));
    
    setSubmissionData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setSubmissionData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    
    // In a real app, this would submit the assignment to the server
    console.log('Submitting assignment:', submissionData);
    
    // Update assignment status
    setAssignments(prev => prev.map(assignment => {
      if (assignment.id === submissionData.assignmentId) {
        return {
          ...assignment,
          status: 'submitted',
          submitted: true,
          submissionDate: new Date().toISOString().split('T')[0]
        };
      }
      return assignment;
    }));
    
    setShowSubmissionModal(false);
    setSubmissionData({ assignmentId: null, notes: '', files: [] });
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const daysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 1000));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Assignments & Homework</h2>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>All Courses</option>
            <option>MATH201</option>
            <option>ARAB101</option>
            <option>ISLM202</option>
            <option>ENG102</option>
            <option>PHYS101</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Submitted</option>
            <option>Graded</option>
          </select>
        </div>
      </div>

      {!selectedAssignment ? (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div 
              key={assignment.id} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewAssignment(assignment)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600">{assignment.course}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{assignment.points} points</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className={`text-sm ${
                      daysUntilDue(assignment.dueDate) < 3 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}>
                      Due: {formatDate(assignment.dueDate)}
                      {daysUntilDue(assignment.dueDate) > 0 && ` (${daysUntilDue(assignment.dueDate)} days left)`}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSubmission(assignment);
                  }}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  disabled={assignment.status === 'submitted' || assignment.status === 'graded'}
                >
                  {assignment.status === 'submitted' || assignment.status === 'graded' ? 'Submitted' : 'Submit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Assignments
            </button>
            <h3 className="text-xl font-bold text-gray-800">{selectedAssignment.title}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <p className="text-gray-800">{selectedAssignment.course}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-800">{selectedAssignment.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <p className="text-gray-800">{formatDate(selectedAssignment.dueDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                      <p className="text-gray-800">{selectedAssignment.points}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAssignment.status)}`}>
                      {selectedAssignment.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h4>
                  <div className="space-y-3">
                    {selectedAssignment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{getFileIcon(attachment.type)}</span>
                          <div>
                            <p className="font-medium text-gray-800">{attachment.name}</p>
                            <p className="text-sm text-gray-600">{attachment.size}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignment.feedback && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Feedback</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedAssignment.feedback}</p>
                    {selectedAssignment.grade !== null && (
                      <div className="mt-3 text-right">
                        <span className="text-sm text-gray-600">Grade: </span>
                        <span className="font-semibold text-gray-800">{selectedAssignment.grade}/{selectedAssignment.points}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Actions</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleStartSubmission(selectedAssignment)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={selectedAssignment.status === 'submitted' || selectedAssignment.status === 'graded'}
                  >
                    {selectedAssignment.status === 'submitted' || selectedAssignment.status === 'graded' ? 'Already Submitted' : 'Submit Assignment'}
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Download Template
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Save Draft
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Assignment Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">1</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">Assigned</p>
                      <p className="text-xs text-gray-600">Feb 1, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">2</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">Due Date</p>
                      <p className="text-xs text-gray-600">{formatDate(selectedAssignment.dueDate)}</p>
                    </div>
                  </div>
                  {selectedAssignment.submissionDate && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">3</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">Submitted</p>
                        <p className="text-xs text-gray-600">{formatDate(selectedAssignment.submissionDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Submit Assignment</h3>
                <button 
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitAssignment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment: {assignments.find(a => a.id === submissionData.assignmentId)?.title}
                  </label>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={submissionData.notes}
                    onChange={(e) => setSubmissionData({...submissionData, notes: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Add any additional notes or information for your instructor..."
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose Files
                    </button>
                    <p className="mt-2 text-sm text-gray-600">or drag and drop files here</p>
                    <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX, images, and other formats</p>
                  </div>
                  
                  {submissionData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {submissionData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getFileIcon(file.name.split('.').pop())}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{file.name}</p>
                              <p className="text-xs text-gray-600">{file.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;