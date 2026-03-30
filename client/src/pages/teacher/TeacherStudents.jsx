import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import { useNavigate } from 'react-router-dom';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [subjectsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/teacher/subjects', config),
        axios.get('http://localhost:5000/api/teacher/students', config)
      ]);
      setSubjects(subjectsRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const matchesSearch =
      (student.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (student.studentCode || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    subjects: subjects.length,
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-gray-600">Students enrolled in your classes</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.subjects}</div>
          <div className="text-sm text-gray-600">My Subjects</div>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 flex-1"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>
      </div>

      {/* STUDENTS GRID */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No students found</p>
          <p className="text-sm mt-2">Register students via Staff Panel → User Management</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student._id} className="hover:shadow-md transition-shadow">
              <div className="p-4">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white flex items-center justify-center text-lg font-bold">
                      {student.user?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.user?.name || 'Unknown'}</h3>
                      <p className="text-xs text-gray-500">{student.studentCode || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge variant={student.status === 'active' ? 'success' : 'danger'}>
                    {student.status}
                  </Badge>
                </div>

                {/* Info */}
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Class:</span>
                    <span className="font-medium">{student.currentClass?.name || 'Not Assigned'} {student.currentClass?.section || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="font-medium">{student.currentLevel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium truncate ml-2">{student.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admission:</span>
                    <span className="font-medium">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/teacher/attendance')}
                  >
                    Mark Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/teacher/results/enter-marks')}
                  >
                    Enter Marks
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
