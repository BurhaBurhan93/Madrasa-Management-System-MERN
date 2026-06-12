import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiBook, 
  FiFileText, 
  FiMusic, 
  FiVideo, 
  FiSearch, 
  FiArrowRight, 
  FiClock, 
  FiActivity, 
  FiInfo,
  FiGlobe,
  FiExternalLink
} from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import { PageSkeleton } from '../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LearningResources = () => {
  const [loading, setLoading] = useState(true);
  const [resourceStats, setResourceStats] = useState({
    ebooks: 0,
    journals: 0,
    audiobooks: 0,
    videos: 0,
    labs: 0
  });

  useEffect(() => {
    fetchResourceStats();
  }, []);

  const fetchResourceStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Try to fetch from API, fallback to defaults if endpoint doesn't exist
      try {
        const response = await axios.get(`${API_BASE}/student/library/stats`, config);
        if (response.data) {
          setResourceStats({
            ebooks: response.data.ebooks || 0,
            journals: response.data.journals || 0,
            audiobooks: response.data.audiobooks || 0,
            videos: response.data.videos || 0,
            labs: response.data.labs || 0
          });
        }
      } catch (apiError) {
        console.log('[LearningResources] API endpoint not available, using default data');
        // Keep default zeros
      }
    } catch (err) {
      console.error('[LearningResources] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resourceCards = [
    { 
      title: 'E-Books', 
      desc: 'Access thousands of digital books online anytime.', 
      icon: <FiBook />, 
      color: 'blue',
      count: resourceStats.ebooks > 0 ? `${resourceStats.ebooks}+` : 'Available'
    },
    { 
      title: 'Journals', 
      desc: 'Latest research papers and academic journals.', 
      icon: <FiFileText />, 
      color: 'emerald',
      count: resourceStats.journals > 0 ? `${resourceStats.journals}+` : 'Available'
    },
    { 
      title: 'Audio Books', 
      desc: 'Listen to books while studying or commuting.', 
      icon: <FiMusic />, 
      color: 'purple',
      count: resourceStats.audiobooks > 0 ? `${resourceStats.audiobooks}+` : 'Available'
    },
    { 
      title: 'Video Lectures', 
      desc: 'Recorded classroom sessions and educational videos.', 
      icon: <FiVideo />, 
      color: 'rose',
      count: resourceStats.videos > 0 ? `${resourceStats.videos}+` : 'Available'
    },
    { 
      title: 'Interactive Labs', 
      desc: 'Virtual simulations and interactive learning modules.', 
      icon: <FiActivity />, 
      color: 'amber',
      count: resourceStats.labs > 0 ? `${resourceStats.labs}+` : 'Available'
    },
    { 
      title: 'Global Archive', 
      desc: 'Access to international library databases and archives.', 
      icon: <FiGlobe />, 
      color: 'cyan',
      count: 'Link'
    }
  ];

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Library</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Learning Resources</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Unlimited access to digital knowledge and research</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search digital archive..." 
            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none w-full sm:w-64 font-medium text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Featured Banner */}
      <div className="p-10 bg-slate-900 rounded-[40px] text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-white/10 text-cyan-400 border-none mb-6 px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">New Collection</Badge>
            <h2 className="text-4xl font-black tracking-tight mb-4">The Digital Heritage Library</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
              Explore our newly digitized collection of rare manuscripts and traditional Islamic literature, 
              now available in high-resolution 4K scans.
            </p>
            <Button variant="primary" className="rounded-2xl px-10 py-4 bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/20 flex items-center gap-2">
              Explore Collection <FiArrowRight />
            </Button>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-64 h-64 rounded-[48px] bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 rotate-6 group-hover:rotate-12 transition-transform duration-700">
              <div className="w-full h-full rounded-[44px] bg-slate-900 flex items-center justify-center text-7xl">
                📖
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resourceCards.map((res, i) => (
          <Card key={i} className="group p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-cyan-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-${res.color}-50 text-${res.color}-600 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                {res.icon}
              </div>
              <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[10px] uppercase tracking-widest">{res.count}</Badge>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{res.title}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed italic mb-8">
              {res.desc}
            </p>
            <button className="flex items-center gap-2 text-xs font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700 transition-colors">
              Access Database <FiExternalLink />
            </button>
          </Card>
        ))}
      </div>

      {/* Bottom Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Library Operating Hours" className="rounded-[32px] p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekdays</p>
              <p className="text-lg font-black text-slate-900">08:00 AM - 09:00 PM</p>
              <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-widest">Open Now</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekends</p>
              <p className="text-lg font-black text-slate-900">10:00 AM - 06:00 PM</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Self Service</p>
            </div>
          </div>
        </Card>

        <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-2xl font-black mb-2 tracking-tight">Research Support</h4>
            <p className="text-emerald-100 text-sm font-medium mb-8 leading-relaxed">
              Struggling with your thesis or research paper? Schedule a 1-on-1 session with our expert academic librarians.
            </p>
            <Button variant="outline" className="rounded-2xl px-8 py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
              Book Appointment
            </Button>
          </div>
          <FiInfo className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

export default LearningResources;
