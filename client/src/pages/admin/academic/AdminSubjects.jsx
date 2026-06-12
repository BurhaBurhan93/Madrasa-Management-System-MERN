import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiBook, FiUsers, FiClock, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', code: 'MATH101', teacher: 'Mr. Ahmed', class: 'Class 1-5', hours: 5, students: 150 },
    { id: 2, name: 'English', code: 'ENG101', teacher: 'Ms. Fatima', class: 'Class 1-5', hours: 5, students: 150 },
    { id: 3, name: 'Science', code: 'SCI101', teacher: 'Prof. Hassan', class: 'Class 1-5', hours: 4, students: 150 },
    { id: 4, name: 'Islamic Studies', code: 'ISL101', teacher: 'Sheikh Muhammad', class: 'All Classes', hours: 3, students: 360 },
    { id: 5, name: 'Computer Science', code: 'CS101', teacher: 'Mr. Ali', class: 'Class 6-10', hours: 4, students: 120 },
    { id: 6, name: 'History', code: 'HIS101', teacher: 'Dr. Sara', class: 'Class 6-10', hours: 3, students: 120 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    teacher: '',
    class: 'Class 1-5',
    hours: '',
    description: ''
  });

  const classes = ['all', 'Class 1-5', 'Class 6-8', 'Class 9-10', 'All Classes'];

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || subject.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalSubjects = subjects.length;
  const totalTeachers = new Set(subjects.map(s => s.teacher)).size;
  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);
  const totalStudents = subjects.reduce((sum, subject) => sum + subject.students, 0);

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code || !newSubject.teacher || !newSubject.hours) {
      alert('Please fill all required fields');
      return;
    }

    const newSubjectObj = {
      id: subjects.length + 1,
      name: newSubject.name,
      code: newSubject.code,
      teacher: newSubject.teacher,
      class: newSubject.class,
      hours: parseInt(newSubject.hours),
      students: newSubject.class === 'All Classes' ? 360 : 
                newSubject.class === 'Class 1-5' ? 150 : 120
    };

    setSubjects([...subjects, newSubjectObj]);
    setNewSubject({ name: '', code: '', teacher: '', class: 'Class 1-5', hours: '', description: '' });
    setShowAddModal(false);
    alert('Subject added successfully');
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(subjects.filter(subject => subject.id !== id));
      alert('Subject deleted successfully');
    }
  };

  const SubjectCard = ({ subject }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
          <p className="text-gray-600">Code: {subject.code}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteSubject(subject.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Teacher:</span>
          <span className="font-medium text-gray-900">{subject.teacher}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Class:</span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {subject.class}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Weekly Hours:</span>
          <span className="font-medium text-gray-900">{subject.hours} hours</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Students:</span>
          <span className="font-medium text-gray-900">{subject.students}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiBook size={16} />
          <span>Subject ID: {subject.code}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Subjects Management</h1>
          <p className="text-gray-600 mt-1">Manage all academic subjects and curriculum</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> Add New Subject
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Subjects</p>
              <p className="text-2xl font-bold">{totalSubjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Teachers</p>
              <p className="text-2xl font-bold">{totalTeachers}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Weekly Hours</p>
              <p className="text-2xl font-bold">{totalHours}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiClock size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
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
              placeholder="Search subjects by name, code, or teacher..."
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
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>Sort by Name</option>
              <option>Sort by Code</option>
              <option>Sort by Class</option>
              <option>Sort by Hours</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      {/* Class Distribution */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Subjects by Class</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours per Subject</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.filter(cls => cls !== 'all').map(cls => {
                const classSubjects = subjects.filter(s => s.class === cls);
                const classTeachers = new Set(classSubjects.map(s => s.teacher)).size;
                const classHours = classSubjects.reduce((sum, s) => sum + s.hours, 0);
                const classStudents = classSubjects.reduce((sum, s) => sum + s.students, 0);
                const avgHours = classSubjects.length > 0 ? (classHours / classSubjects.length).toFixed(1) : 0;

                return (
                  <tr key={cls}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classSubjects.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classTeachers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classStudents}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avgHours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Subject</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                  placeholder="e.g., MATH101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.teacher}
                  onChange={(e) => setNewSubject({...newSubject, teacher: e.target.value})}
                  placeholder="Enter teacher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.class}
                  onChange={(e) => setNewSubject({...newSubject, class: e.target.value})}
                >
                  <option value="Class 1-5">Class 1-5</option>
                  <option value="Class 6-8">Class 6-8</option>
                  <option value="Class 9-10">Class 9-10</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Hours *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.hours}
                  onChange={(e) => setNewSubject({...newSubject, hours: e.target.value})}
                  placeholder="Enter weekly hours"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                  placeholder="Enter subject description"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSubject}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add Subject
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

export default AdminSubjects;