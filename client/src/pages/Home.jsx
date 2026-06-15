import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, FiMenu, FiX, FiSun, FiMoon, FiLogIn } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import useMadrasaInfo from '../hooks/useMadrasaInfo';
import { getMadrasaDisplayName, getMadrasaLogo } from '../lib/madrasaInfo';

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [madrasaInfo] = useMadrasaInfo();
  const madrasaName = getMadrasaDisplayName(madrasaInfo);
  const madrasaLogo = getMadrasaLogo(madrasaInfo);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FiBookOpen className="h-10 w-10" />,
      title: 'Academic Management',
      description: 'Manage courses, exams, assignments, and track student progress effectively with our comprehensive academic tools.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <FiUsers className="h-10 w-10" />,
      title: 'User Management',
      description: 'Administer students, teachers, and staff with role-based access control and detailed user profiles.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <FiCalendar className="h-10 w-10" />,
      title: 'Attendance Tracking',
      description: 'Efficiently track and manage student and staff attendance with automated systems and detailed reports.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <FiDollarSign className="h-10 w-10" />,
      title: 'Financial Management',
      description: 'Handle fees, payments, salaries, and financial reports with our integrated finance module.',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Students' },
    { number: '500+', label: 'Teachers' },
    { number: '200+', label: 'Courses' },
    { number: '50+', label: 'Institutions' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.95),_rgba(15,23,42,1)_42%,_rgba(30,41,59,1)_100%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.9),_rgba(248,250,252,1)_42%,_rgba(241,245,249,1)_100%)]'}`}>
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? (theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/60' : 'bg-white/80 backdrop-blur-xl border-b border-white/70') : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-lg font-bold text-white shadow-[0_12px_30px_-18px_rgba(14,165,233,0.9)]">
                {madrasaLogo ? (
                  <img src={madrasaLogo} alt={`${madrasaName} logo`} className="h-full w-full object-cover" />
                ) : (
                  <span>{madrasaName[0]?.toUpperCase() || 'M'}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">{madrasaName}</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-700 hover:text-cyan-600'}`}>Home</button>
              <button onClick={() => navigate('/login')} className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-700 hover:text-cyan-600'}`}>Features</button>
              <button onClick={() => navigate('/login')} className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-700 hover:text-cyan-600'}`}>About</button>
              <button onClick={() => navigate('/login')} className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-700 hover:text-cyan-600'}`}>Contact</button>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'}`}>
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-cyan-500/20">
                  <FiLogIn size={16} />
                  Login
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 1)', backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)', color: theme === 'dark' ? 'rgba(203, 213, 225, 1)' : 'rgba(100, 116, 139, 1)' }}>
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white/95 border-white/70'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
              <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>Home</button>
              <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>Features</button>
              <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>About</button>
              <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>Contact</button>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full px-4 py-3 text-white rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">Login</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 mb-6">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-sm font-medium">Modern Madrasa Management System</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Transform Your Madrasa with
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"> Intelligent Management</span>
            </h1>

            <p className={`text-lg sm:text-xl mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Comprehensive Educational Management Information System for modern madrasa administration, student management, and academic excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/login')} className="px-8 py-4 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 hover:-translate-y-1 shadow-xl shadow-cyan-500/20">
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className={`px-8 py-4 text-base font-semibold rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20">
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl border backdrop-blur-xl ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/50' : 'border-white/70 bg-white/50'}`}>
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Powerful Features for Modern Madrasas
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Everything you need to manage your institution efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/50 hover:bg-slate-800/80' : 'border-white/70 bg-white/50 hover:bg-white/80'}`}>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32">
            <div className={`p-12 rounded-3xl border bg-gradient-to-r from-cyan-600 to-blue-600 text-center ${theme === 'dark' ? 'border-slate-700/60' : 'border-white/70'}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to transform your madrasa?
              </h2>
              <p className="text-cyan-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of institutions already using Madrasa EMIS
              </p>
              <button onClick={() => navigate('/login')} className="px-8 py-4 text-base font-semibold text-cyan-700 bg-white rounded-2xl hover:bg-slate-50 transition-all duration-200 hover:-translate-y-1 shadow-xl">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-12 border-t ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/50' : 'border-white/70 bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-lg font-bold text-white">
                  {madrasaLogo ? (
                    <img src={madrasaLogo} alt={`${madrasaName} logo`} className="h-full w-full object-cover" />
                  ) : (
                    <span>{madrasaName[0]?.toUpperCase() || 'M'}</span>
                  )}
                </div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">{madrasaName}</div>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Comprehensive Educational Management Information System
              </p>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Features</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Pricing</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Updates</button></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Company</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>About</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Blog</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Careers</button></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Help Center</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Contact</button></li>
                <li><button onClick={() => navigate('/login')} className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>Privacy</button></li>
              </ul>
            </div>
          </div>
          <div className={`pt-8 border-t ${theme === 'dark' ? 'border-slate-700/60' : 'border-white/70'} text-center`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
              © 2026 Madrasa EMIS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
