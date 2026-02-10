import { useState, useEffect } from 'react';

const Exams = () => {
  const [exams, setExams] = useState([
    {
      id: 1,
      title: 'Midterm Examination - Calculus',
      course: 'MATH201',
      type: 'midterm',
      date: '2024-03-15',
      time: '09:00 AM',
      duration: 120, // in minutes
      location: 'Room 201',
      status: 'scheduled',
      totalQuestions: 50,
      totalMarks: 100,
      instructions: [
        'Read all questions carefully before starting',
        'Use blue or black ink pen only',
        'Electronic devices are not allowed',
        'Show all work for partial credit'
      ]
    },
    {
      id: 2,
      title: 'Arabic Language Proficiency Test',
      course: 'ARAB101',
      type: 'quiz',
      date: '2024-03-18',
      time: '11:00 AM',
      duration: 90,
      location: 'Room 105',
      status: 'scheduled',
      totalQuestions: 30,
      totalMarks: 75,
      instructions: [
        'Focus on grammar and vocabulary',
        'Write answers clearly in Arabic script',
        'Time management is essential'
      ]
    },
    {
      id: 3,
      title: 'Islamic Jurisprudence Final',
      course: 'ISLM202',
      type: 'final',
      date: '2024-04-10',
      time: '02:00 PM',
      duration: 180,
      location: 'Main Hall',
      status: 'upcoming',
      totalQuestions: 70,
      totalMarks: 200,
      instructions: [
        'Bring your own stationery',
        'Reference materials not allowed',
        'Arrive 15 minutes early'
      ]
    },
    {
      id: 4,
      title: 'English Literature Analysis',
      course: 'ENG102',
      type: 'written',
      date: '2024-03-22',
      time: '10:00 AM',
      duration: 150,
      location: 'Room 103',
      status: 'upcoming',
      totalQuestions: 40,
      totalMarks: 150,
      instructions: [
        'Analyze the provided texts thoroughly',
        'Use proper citation format',
        'Answer all sections'
      ]
    }
  ]);

  const [pastExams, setPastExams] = useState([
    {
      id: 5,
      title: 'Physics Mechanics Quiz',
      course: 'PHYS101',
      type: 'quiz',
      date: '2024-02-15',
      time: '01:00 PM',
      duration: 60,
      location: 'Lab 2',
      status: 'completed',
      totalQuestions: 25,
      totalMarks: 50,
      score: 42,
      grade: 'A-'
    },
    {
      id: 6,
      title: 'Calculus Quiz 1',
      course: 'MATH201',
      type: 'quiz',
      date: '2024-02-08',
      time: '09:00 AM',
      duration: 45,
      location: 'Room 201',
      status: 'completed',
      totalQuestions: 20,
      totalMarks: 40,
      score: 36,
      grade: 'B+'
    }
  ]);

  const [selectedExam, setSelectedExam] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [countdown, setCountdown] = useState({});

  useEffect(() => {
    // Calculate countdowns for upcoming exams
    const calculateCountdowns = () => {
      const newCountdown = {};
      
      exams.forEach(exam => {
        if (exam.status === 'scheduled' || exam.status === 'upcoming') {
          const examDateTime = new Date(`${exam.date}T${exam.time}`);
          const now = new Date();
          const diffTime = examDateTime - now;
          
          if (diffTime > 0) {
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            
            newCountdown[exam.id] = {
              days,
              hours,
              minutes,
              expired: false
            };
          } else {
            newCountdown[exam.id] = {
              days: 0,
              hours: 0,
              minutes: 0,
              expired: true
            };
          }
        }
      });
      
      setCountdown(newCountdown);
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [exams]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'midterm':
        return 'bg-blue-100 text-blue-800';
      case 'final':
        return 'bg-red-100 text-red-800';
      case 'quiz':
        return 'bg-yellow-100 text-yellow-800';
      case 'written':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
  };

  const handleBackToList = () => {
    setSelectedExam(null);
  };

  const handleStartExam = (exam) => {
    // In a real app, this would redirect to the exam interface
    alert(`Starting exam: ${exam.title}. In a real application, this would open the exam interface.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Exams & Assessments</h2>
        <div className="flex space-x-3">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="upcoming">Upcoming Exams</option>
            <option value="past">Past Exams</option>
          </select>
        </div>
      </div>

      {activeTab === 'upcoming' ? (
        <>
          {exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map(exam => (
                <div 
                  key={exam.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewExam(exam)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.type)}`}>
                          {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600">{exam.course}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{exam.totalQuestions} Questions</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{exam.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-700">
                          <strong>Date:</strong> {formatDate(exam.date)} at {formatTime(exam.time)}
                        </span>
                        <span className="mx-3 text-gray-300">•</span>
                        <span className="text-sm text-gray-700">
                          <strong>Duration:</strong> {exam.duration} min
                        </span>
                        <span className="mx-3 text-gray-300">•</span>
                        <span className="text-sm text-gray-700">
                          <strong>Location:</strong> {exam.location}
                        </span>
                      </div>
                      
                      {countdown[exam.id] && !countdown[exam.id].expired && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Time remaining:</p>
                          <div className="flex space-x-4 mt-1">
                            <div className="text-center">
                              <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
                                <span className="text-lg font-bold text-gray-800">{countdown[exam.id].days}</span>
                                <span className="text-xs text-gray-600 block">Days</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
                                <span className="text-lg font-bold text-gray-800">{countdown[exam.id].hours}</span>
                                <span className="text-xs text-gray-600 block">Hours</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
                                <span className="text-lg font-bold text-gray-800">{countdown[exam.id].minutes}</span>
                                <span className="text-xs text-gray-600 block">Min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartExam(exam);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={exam.status === 'upcoming'}
                      >
                        {exam.status === 'scheduled' ? 'Prepare' : 'Start Exam'}
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Upcoming Exams</h3>
              <p className="text-gray-600">You don't have any upcoming exams scheduled.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {pastExams.length > 0 ? (
            <div className="space-y-4">
              {pastExams.map(exam => (
                <div 
                  key={exam.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewExam(exam)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.type)}`}>
                          {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600">{exam.course}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{exam.totalQuestions} Questions</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{exam.totalMarks} Total Marks</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-700">
                          <strong>Date:</strong> {formatDate(exam.date)} at {formatTime(exam.time)}
                        </span>
                        <span className="mx-3 text-gray-300">•</span>
                        <span className="text-sm text-gray-700">
                          <strong>Score:</strong> {exam.score}/{exam.totalMarks} ({exam.grade})
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        View Results
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Review Answers
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Past Exams</h3>
              <p className="text-gray-600">You don't have any past exam records yet.</p>
            </div>
          )}
        </>
      )}

      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">{selectedExam.title}</h3>
                <button 
                  onClick={handleBackToList}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Exam Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <p className="text-gray-800">{selectedExam.course}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <p className="text-gray-800">{selectedExam.type.charAt(0).toUpperCase() + selectedExam.type.slice(1)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <p className="text-gray-800">{formatDate(selectedExam.date)} at {formatTime(selectedExam.time)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <p className="text-gray-800">{selectedExam.duration} minutes</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-gray-800">{selectedExam.location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                        <p className="text-gray-800">{selectedExam.totalQuestions}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                        <p className="text-gray-800">{selectedExam.totalMarks}</p>
                      </div>
                      {selectedExam.score !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Score</label>
                          <p className="text-gray-800">{selectedExam.score}/{selectedExam.totalMarks} ({selectedExam.grade})</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h4>
                    <ul className="space-y-2">
                      {selectedExam.instructions ? (
                        selectedExam.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-600">No specific instructions available.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Actions</h4>
                    <div className="space-y-3">
                      {selectedExam.status === 'completed' ? (
                        <>
                          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            View Results
                          </button>
                          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            Review Answers
                          </button>
                          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            Download Certificate
                          </button>
                        </>
                      ) : selectedExam.status === 'scheduled' || selectedExam.status === 'upcoming' ? (
                        <>
                          <button 
                            onClick={() => handleStartExam(selectedExam)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {selectedExam.status === 'scheduled' ? 'Prepare for Exam' : 'Start Exam'}
                          </button>
                          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            Study Materials
                          </button>
                          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            Set Reminder
                          </button>
                        </>
                      ) : (
                        <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                          Exam Not Available
                        </button>
                      )}
                    </div>
                  </div>

                  {countdown[selectedExam.id] && !countdown[selectedExam.id].expired && (
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Time Remaining</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-xl font-bold text-gray-800">{countdown[selectedExam.id].days}</span>
                            <span className="text-xs text-gray-600 block mt-1">Days</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-xl font-bold text-gray-800">{countdown[selectedExam.id].hours}</span>
                            <span className="text-xs text-gray-600 block mt-1">Hours</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-xl font-bold text-gray-800">{countdown[selectedExam.id].minutes}</span>
                            <span className="text-xs text-gray-600 block mt-1">Minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Preparation Tips</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Review all course materials and notes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Practice with sample questions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Ensure you have all required materials</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Get adequate rest before the exam</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;