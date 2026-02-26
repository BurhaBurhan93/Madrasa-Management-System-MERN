import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import DataTable from '../../components/UIHelper/DataTable';
import Badge from '../../components/UIHelper/Badge';

const TeacherExams = () => {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const navigate = useNavigate();

  const exams = [
    {
      id: 1,
      title: 'Midterm Hadith Exam',
      subject: 'Hadith',
      degree: 'Grade 10',
      date: '2024-03-15',
      totalMarks: 100,
      status: 'Published'
    },
    {
      id: 2,
      title: 'Fiqh Final Exam',
      subject: 'Fiqh',
      degree: 'Grade 9',
      date: '2024-05-20',
      totalMarks: 80,
      status: 'Draft'
    }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Exam Title'
    },
    {
      key: 'subject',
      header: 'Subject'
    },
    {
      key: 'degree',
      header: 'Class'
    },
    {
      key: 'date',
      header: 'Exam Date'
    },
    {
      key: 'totalMarks',
      header: 'Total Marks'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/exams/${row.id}`);
            }}
          >
            Manage Questions
          </Button>

          <Button
            size="sm"
            variant="secondary"
          >
            View Submissions
          </Button>
        </div>
      )
    }
  ];

  const tableData = exams.map(exam => ({
    ...exam,
    actions: ''
  }));

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Exams Management
        </h1>
        <p className="text-gray-600">
          Create and manage your exams.
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div>
          <label className="text-sm text-gray-600">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="block mt-1 border rounded px-3 py-2"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {exams.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No exams created yet.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
          />
        )}
      </Card>
    </div>
  );
};

export default TeacherExams;
