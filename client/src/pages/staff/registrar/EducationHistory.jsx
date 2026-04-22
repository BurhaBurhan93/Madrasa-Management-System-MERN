import React from 'react';
import ListPage from '../shared/ListPage';

export const educationHistoryConfig = {
  title: 'Student Education History',
  subtitle: 'Manage previous education records and academic background',
  endpoint: '/students/education-history',
  columns: [
    { key: 'student', header: 'Student', render: (value, row) => row.student?.user?.name || '-' },
    { key: 'previousDegree', header: 'Previous Degree' },
    { key: 'previousInstitution', header: 'Institution' },
    { key: 'location', header: 'Location' },
    { key: 'yearOfCompletion', header: 'Year Completed' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/students/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'previousDegree', label: 'Previous Degree', required: true },
    { name: 'previousInstitution', label: 'Institution Name', required: true },
    { name: 'location', label: 'Institution Location', required: true },
    { name: 'yearOfCompletion', label: 'Year of Completion', type: 'number' },
    { name: 'grade', label: 'Grade/Marks' },
    { name: 'fieldOfStudy', label: 'Field of Study' }
  ],
  initialForm: {
    student: '',
    previousDegree: '',
    previousInstitution: '',
    location: '',
    yearOfCompletion: '',
    grade: '',
    fieldOfStudy: ''
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    previousDegree: row.previousDegree || '',
    previousInstitution: row.previousInstitution || '',
    location: row.location || '',
    yearOfCompletion: row.yearOfCompletion || '',
    grade: row.grade || '',
    fieldOfStudy: row.fieldOfStudy || ''
  })
};

const EducationHistory = () => {
  return <ListPage {...educationHistoryConfig} />;
};

export default EducationHistory;
