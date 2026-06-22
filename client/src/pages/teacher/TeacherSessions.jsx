import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';

const TeacherSessions = () => {
  const { t } = useTranslation();

  /* ================= STATIC SESSIONS ================= */
  const [sessions] = useState([
    {
      id: 1,
      subject: 'Quran Tafsir',
      date: '2026-01-12',
      time: '08:00 - 09:30',
      room: 'Room A1',
      students: 35,
      status: 'upcoming',
    },
    {
      id: 2,
      subject: 'Hadith Studies',
      date: '2026-01-13',
      time: '10:00 - 11:30',
      room: 'Room B2',
      students: 28,
      status: 'completed',
    },
    {
      id: 3,
      subject: 'Fiqh',
      date: '2026-01-14',
      time: '09:00 - 10:00',
      room: 'Room C1',
      students: 22,
      status: 'upcoming',
    },
    {
      id: 4,
      subject: 'Quran Tafsir',
      date: '2026-01-14',
      time: '01:00 - 02:00',
      room: 'Room A1',
      students: 35,
      status: 'cancelled',
    },
  ]);

  const weekDays = [
  { key: '2026-01-12', label: t('teacherSessions.days.mon') },
  { key: '2026-01-13', label: t('teacherSessions.days.tue') },
  { key: '2026-01-14', label: t('teacherSessions.days.wed') },
  { key: '2026-01-15', label: t('teacherSessions.days.thu') },
  { key: '2026-01-16', label: t('teacherSessions.days.fri') },
  { key: '2026-01-17', label: t('teacherSessions.days.sat') },
  { key: '2026-01-18', label: t('teacherSessions.days.sun') },
];

  /* ================= STATS ================= */
  const totalSessions = sessions.length;
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('teacherSessions.title')}</h1>
        <p className="text-gray-600">
          {t('teacherSessions.subtitle')}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalSessions}
          </div>
          <div className="text-sm text-gray-600"> {t('teacherSessions.totalSessions')}</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {completedSessions}
          </div>
          <div className="text-sm text-gray-600">{t('teacherSessions.completed')}</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {upcomingSessions}
          </div>
          <div className="text-sm text-gray-600">{t('teacherSessions.upcoming')}</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {cancelledSessions}
          </div>
          <div className="text-sm text-gray-600">{t('teacherSessions.cancelled')}</div>
        </Card>
      </div>

      {/* WEEK NAVIGATION */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline">← {t('teacherSessions.previousWeek')}</Button>
        <h2 className="text-lg font-semibold">{t('teacherSessions.weekRange')}</h2>
        <Button variant="outline">{t('teacherSessions.nextWeek')} →</Button>
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

        {weekDays.map((day) => {
          const daySessions = sessions.filter(s => s.date === day.key);

          return (
            <Card key={day.key} className="min-h-[250px]">
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                  {day.label}
                </h3>

                {daySessions.length === 0 ? (
                  <p className="text-xs text-gray-400">No Sessions</p>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="mb-3 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <div className="text-xs font-semibold">
                        {session.subject}
                      </div>
                      <div className="text-xs text-gray-600">
                        {session.time}
                      </div>
                      <div className="text-xs text-gray-600">
                        {session.room}
                      </div>

                      <div className="mt-2">
                        <Badge variant={getStatusVariant(session.status)}>
                          {t(`teacherSessions.status.${session.status}`)}
                        </Badge>
                      </div>

                      <div className="mt-2 flex flex-col gap-1">
                        <Button size="xs" variant="outline">
                          Take Attendance
                        </Button>
                        <Button size="xs" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}

      </div>

    </div>
  );
};

export default TeacherSessions;
