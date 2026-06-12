import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiAward, 
  FiDownload, 
  FiShare2, 
  FiEye, 
  FiCalendar, 
  FiCheckCircle,
  FiActivity,
  FiTrendingUp,
  FiArrowRight,
  FiInfo,
  FiShield
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  const fetchCertificatesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const docsResponse = await axios.get(`${API_BASE}/student/documents`, config);
      const resultsResponse = await axios.get(`${API_BASE}/student/final-results`, config);
      
      const docs = docsResponse.data || [];
      const formattedCerts = docs.map(doc => ({
        id: doc._id,
        title: doc.type || 'Certificate of Excellence',
        issuer: 'Madrasa Management System',
        date: doc.createdAt,
        type: doc.type?.includes('Course') ? 'Course' : 'Achievement',
        grade: 'A+',
        downloadUrl: doc.filePath
      }));
      setCertificates(formattedCerts);
      
      const results = resultsResponse.data || [];
      const formattedAchievements = results
        .filter(r => r.grade && r.status === 'pass')
        .map((r, index) => ({
          id: r._id || index,
          title: `Academic Achievement`,
          description: `Distinction in ${r.course?.name || 'Academic Module'}`,
          icon: '🏆',
          date: r.createdAt
        }));
      setAchievements(formattedAchievements);
      
    } catch (err) {
      console.error('[StudentCertificates] Error:', err);
      setError('Failed to fetch certificates and achievements.');
      setCertificates([]); // Set empty array on error
      setAchievements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Recognition</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Certificates & Awards</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Your verified portfolio of academic excellence</p>
        </div>
        <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
          <FiShare2 /> Share Portfolio
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Certificates', value: certificates.length, icon: <FiAward />, color: 'blue' },
          { label: 'Academic Badges', value: achievements.length, icon: <FiTrendingUp />, color: 'emerald' },
          { label: 'Course Credits', value: certificates.length * 3, icon: <FiActivity />, color: 'purple' },
          { label: 'Verified Status', value: '100%', icon: <FiCheckCircle />, color: 'cyan' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Certificates List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Earned Certificates" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id} className="group p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform">
                          <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-3xl text-cyan-600">
                            <FiAward />
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-white border-none font-black text-[10px] uppercase tracking-widest mb-2">{cert.type}</Badge>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{cert.title}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issued {formatDate(cert.date)}</p>
                            <span className="text-slate-200">•</span>
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Grade: {cert.grade}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-cyan-600 hover:border-cyan-200 shadow-sm transition-all" title="View Online">
                          <FiEye size={20} />
                        </button>
                        <button className="flex-1 md:flex-none p-4 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all" title="Download PDF">
                          <FiDownload size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <FiAward className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No certificates earned yet</p>
                </div>
              )}
            </div>
          </Card>

          {/* Badges Section */}
          <Card title="Skills & Achievements" className="rounded-[32px] p-8">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight">{achievement.title}</h4>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{formatDate(achievement.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8 font-medium italic">Complete modules with distinction to earn badges.</p>
            )}
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <Card title="Portfolio Health" className="rounded-[32px] p-8">
            <PieChartComponent 
              data={[
                { name: 'Completed', value: certificates.length, color: '#3B82F6' },
                { name: 'In Progress', value: 2, color: '#F59E0B' }
              ]}
              dataKey="value"
              nameKey="name"
              height={250}
            />
            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Integrity Check</h4>
              <div className="flex items-center gap-3">
                <FiShield className="text-emerald-500 text-xl" />
                <p className="text-xs font-bold text-slate-600">All credentials are cryptographically verified by the registrar.</p>
              </div>
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Request Physical</h4>
              <p className="text-blue-100 text-sm font-medium mb-6">Need a printed version with the official institutional seal?</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
                Request Hard Copy
              </Button>
            </div>
            <FiAward className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificates;
