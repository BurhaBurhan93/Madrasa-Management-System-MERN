import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import Badge from '../components/UIHelper/Badge';
import ErrorPage from '../components/UIHelper/ErrorPage';
import { FiAward, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { PieChartComponent } from '../components/UIHelper/ECharts';
import axios from 'axios';

const StudentDegree = () => {
  console.log('[StudentDegree] Component initializing...');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledDegrees, setEnrolledDegrees] = useState([]);
  const [availableDegrees, setAvailableDegrees] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    activeDegrees: 0,
    completedDegrees: 0,
    totalCredits: 0
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentDegree] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentDegree] useEffect triggered - fetching data from API...');
    fetchDegreeData();
  }, []);

  const fetchDegreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentDegree] Fetching degrees from API...');
      
      const config = getConfig();
      
      // Fetch enrolled degrees
      const enrolledResponse = await axios.get('http://localhost:5000/api/student/degrees', config);
      console.log('[StudentDegree] Enrolled degrees API response:', enrolledResponse.data);
      const enrolled = enrolledResponse.data || [];
      setEnrolledDegrees(enrolled);
      
      // For now, available degrees would be fetched from a separate endpoint
      // or filtered from all degrees minus enrolled ones
      // setAvailableDegrees(available);
      
      // Calculate stats
      const calculatedStats = {
        totalEnrolled: enrolled.length,
        activeDegrees: enrolled.filter(d => d.status === 'active').length,
        completedDegrees: enrolled.filter(d => d.status === 'completed').length,
        totalCredits: enrolled.reduce((acc, d) => acc + (d.degree?.credits || 0), 0)
      };
      setStats(calculatedStats);
      console.log('[StudentDegree] Stats calculated:', calculatedStats);
    } catch (err) {
      console.error('[StudentDegree] Error fetching degree data:', err);
      setError('Failed to fetch degree data. Please try again.');
      setEnrolledDegrees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    console.log('[StudentDegree] getStatusBadge called for status:', status);
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'inactive':
        return <Badge variant="danger">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const degreeStatusData = [
    { name: 'Active', value: stats.activeDegrees, color: '#10B981' },
    { name: 'Completed', value: stats.completedDegrees, color: '#3B82F6' },
    { name: 'Inactive', value: stats.totalEnrolled - stats.activeDegrees - stats.completedDegrees, color: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Degree Programs</h1>
        <p className="text-gray-600 mt-1">View your enrolled programs and academic progress</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Unable to Load Degrees"
          message={error}
          onRetry={fetchDegreeData}
          onHome={() => window.location.href = '/student/dashboard'}
          showBackButton={false}
        />
      )}

      {loading && enrolledDegrees.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading degree programs...</p>
        </div>
      ) : (
      <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiAward className="text-blue-600 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalEnrolled}</div>
          <div className="text-sm text-gray-600">Total Enrolled</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiCheckCircle className="text-green-600 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.activeDegrees}</div>
          <div className="text-sm text-gray-600">Active Programs</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiCalendar className="text-purple-600 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.completedDegrees}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiClock className="text-orange-600 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.totalCredits}</div>
          <div className="text-sm text-gray-600">Total Credits</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Degrees List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Enrolled Programs">
            {enrolledDegrees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiAward size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No degree programs enrolled yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledDegrees.map((enrollment) => (
                  <div key={enrollment._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.degree?.name}</h3>
                        <p className="text-sm text-gray-500">Code: {enrollment.degree?.code} • {enrollment.degree?.duration}</p>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Academic Year</p>
                        <p className="font-medium">{enrollment.academicYear}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Credits</p>
                        <p className="font-medium">{enrollment.degree?.credits}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Enrolled Date</p>
                        <p className="font-medium">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Courses</p>
                        <p className="font-medium">{enrollment.completedCourses}/{enrollment.totalCourses}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-blue-600">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Available Programs */}
          <Card title="Available Programs">
            {availableDegrees.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No additional programs available at this time.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDegrees.map((degree) => (
                  <div key={degree._id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900">{degree.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{degree.code} • {degree.duration}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{degree.credits} Credits</span>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Charts & Summary */}
        <div className="space-y-6">
          <Card title="Enrollment Status">
            {degreeStatusData.length > 0 ? (
              <PieChartComponent 
                data={degreeStatusData}
                dataKey="value"
                nameKey="name"
                title="Program Status Distribution"
                height={250}
              />
            ) : (
              <p className="text-center py-4 text-gray-500">No data available</p>
            )}
          </Card>

          <Card title="Quick Links">
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center">
                <FiCalendar className="mr-3 text-blue-600" />
                Academic Calendar
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center">
                <FiAward className="mr-3 text-green-600" />
                Graduation Requirements
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center">
                <FiCheckCircle className="mr-3 text-purple-600" />
                Transcript Request
              </button>
            </div>
          </Card>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

export default StudentDegree;
