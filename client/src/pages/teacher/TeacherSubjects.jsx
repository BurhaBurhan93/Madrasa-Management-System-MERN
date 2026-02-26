import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const TeacherSubjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/teacher/subjects', config);
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects
    .filter((sub) => {
      if (filter === 'all') return true;
      return (sub.status || 'active') === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      return 0;
    });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'warning';
      default:
        return 'default';
    }
  };

  const totalStudents = subjects.reduce((sum, s) => sum + (s.students || 0), 0);
  const totalHours = subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600">Manage your teaching subjects and workload</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{subjects.length}</div>
          <div className="text-sm text-gray-600">Total Subjects</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {subjects.filter(s => (s.status || s.isActive) === 'active' || s.isActive === true).length}
          </div>
          <div className="text-sm text-gray-600">Active Classes</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{totalHours}</div>
          <div className="text-sm text-gray-600">Weekly Hours</div>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex gap-2 mb-4 md:mb-0">
          {['all','active','completed','upcoming'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="name">Sort by Name</option>
          <option value="students">Sort by Students</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      {/* SUBJECT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
          <Card key={subject.id || subject._id} className="hover:shadow-md transition-shadow">
            <div className="p-4">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{subject.name || 'Unnamed Subject'}</h3>
                  <p className="text-sm text-gray-500">{subject.code || 'N/A'}</p>
                </div>
                <Badge variant={getStatusVariant(subject.status || 'active')}>
                  {subject.status || (subject.isActive ? 'active' : 'inactive')}
                </Badge>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>Credits: {subject.credits || 'N/A'}</p>
                <p>Description: {subject.description || 'No description'}</p>
              </div>

              <div className="mt-4">
                <Progress value={subject.progress || 50} max={100} label="Syllabus Progress" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  Students
                </Button>
                <Button size="sm" variant="outline">
                  Attendance
                </Button>
                <Button size="sm" variant="outline">
                  Exams
                </Button>
              </div>

            </div>
          </Card>
        )) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No subjects found
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherSubjects;
