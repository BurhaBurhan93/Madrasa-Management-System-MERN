import React, { useState } from 'react';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';
import { useNavigate } from 'react-router-dom';

const TeacherStudents = () => {
  const navigate = useNavigate();

  /* ================= STATIC SUBJECTS ================= */
  const subjects = [
    { id: 1, name: 'Quran Tafsir' },
    { id: 2, name: 'Hadith Studies' },
    { id: 3, name: 'Fiqh' },
  ];

  /* ================= STATIC STUDENTS ================= */
  const [students] = useState([
    {
      id: 1,
      name: 'Ahmad Rahimi',
      studentId: 'STD1001',
      subjectId: 1,
      attendance: 92,
      average: 88,
    },
    {
      id: 2,
      name: 'Bilal Ahmad',
      studentId: 'STD1002',
      subjectId: 1,
      attendance: 75,
      average: 70,
    },
    {
      id: 3,
      name: 'Omar Farooq',
      studentId: 'STD1003',
      subjectId: 2,
      attendance: 96,
      average: 91,
    },
    {
      id: 4,
      name: 'Yusuf Ali',
      studentId: 'STD1004',
      subjectId: 3,
      attendance: 60,
      average: 58,
    },
    {
      id: 5,
      name: 'Hassan Khan',
      studentId: 'STD1005',
      subjectId: 2,
      attendance: 85,
      average: 79,
    },
  ]);

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');

  /* ================= FILTER LOGIC ================= */
  const filteredStudents = students.filter((student) => {
    const matchesSubject =
      selectedSubject === 'all' ||
      student.subjectId === Number(selectedSubject);

    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  /* ================= STATS ================= */
  const totalStudents = students.length;
  const avgAttendance = Math.round(
    students.reduce((sum, s) => sum + s.attendance, 0) / students.length
  );
  const excellentStudents = students.filter(s => s.average >= 85).length;

  const getStatus = (avg) => {
    if (avg >= 85) return { text: 'Excellent', variant: 'success' };
    if (avg >= 70) return { text: 'Good', variant: 'primary' };
    return { text: 'At Risk', variant: 'danger' };
  };

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
          const subject = subjects.find(s => s.id === student.subjectId);
          const status = getStatus(student.average);

          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                  <Badge variant={status.variant}>
                    {status.text}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>Subject: {subject?.name}</p>
                  <p>Attendance: {student.attendance}%</p>
                  <p>Average Score: {student.average}</p>
                </div>

                <div className="mt-4">
                  <Progress
                    value={student.attendance}
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
