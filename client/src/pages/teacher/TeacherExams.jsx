import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import DataTable from '../../components/UIHelper/DataTable';
import Badge from '../../components/UIHelper/Badge';

const TeacherExams = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
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
 header: t('examsList.title')
 },
 {
 key: 'subject',
 header: t('examsList.subject')
 },
 {
 key: 'degree',
 header: t('examsList.class')
 },
 {
 key: 'date',
 header: t('examsList.examDate')
 },
 {
 key: 'totalMarks',
 header: t('examsList.totalMarks')
 },
 {
 key: 'status',
 header: t('examsList.status'),
 render: (value) => (
 <Badge variant={getStatusVariant(value)}>
 {value === 'Published'
 ? t('examsList.published')
 : value === 'Draft'
 ? t('examsList.draft')
 : t('examsList.completed')}
 </Badge>
 )
 },
 {
 key: 'actions',
 header: t('examsList.actions'),
 render: (_, row) => (
 <div className="flex gap-2">
 <Button
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/teacher/exams/${row.id}`);
 }}
 >
 {t('examsList.manageQuestions')}
 </Button>

 <Button
 size="sm"
 variant="secondary"
 >
 {t('examsList.viewSubmissions')}
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
  <div className="w-full min-h-screen px-3 py-4 sm:px-6 lg:px-8">
  {/* Header */}
  <div className="mb-4 sm:mb-6">
  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
  {t('examsList.title')}
  </h1>
  <p className="text-xs sm:text-sm text-gray-600">
  {t('examsList.subtitle')}
  </p>
  </div>

  {/* Filter */}
  <Card className="mb-6">
 <div>
 <label className="text-sm text-gray-600">
 {t('examsList.academicYear')}
 </label>
 <select
 value={academicYear}
 onChange={(e) => setAcademicYear(e.target.value)}
 className="block mt-1 border rounded px-3 py-2"
 >
 <option value={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}>{`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}</option>
 <option value={`${new Date().getFullYear() - 1}-${new Date().getFullYear()}`}>{`${new Date().getFullYear() - 1}-${new Date().getFullYear()}`}</option>
 </select>
 </div>
 </Card>

 {/* Table */}
 <Card>
 {exams.length === 0 ? (
 <div className="text-center py-10 text-gray-500">
 {t('examsList.noExams')}
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
