import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiUsers, FiBook, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const AdminClasses = () => {
  const [classes, setClasses] = useState([
    { id: 1, name: 'Class 1', section: 'A', students: 25, teacher: 'Mr. Ahmed', subjects: 5, schedule: 'Mon-Fri 8AM-2PM' },
    { id: 2, name: 'Class 2', section: 'B', students: 28, teacher: 'Ms. Fatima', subjects: 5, schedule: 'Mon-Fri 8AM-2PM' },
    { id: 3, name: 'Class 3', section: 'A', students: 30, teacher: 'Mr. Ali', subjects: 6, schedule: 'Mon-Fri 8AM-2PM' },
    { id: 4, name: 'Class 4', section: 'C', students: 22, teacher: 'Ms. Sara', subjects: 6, schedule: 'Mon-Fri 8AM-2PM' },
    { id: 5, name: 'Class 5', section: 'A', students: 32, teacher: 'Mr. Hassan', subjects: 7, schedule: 'Mon-Fri 8AM-2PM' },
    { id: 6, name: 'Class 6', section: 'B', students: 27, teacher: 'Ms. Aisha', subjects: 7, schedule: 'Mon-Fri 8AM-2PM' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    section: 'A',
    maxStudents: 30,
    teacher: '',
    subjects: []
  });

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = () => {
    if (!newClass.name || !newClass.teacher) {
      alert('Please fill all required fields');
      return;
    }

    const newClassObj = {
      id: classes.length + 1,
      name: newClass.name,
      section: newClass.section,
      students: 0,
      teacher: newClass.teacher,
      subjects: newClass.subjects.length,
      schedule: 'Mon-Fri 8AM-2PM'
    };

    setClasses([...classes, newClassObj]);
    setNewClass({ name: '', section: 'A', maxStudents: 30, teacher: '', subjects: [] });
    setShowAddModal(false);
    alert('Class added successfully');
  };

  const handleDeleteClass = (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setClasses(classes.filter(cls => cls.id !== id));
      alert('Class deleted successfully');
    }
  };

  const ClassCard = ({ cls }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{cls.name} - Section {cls.section}</h3>
          <p className="text-gray-600">Teacher: {cls.teacher}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteClass(cls.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Students</p>
            <p className="font-semibold text-gray-900">{cls.students}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <FiBook size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Subjects</p>
            <p className="font-semibold text-gray-900">{cls.subjects}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FiCalendar size={16} />
        <span>{cls.schedule}</span>
      </div>

      <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
        View Details
      </button>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏫 Class Management</h1>
          <p className="text-gray-600 mt-1">Manage all classes and sections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> Add New Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Classes</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Teachers</p>
              <p className="text-2xl font-bold">{new Set(classes.map(cls => cls.teacher)).size}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Average Class Size</p>
              <p className="text-2xl font-bold">
                {Math.round(classes.reduce((sum, cls) => sum + cls.students, 0) / classes.length)}
              </p>
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
              placeholder="Search classes by name, teacher, or section..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>All Sections</option>
              <option>Section A</option>
              <option>Section B</option>
              <option>Section C</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>Sort by Name</option>
              <option>Sort by Students</option>
              <option>Sort by Teacher</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(cls => (
          <ClassCard key={cls.id} cls={cls} />
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  placeholder="e.g., Class 7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newClass.section}
                  onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newClass.teacher}
                  onChange={(e) => setNewClass({...newClass, teacher: e.target.value})}
                  placeholder="Enter teacher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Students</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newClass.maxStudents}
                  onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddClass}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add Class
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

export default AdminClasses;