import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Madrasa EMIS</h1>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Madrasa Management System
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Comprehensive Educational Management Information System for modern madrasa administration,
            student management, and academic excellence.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Academic Management</h3>
              <p className="text-gray-600">
                Manage courses, exams, assignments, and track student progress effectively.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">User Management</h3>
              <p className="text-gray-600">
                Administer students, teachers, and staff with role-based access control.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Reports & Analytics</h3>
              <p className="text-gray-600">
                Generate comprehensive reports on attendance, finances, and academic performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 Madrasa EMIS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
