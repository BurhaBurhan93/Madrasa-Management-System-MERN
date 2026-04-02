import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiBook, FiAward, FiDollarSign, FiMessageSquare, FiPhone, FiMail, FiMapPin, FiCheck } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    satisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    // Fetch statistics from database
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real scenario, you would have API endpoints for these stats
      // For now, we'll show placeholder data that would come from the database
      const response = await axios.get('http://localhost:5000/api/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.log('Stats fetch error (expected if endpoint not implemented yet)');
      // Set default values if API fails
      setStats({
        students: 500,
        teachers: 50,
        courses: 100,
        satisfaction: 98
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Contact form submitted:', contactForm);
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-bold shadow-md">
                M
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Madrasa EMIS</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className={`text-sm font-medium transition-colors ${activeSection === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Home</button>
              <button onClick={() => scrollToSection('about')} className={`text-sm font-medium transition-colors ${activeSection === 'about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>About</button>
              <button onClick={() => scrollToSection('features')} className={`text-sm font-medium transition-colors ${activeSection === 'features' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Features</button>
              <button onClick={() => scrollToSection('contact')} className={`text-sm font-medium transition-colors ${activeSection === 'contact' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Contact</button>
            </div>
            
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Madrasa EMIS
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            A comprehensive <strong>Education Management Information System</strong> designed to streamline 
            academic operations, student management, and administrative tasks for your institution.
            Built with modern technology to provide a seamless experience for all stakeholders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Get Started - Login
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-md"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your educational institution</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Admin Feature */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
                👑
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admin Panel</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete system control with user management, academic settings, finance, and comprehensive reporting.
              </p>
            </div>

            {/* Student Feature */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
                🎓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Access courses, assignments, exams, attendance, fees, and library resources all in one place.
              </p>
            </div>

            {/* Teacher Feature */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Teacher Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage classes, take attendance, create exams, grade assignments, and communicate with students.
              </p>
            </div>

            {/* Staff Feature */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
                ⚙️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Staff Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Handle admissions, library, finance, HR, kitchen management, and daily administrative operations.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-10">Our Impact in Numbers</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <div className="text-5xl font-extrabold text-blue-600 mb-2">{stats.students}+</div>
                <div className="text-gray-600 font-medium">Students Enrolled</div>
              </div>
              <div className="p-4">
                <div className="text-5xl font-extrabold text-green-600 mb-2">{stats.teachers}+</div>
                <div className="text-gray-600 font-medium">Qualified Teachers</div>
              </div>
              <div className="p-4">
                <div className="text-5xl font-extrabold text-purple-600 mb-2">{stats.courses}+</div>
                <div className="text-gray-600 font-medium">Courses Offered</div>
              </div>
              <div className="p-4">
                <div className="text-5xl font-extrabold text-red-600 mb-2">{stats.satisfaction}%</div>
                <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Madrasa EMIS</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Empowering educational institutions with modern management solutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Madrasa EMIS?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Madrasa EMIS is a comprehensive Education Management Information System designed specifically for Islamic educational institutions. 
                We combine traditional Islamic education values with cutting-edge technology to provide a seamless management experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Complete digital transformation of your institution</p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Streamlined administrative and academic processes</p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Real-time analytics and comprehensive reporting</p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Enhanced communication between all stakeholders</p>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Secure, role-based access control</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Key Modules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Student Management</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiBook className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Academic Operations</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiAward className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Exam & Results</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiDollarSign className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-800">Finance & Accounts</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiBook className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-800">Library Management</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FiMessageSquare className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-800">Communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+93 (XXX) XXX-XXXX</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">info@madrasa-emis.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">Kabul, Afghanistan</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Support Hours</h4>
                <p className="text-gray-600">Saturday - Thursday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Friday: Closed</p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {contactSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+93 (XXX) XXX-XXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                  M
                </div>
                <span className="text-xl font-bold">Madrasa EMIS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering Islamic educational institutions with modern management solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Admin Panel</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Student Portal</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Teacher Portal</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Staff Workspace</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <span className="text-lg">📷</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Madrasa EMIS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
