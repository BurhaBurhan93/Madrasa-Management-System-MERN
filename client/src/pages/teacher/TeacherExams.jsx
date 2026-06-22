import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import DataTable from '../../components/UIHelper/DataTable';
import Badge from '../../components/UIHelper/Badge';

const TeacherExams = () => {
  const { t } = useTranslation();
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
      header: t('teacher.examsList.title')
    },
    {
      key: 'subject',
      header: t('teacher.examsList.subject')
    },
    {
      key: 'degree',
      header: t('teacher.examsList.class')
    },
    {
      key: 'date',
      header: t('teacher.examsList.examDate')
    },
    {
      key: 'totalMarks',
      header: t('teacher.examsList.totalMarks')
    },
    {
      key: 'status',
      header: t('teacher.examsList.status'),
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value === 'Published'
    ? t('teacher.examsList.published')
    : value === 'Draft'
    ? t('teacher.examsList.draft')
    : t('teacher.examsList.completed')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('teacher.examsList.actions'),
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/exams/${row.id}`);
            }}
          >
            {t('teacher.examsList.manageQuestions')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
          >
            {t('teacher.examsList.viewSubmissions')}
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
          {t('teacher.examsList.title')}
        </h1>
        <p className="text-gray-600">
          {t('teacher.examsList.subtitle')}
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div>
          <label className="text-sm text-gray-600">
            {t('teacher.examsList.academicYear')}
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
            {t('teacher.examsList.noExams')}
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
