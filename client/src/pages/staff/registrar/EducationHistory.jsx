import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const educationHistoryConfig = {
  title: 'Student Education History',
  subtitle: 'Manage previous education records and academic background',
  endpoint: '/student/education',
  columns: [
    { key: 'student', header: 'Student', render: (value, row) => row.student?.user?.name || '-' },
    { key: 'previousDegree', header: 'Previous Degree' },
    { key: 'previousInstitution', header: 'Institution' },
    { key: 'location', header: 'Location' },
    { key: 'yearOfCompletion', header: 'Year Completed' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/student/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
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
  const [educationStats, setEducationStats] = useState({
    total: 0,
    byDegree: [],
    byYear: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducationStats();
  }, []);

  const fetchEducationStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE}/student/education`, config);
      const records = response.data || [];
      
      const total = records.length;
      
      // Group by previous degree
      const degreeMap = {};
      records.forEach(r => {
        const degree = r.previousDegree || 'Not Specified';
        degreeMap[degree] = (degreeMap[degree] || 0) + 1;
      });
      const byDegree = Object.entries(degreeMap)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      
      // Group by year of completion
      const yearMap = {};
      records.forEach(r => {
        const year = r.yearOfCompletion || 'Unknown';
        yearMap[year] = (yearMap[year] || 0) + 1;
      });
      const byYear = Object.entries(yearMap)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.name - a.name)
        .slice(0, 10);
      
      setEducationStats({ total, byDegree, byYear });
    } catch (error) {
      console.error('[EducationHistory] Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Records</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{educationStats.total}</p>
            <p className="text-sm text-slate-500 mt-1">Education history entries</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Degree Types</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{educationStats.byDegree.length}</p>
            <p className="text-sm text-slate-500 mt-1">Different qualifications</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Year Range</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{educationStats.byYear.length}</p>
            <p className="text-sm text-slate-500 mt-1">Different years</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {educationStats.byDegree.length > 0 && (
        <Card title="Education Background by Degree">
          <BarChartComponent
            data={educationStats.byDegree}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>
      )}

      {/* Education History List */}
      <ListPage {...educationHistoryConfig} />
    </div>
  );
};

export default EducationHistory;
