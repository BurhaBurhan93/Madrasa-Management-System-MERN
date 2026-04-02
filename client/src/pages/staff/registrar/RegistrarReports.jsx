import React, { useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Badge from '../../../components/UIHelper/Badge';
import axios from 'axios';

const RegistrarReports = () => {
  const [reportType, setReportType] = useState('students');
  const [filters, setFilters] = useState({
    status: '',
    class: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`http://localhost:5000/api/students/reports?${queryParams}`, getConfig());
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Reports & Export</h1>
        <p className="text-gray-600">Generate comprehensive reports and export data</p>
      </div>

      {/* Report Configuration */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="students">Student List Report</option>
              <option value="admissions">Admissions Report</option>
              <option value="active-inactive">Active vs Inactive</option>
              <option value="class-distribution">Class Distribution</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="primary" 
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : '📊 Generate Report'}
          </Button>
          
          {reportData && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => exportToCSV(reportData.students || [], 'student_report')}
              >
                📥 Export to CSV
              </Button>
              <Button 
                variant="secondary" 
                onClick={printReport}
              >
                🖨️ Print Report
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold">{reportData.stats?.totalStudents || 0}</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="text-center">
                <p className="text-green-100 text-sm mb-1">Active Students</p>
                <p className="text-3xl font-bold">{reportData.stats?.activeStudents || 0}</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="text-center">
                <p className="text-orange-100 text-sm mb-1">Inactive Students</p>
                <p className="text-3xl font-bold">{reportData.stats?.inactiveStudents || 0}</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="text-center">
                <p className="text-purple-100 text-sm mb-1">Classes</p>
                <p className="text-3xl font-bold">{Object.keys(reportData.stats?.byClass || {}).length}</p>
              </div>
            </Card>
          </div>

          {/* Class Distribution */}
          <Card className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Class Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(reportData.stats?.byClass || {}).map(([className, count]) => (
                <div key={className} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{className}</span>
                  <Badge variant="primary">{count} students</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Student List Table */}
          <Card>
            <h3 className="text-xl font-semibold mb-4">Student List</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(reportData.students || []).map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentCode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">
                          {`${student.firstName || ''} ${student.lastName || ''}`.trim() || student.user?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.fatherName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.currentClass?.className || 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No report generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select your filters and click "Generate Report" to see the data.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RegistrarReports;
