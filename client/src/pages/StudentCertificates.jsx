import React, { useState, useEffect } from 'react';
import { FiAward, FiDownload, FiShare2, FiEye, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const StudentCertificates = () => {
  console.log('[StudentCertificates] Component initializing...');
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentCertificates] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentCertificates] useEffect triggered - fetching data from API...');
    fetchCertificatesData();
  }, []);

  const fetchCertificatesData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentCertificates] Fetching certificates from API...');
      
      const config = getConfig();
      
      // Fetch user documents (certificates)
      const docsResponse = await axios.get('http://localhost:5000/api/student/documents', config);
      console.log('[StudentCertificates] Documents API response:', docsResponse.data);
      
      // Transform documents to certificate format
      const docs = docsResponse.data || [];
      const formattedCerts = docs.map(doc => ({
        id: doc._id,
        title: doc.type || 'Certificate',
        issuer: 'Madrasa EMIS',
        date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A',
        type: doc.type?.includes('Course') ? 'Course' : 'Achievement',
        status: 'completed',
        grade: 'A',
        downloadUrl: doc.filePath,
        shareUrl: '#'
      }));
      setCertificates(formattedCerts);
      
      // Fetch final results as achievements
      const resultsResponse = await axios.get('http://localhost:5000/api/student/final-results', config);
      console.log('[StudentCertificates] Final results API response:', resultsResponse.data);
      
      const results = resultsResponse.data || [];
      const formattedAchievements = results
        .filter(r => r.grade && r.status === 'pass')
        .map((r, index) => ({
          id: r._id || index,
          title: `Grade ${r.grade} Achievement`,
          description: `Passed with grade ${r.grade}`,
          icon: '🏆',
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'
        }));
      setAchievements(formattedAchievements);
      
    } catch (err) {
      console.error('[StudentCertificates] Error fetching certificates:', err);
      setError('Failed to fetch certificates. Please try again.');
      setCertificates([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Course': return 'bg-blue-100 text-blue-700';
      case 'Achievement': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Certificates & Achievements</h2>
          <p className="text-gray-500 mt-1">View and download your earned certificates</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-xl shadow-md">
            <div className="text-2xl font-bold">{certificates.length}</div>
            <div className="text-sm opacity-90">Certificates</div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-md">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm opacity-90">Achievements</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && certificates.length === 0 && achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      ) : (
        <>
      {/* Certificates Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiAward className="text-sky-500" />
            My Certificates
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {certificates.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No certificates found. Complete courses to earn certificates.
            </div>
          ) : (
            certificates.map((cert) => (
            <div key={cert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-md">
                    <FiAward size={32} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">{cert.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {cert.date}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(cert.type)}`}>
                        {cert.type}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <FiCheckCircle size={14} />
                        Grade: {cert.grade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Issued by {cert.issuer}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors" title="View">
                    <FiEye size={18} />
                  </button>
                  <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Download">
                    <FiDownload size={18} />
                  </button>
                  <button className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors" title="Share">
                    <FiShare2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Badges & Achievements</h3>
        </div>
        <div className="p-6">
          {achievements.length === 0 ? (
            <div className="text-center text-gray-500">
              No achievements yet. Complete exams with good grades to earn achievements.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="text-center p-4 rounded-xl bg-gradient-to-b from-sky-50 to-white border border-sky-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  <span className="text-xs text-sky-500 mt-2 block">{achievement.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default StudentCertificates;
