import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const TeacherSubjects = () => {
  const navigate = useNavigate();

  const [subjects] = useState([
    {
      id: 1,
      code: 'QUR101',
      name: 'Quran Tafsir',
      degree: 'Grade 10',
      students: 35,
      weeklyHours: 4,
      schedule: 'Mon/Wed 08:00-09:30 AM',
      room: 'Room A1',
      status: 'active',
      progress: 65,
    },
    {
      id: 2,
      code: 'HAD201',
      name: 'Hadith Studies',
      degree: 'Grade 9',
      students: 28,
      weeklyHours: 3,
      schedule: 'Tue/Thu 11:00-12:30 PM',
      room: 'Room B2',
      status: 'active',
      progress: 45,
    },
    {
      id: 3,
      code: 'FIQ301',
      name: 'Fiqh',
      degree: 'Grade 8',
      students: 22,
      weeklyHours: 2,
      schedule: 'Mon/Wed 09:45-10:45 AM',
      room: 'Room C1',
      status: 'completed',
      progress: 100,
    },
    {
      id: 4,
      code: 'HIS101',
      name: 'Islamic History',
      degree: 'Grade 7',
      students: 30,
      weeklyHours: 3,
      schedule: 'Tue/Thu 09:00-10:00 AM',
      room: 'Room D3',
      status: 'upcoming',
      progress: 15,
    },
    {
      id: 5,
      code: 'ARB101',
      name: 'Arabic Grammar',
      degree: 'Grade 6',
      students: 40,
      weeklyHours: 4,
      schedule: 'Sun/Mon 01:00-02:00 PM',
      room: 'Room A2',
      status: 'active',
      progress: 75,
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredSubjects = subjects
    .filter((sub) => {
      if (filter === 'all') return true;
      return sub.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'students') return b.students - a.students;
      if (sortBy === 'progress') return b.progress - a.progress;
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

  const totalStudents = subjects.reduce((sum, s) => sum + s.students, 0);
  const totalHours = subjects.reduce((sum, s) => sum + s.weeklyHours, 0);

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
            {subjects.filter(s => s.status === 'active').length}
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
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <div className="p-4">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.code}</p>
                </div>
                <Badge variant={getStatusVariant(subject.status)}>
                  {subject.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>Class: {subject.degree}</p>
                <p>Students: {subject.students}</p>
                <p>Weekly Hours: {subject.weeklyHours}</p>
                <p>Schedule: {subject.schedule}</p>
                <p>Room: {subject.room}</p>
              </div>

              <div className="mt-4">
                <Progress value={subject.progress} max={100} label="Syllabus Progress" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" variant="outline"
                  >
                  Students
                </Button>

                <Button size="sm" variant="outline"
                  >
                  Attendance
                </Button>

                <Button size="sm" variant="outline"
                  >
                  Exams
                </Button>
              </div>

            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default TeacherSubjects;
