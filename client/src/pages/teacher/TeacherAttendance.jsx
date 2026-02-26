import React, { useState, useMemo } from 'react';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const TeacherAttendance = () => {

  /* ================= STATIC DATA ================= */

  const subject = {
    name: 'Quran Tafsir',
    room: 'Room A1',
    time: '08:00 - 09:30 AM',
    date: '2026-01-12'
  };

  const studentsData = [
    { id: 1, name: 'Ahmad Rahimi', studentId: 'STD1001' },
    { id: 2, name: 'Bilal Ahmad', studentId: 'STD1002' },
    { id: 3, name: 'Omar Farooq', studentId: 'STD1003' },
    { id: 4, name: 'Yusuf Ali', studentId: 'STD1004' },
    { id: 5, name: 'Hassan Khan', studentId: 'STD1005' },
  ];

  const [attendance, setAttendance] = useState({});

  const updateStatus = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status) => {
    const updated = {};
    studentsData.forEach(s => updated[s.id] = status);
    setAttendance(updated);
  };

  /* ================= SUMMARY ================= */

  const summary = useMemo(() => {
    const total = studentsData.length;
    const present = Object.values(attendance).filter(v => v === 'present').length;
    const absent = Object.values(attendance).filter(v => v === 'absent').length;
    const late = Object.values(attendance).filter(v => v === 'late').length;

    const marked = present + absent + late;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const completion = total > 0 ? Math.round((marked / total) * 100) : 0;

    return { total, present, absent, late, rate, completion };
  }, [attendance]);

  const getVariant = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-28">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-gray-600">
          {subject.name} • {subject.date} • {subject.time}
        </p>
      </div>

      {/* SESSION INFO CARD */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{subject.name}</p>
            <p className="text-sm text-gray-500">
              {subject.room} • {subject.time}
            </p>
          </div>
          <Badge variant="primary">
            Active Session
          </Badge>
        </div>
      </Card>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-xl font-bold">{summary.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-green-600">{summary.present}</div>
          <div className="text-xs text-gray-600">Present</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-red-600">{summary.absent}</div>
          <div className="text-xs text-gray-600">Absent</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-yellow-600">{summary.late}</div>
          <div className="text-xs text-gray-600">Late</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-purple-600">{summary.rate}%</div>
          <div className="text-xs text-gray-600">Attendance Rate</div>
        </Card>
      </div>

      {/* COMPLETION PROGRESS */}
      <Card className="mb-6">
        <Progress
          value={summary.completion}
          max={100}
          label="Marking Completion"
        />
      </Card>

      {/* QUICK ACTIONS */}
      <div className="flex gap-3 mb-6">
        <Button variant="outline" onClick={() => markAll('present')}>
          Mark All Present
        </Button>
        <Button variant="outline" onClick={() => markAll('absent')}>
          Mark All Absent
        </Button>
        <Button variant="outline" onClick={() => markAll('late')}>
          Mark All Late
        </Button>
      </div>

      {/* ATTENDANCE TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {studentsData.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.studentId}</div>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">

                      {['present', 'absent', 'late'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateStatus(student.id, status)}
                          className={`px-3 py-1 text-xs rounded border
                          ${
                            attendance[student.id] === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center shadow-lg">
        <div className="text-sm text-gray-600">
          {summary.present} Present • {summary.absent} Absent • {summary.late} Late
        </div>
        <Button>
          Save Attendance
        </Button>
      </div>

    </div>
  );
};

export default TeacherAttendance;
