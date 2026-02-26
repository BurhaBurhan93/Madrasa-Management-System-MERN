import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-bold">
                M
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Madrasa EMIS</span>
            </div>
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Madrasa EMIS</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A comprehensive Education Management Information System designed to streamline 
            academic operations, student management, and administrative tasks for your institution.
          </p>
          <button
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started - Login
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Admin Feature */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-2xl mb-4">
              👑
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600">
              Complete system control with user management, academic settings, finance, and comprehensive reporting.
            </p>
          </div>

          {/* Student Feature */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl mb-4">
              🎓
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Portal</h3>
            <p className="text-gray-600">
              Access courses, assignments, exams, attendance, fees, and library resources all in one place.
            </p>
          </div>

          {/* Teacher Feature */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl mb-4">
              📚
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher Portal</h3>
            <p className="text-gray-600">
              Manage classes, take attendance, create exams, grade assignments, and communicate with students.
            </p>
          </div>

          {/* Staff Feature */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl mb-4">
              ⚙️
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Staff Portal</h3>
            <p className="text-gray-600">
              Handle library management, complaint resolution, and daily administrative operations.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 mt-1">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">50+</div>
              <div className="text-gray-600 mt-1">Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">100+</div>
              <div className="text-gray-600 mt-1">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">98%</div>
              <div className="text-gray-600 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Madrasa EMIS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
