import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const TeacherAssignments = () => {

  const navigate = useNavigate();

  /* ================= STATIC SUBJECTS ================= */
  const subjects = [
    { id: 1, name: 'Quran Tafsir' },
    { id: 2, name: 'Hadith Studies' },
    { id: 3, name: 'Fiqh' },
  ];

  /* ================= STATIC ASSIGNMENTS ================= */
  const [assignments] = useState([
    {
      id: 1,
      subjectId: 1,
      title: 'Surah Baqarah Analysis',
      description: 'Write a detailed explanation of selected verses.',
      deadline: '2026-01-15',
      totalStudents: 35,
      submissions: 25,
      status: 'active',
    },
    {
      id: 2,
      subjectId: 2,
      title: 'Hadith Memorization',
      description: 'Memorize and explain 5 authentic hadiths.',
      deadline: '2026-01-10',
      totalStudents: 28,
      submissions: 28,
      status: 'completed',
    },
    {
      id: 3,
      subjectId: 3,
      title: 'Fiqh Case Study',
      description: 'Analyze real-life jurisprudence cases.',
      deadline: '2025-12-01',
      totalStudents: 22,
      submissions: 10,
      status: 'active',
    },
  ]);

  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  /* ================= FILTER LOGIC ================= */
  const filteredAssignments = assignments
    .filter((a) => {
      const subjectMatch =
        filterSubject === 'all' || a.subjectId === Number(filterSubject);
      const statusMatch =
        filterStatus === 'all' || a.status === filterStatus;
      return subjectMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline')
        return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'submissions')
        return b.submissions - a.submissions;
      return 0;
    });

  /* ================= STATS ================= */
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions, 0);
  const overdueAssignments = assignments.filter(a =>
    new Date(a.deadline) < new Date() && a.status === 'active'
  ).length;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-gray-600">
          Create, manage and evaluate student assignments
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalAssignments}
          </div>
          <div className="text-sm text-gray-600">Total Assignments</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {activeAssignments}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {totalSubmissions}
          </div>
          <div className="text-sm text-gray-600">Submissions</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {overdueAssignments}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-3">

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="submissions">Sort by Submissions</option>
          </select>

        </div>

        {/* 🔥 CREATE BUTTON NOW WORKS */}
        <Button onClick={() => navigate('/teacher/create-assignments')}>
          + Create Assignment
        </Button>
      </div>

      {/* ASSIGNMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => {
          const subject = subjects.find(s => s.id === assignment.subjectId);
          const submissionRate = Math.round(
            (assignment.submissions / assignment.totalStudents) * 100
          );

          return (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {subject?.name}
                    </p>
                  </div>

                  <Badge variant={getStatusVariant(assignment.status)}>
                    {assignment.status}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>Deadline: {assignment.deadline}</p>
                  <p>
                    {assignment.submissions} / {assignment.totalStudents} Submitted
                  </p>
                </div>

                <div className="mt-4">
                  <Progress
                    value={submissionRate}
                    max={100}
                    label="Submission Progress"
                  />
                </div>

                <div className="mt-6 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline">
                    View Submissions
                  </Button>

                  <Button size="sm" variant="outline">
                    Edit
                  </Button>

                  <Button size="sm" variant="outline">
                    Close
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

export default TeacherAssignments;
