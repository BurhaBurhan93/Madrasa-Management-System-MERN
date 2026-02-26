import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';
import { useNavigate } from 'react-router-dom';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [subjectsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/teacher/subjects', config),
        axios.get('http://localhost:5000/api/teacher/students', config)
      ]);

      setSubjects(subjectsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredStudents = students.filter((student) => {
    const matchesSubject =
      selectedSubject === 'all' ||
      student.subjectId === Number(selectedSubject) ||
      student._id === selectedSubject;

    const matchesSearch =
      (student.name || student.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(search.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  /* ================= STATS ================= */
  const totalStudents = students.length;
  const avgAttendance = students.length > 0 ? Math.round(
    students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length
  ) : 0;
  const excellentStudents = students.filter(s => (s.average || 0) >= 85).length;

  const getStatus = (avg) => {
    if (avg >= 85) return { text: 'Excellent', variant: 'success' };
    if (avg >= 70) return { text: 'Good', variant: 'primary' };
    return { text: 'At Risk', variant: 'danger' };
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
        <p className="text-gray-600">
          Students enrolled in your teaching subjects
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalStudents}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {subjects.length}
          </div>
          <div className="text-sm text-gray-600">Active Subjects</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {avgAttendance}%
          </div>
          <div className="text-sm text-gray-600">Avg Attendance</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {excellentStudents}
          </div>
          <div className="text-sm text-gray-600">Excellent Students</div>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* STUDENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const subject = subjects.find(s => s.id === student.subjectId || s._id === student.subjectId);
          const status = getStatus(student.average || 0);
          const studentName = student.name || student.userId?.name || 'Unknown';

          return (
            <Card key={student.id || student._id} className="hover:shadow-md transition-shadow">
              <div className="p-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{studentName}</h3>
                    <p className="text-sm text-gray-500">{student.studentId || 'N/A'}</p>
                  </div>
                  <Badge variant={status.variant}>
                    {status.text}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>Subject: {subject?.name || 'N/A'}</p>
                  <p>Attendance: {student.attendance || 0}%</p>
                  <p>Average Score: {student.average || 0}</p>
                </div>

                <div className="mt-4">
                  <Progress
                    value={student.attendance || 0}
                    max={100}
                    label="Attendance"
                  />
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/teacher/student-profile/${student.id}`)
                    }
                  >
                    View Profile
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/teacher/attendance/${student.id}`)
                    }
                  >
                    Mark Attendance
                  </Button>
                </div>

              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default TeacherStudents;
