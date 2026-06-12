import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiCalendar, FiBook, FiUsers, FiClipboard, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

const AdminExams = () => {
  const [exams, setExams] = useState([
    { id: 1, name: 'Midterm Exam', type: 'Midterm', class: 'Class 1-5', date: '2024-04-15', duration: '2 hours', subjects: 5, students: 150, status: 'upcoming' },
    { id: 2, name: 'Final Exam', type: 'Final', class: 'Class 6-8', date: '2024-06-20', duration: '3 hours', subjects: 6, students: 120, status: 'upcoming' },
    { id: 3, name: 'Monthly Test', type: 'Monthly', class: 'Class 1-5', date: '2024-03-25', duration: '1 hour', subjects: 5, students: 150, status: 'completed' },
    { id: 4, name: 'Quiz', type: 'Quiz', class: 'Class 9-10', date: '2024-04-05', duration: '45 minutes', subjects: 7, students: 90, status: 'ongoing' },
    { id: 5, name: 'Practical Exam', type: 'Practical', class: 'Class 6-10', date: '2024-05-10', duration: '2 hours', subjects: 3, students: 210, status: 'upcoming' },
    { id: 6, name: 'Revision Test', type: 'Revision', class: 'All Classes', date: '2024-06-01', duration: '1.5 hours', subjects: 8, students: 360, status: 'upcoming' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'Midterm',
    class: 'Class 1-5',
    date: '',
    duration: '',
    subjects: '',
    description: ''
  });

  const examTypes = ['all', 'Midterm', 'Final', 'Monthly', 'Quiz', 'Practical', 'Revision'];
  const examStatuses = ['all', 'upcoming', 'ongoing', 'completed'];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || exam.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingExams = exams.filter(e => e.status === 'upcoming').length;
  const ongoingExams = exams.filter(e => e.status === 'ongoing').length;
  const completedExams = exams.filter(e => e.status === 'completed').length;
  const totalStudents = exams.reduce((sum, exam) => sum + exam.students, 0);

  const handleAddExam = () => {
    if (!newExam.name || !newExam.date || !newExam.duration || !newExam.subjects) {
      alert('Please fill all required fields');
      return;
    }

    const newExamObj = {
      id: exams.length + 1,
      name: newExam.name,
      type: newExam.type,
      class: newExam.class,
      date: newExam.date,
      duration: newExam.duration,
      subjects: parseInt(newExam.subjects),
      students: newExam.class === 'All Classes' ? 360 : 
                newExam.class === 'Class 1-5' ? 150 : 
                newExam.class === 'Class 6-8' ? 120 : 90,
      status: 'upcoming'
    };

    setExams([...exams, newExamObj]);
    setNewExam({ name: '', type: 'Midterm', class: 'Class 1-5', date: '', duration: '', subjects: '', description: '' });
    setShowAddModal(false);
    alert('Exam added successfully');
  };

  const handleDeleteExam = (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== id));
      alert('Exam deleted successfully');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const styles = {
      Midterm: 'bg-purple-100 text-purple-800',
      Final: 'bg-red-100 text-red-800',
      Monthly: 'bg-green-100 text-green-800',
      Quiz: 'bg-orange-100 text-orange-800',
      Practical: 'bg-teal-100 text-teal-800',
      Revision: 'bg-indigo-100 text-indigo-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const ExamCard = ({ exam }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{exam.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(exam.type)}`}>
              {exam.type}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(exam.status)}`}>
              {exam.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteExam(exam.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Class:</span>
          <span className="font-medium text-gray-900">{exam.class}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Date:</span>
          <span className="font-medium text-gray-900">
            {new Date(exam.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Duration:</span>
          <span className="font-medium text-gray-900">{exam.duration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subjects:</span>
          <span className="font-medium text-gray-900">{exam.subjects}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Students:</span>
          <span className="font-medium text-gray-900">{exam.students}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar size={16} />
          <span>Exam ID: #{exam.id.toString().padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📝 Exams Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage all academic exams</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> Schedule New Exam
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Exams</p>
              <p className="text-2xl font-bold">{exams.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiClipboard size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingExams}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCalendar size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ongoing</p>
              <p className="text-2xl font-bold">{ongoingExams}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exams by name or class..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {examTypes.filter(t => t !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {examStatuses.filter(s => s !== 'all').map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(exam => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {/* Exam Schedule */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Exam Schedule</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(exam.type)}`}>
                      {exam.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subjects}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.students}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule New Exam</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.name}
                  onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                  placeholder="e.g., Midterm Exam 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.type}
                  onChange={(e) => setNewExam({...newExam, type: e.target.value})}
                >
                  {examTypes.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.class}
                  onChange={(e) => setNewExam({...newExam, class: e.target.value})}
                >
                  <option value="Class 1-5">Class 1-5</option>
                  <option value="Class 6-8">Class 6-8</option>
                  <option value="Class 9-10">Class 9-10</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.date}
                  onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Subjects *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.subjects}
                  onChange={(e) => setNewExam({...newExam, subjects: e.target.value})}
                  placeholder="Enter number of subjects"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newExam.description}
                  onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                  placeholder="Enter exam description and instructions"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddExam}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Schedule Exam
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExams;