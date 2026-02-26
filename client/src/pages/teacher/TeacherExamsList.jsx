import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../contexts/ExamContext';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import DataTable from '../../components/UIHelper/DataTable';

/* ================= MOCK DATA (Fallback) ================= */

const mockExams = [
  {
    id: '1',
    title: 'Midterm Mathematics',
    subject: 'Mathematics',
    className: 'Grade 10 - A',
    duration: 60,
    status: 'published'
  },
  {
    id: '2',
    title: 'Physics Final Exam',
    subject: 'Physics',
    className: 'Grade 11 - B',
    duration: 90,
    status: 'draft'
  },
  {
    id: '3',
    title: 'Chemistry Quiz',
    subject: 'Chemistry',
    className: 'Grade 9 - C',
    duration: 45,
    status: 'published'
  },
  {
    id: '4',
    title: 'Biology Practical',
    subject: 'Biology',
    className: 'Grade 12 - A',
    duration: 120,
    status: 'draft'
  }
];

const TeacherExamsList = () => {
  const navigate = useNavigate();
  const { exams = [], deleteExam } = useExam(); // 👈 default empty array

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this exam?'
    );
    if (!confirmDelete) return;
    deleteExam(id);
  };

  /* ================= DATA SOURCE ================= */

  const dataSource = exams.length > 0 ? exams : mockExams;

  /* ================= FILTERED DATA ================= */

  const filteredExams = useMemo(() => {
    return dataSource.filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === '' || exam.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dataSource, search, statusFilter]);

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    const total = dataSource.length;
    const published = dataSource.filter(e => e.status === 'published').length;
    const draft = dataSource.filter(e => e.status === 'draft').length;

    return { total, published, draft };
  }, [dataSource]);

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'subject', header: 'Subject' },
    { key: 'className', header: 'Class' },
    { key: 'duration', header: 'Duration (min)' },

    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'draft' ? 'warning' : 'success'}>
          {value}
        </Badge>
      )
    },

    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => navigate(`/teacher/exams/${row.id}`)}
          >
            View
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              navigate(`/teacher/exams/${row.id}/submissions`)
            }
          >
            Submissions
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Exams
          </h1>
          <p className="text-sm text-gray-500">
            Manage and monitor your exams
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/exams/create')}
        >
          Create Exam
        </Button>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Exams</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.published}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.draft}
          </p>
        </Card>
      </div>

      {/* FILTER SECTION */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {/* TABLE */}
      <Card>
        <DataTable columns={columns} data={filteredExams} />
      </Card>

    </div>
  );
};

export default TeacherExamsList;
