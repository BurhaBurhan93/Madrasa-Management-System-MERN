import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import ErrorPage from '../components/UIHelper/ErrorPage';
import { FiBook, FiGraduationCap, FiAlertCircle } from 'react-icons/fi';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import axios from 'axios';

const StudentEducation = () => {
  console.log('[StudentEducation] Component initializing...');
  const navigate = useNavigate();
  const [educationHistory, setEducationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentEducation] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentEducation] useEffect triggered - fetching data from API...');
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentEducation] Fetching education records from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/education', config);
      
      console.log('[StudentEducation] API response:', response.data);
      setEducationHistory(response.data || []);
    } catch (err) {
      console.error('[StudentEducation] Error fetching education data:', err);
      setError('Failed to fetch education records. Please try again.');
      setEducationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading education history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage 
        type="generic" 
        title="Education History Unavailable"
        message={error}
        onRetry={fetchEducationData}
        onHome={() => window.location.href = '/student/dashboard'}
        showBackButton={false}
      />
    );
  }

  console.log('[StudentEducation] Rendering with', educationHistory.length, 'records');

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Education History</h1>
        <p className="text-gray-600 mt-1">View your previous education and academic background</p>
        
        {/* Information Banner */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">Read-Only Access</h3>
              <p className="mt-1 text-sm text-amber-700">
                Your education history is managed by the Registrar's office to ensure data accuracy. 
                To request changes or add new records, please contact the Registrar or submit a request through Communications.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => navigate('/student/communications')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{educationHistory.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full"><FiBook className="w-6 h-6 text-blue-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-3xl font-bold text-green-600">{educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('diploma') || e.previousDegree?.toLowerCase().includes('certificate')).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FiGraduationCap className="w-6 h-6 text-green-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Institutions</p>
              <p className="text-3xl font-bold text-purple-600">{new Set(educationHistory.map(e => e.previousInstitution)).size}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><FiBook className="w-6 h-6 text-purple-600" /></div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Education by Institution">
          <BarChartComponent 
            data={Array.from(new Set(educationHistory.map(e => e.previousInstitution))).map(inst => ({
              name: inst?.substring(0, 15) || 'Unknown',
              value: educationHistory.filter(e => e.previousInstitution === inst).length
            }))}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>

        <Card title="Degree Types">
          <PieChartComponent 
            data={[
              { name: 'High School', value: educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('school')).length, color: '#3B82F6' },
              { name: 'Bachelor', value: educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('bachelor')).length, color: '#10B981' },
              { name: 'Master', value: educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('master')).length, color: '#8B5CF6' },
              { name: 'Certificate', value: educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('certificate') || e.previousDegree?.toLowerCase().includes('diploma')).length, color: '#F59E0B' }
            ].filter(d => d.value > 0)}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>
      </div>

      {/* Education Records Table */}
      <Card title="Previous Education Records">
        {educationHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No education records found.</p>
            <p className="text-sm text-gray-400 mt-2">Your education history will appear here once added by the Registrar's office.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree/Certificate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {educationHistory.map((edu) => (
                  <tr key={edu._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FiGraduationCap className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{edu.previousDegree}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{edu.previousInstitution}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{edu.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(edu.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentEducation;
