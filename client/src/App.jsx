import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TailwindTest from './components/UIHelper/TailwindTest';

// Import Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentCourses from './pages/StudentCourses';
import StudentAttendance from './pages/StudentAttendance';
import StudentAssignments from './pages/StudentAssignments';
import StudentResults from './pages/StudentResults';

// Import Panels
import StudentPanel from './panels/StudentPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('studentToken')) {
      localStorage.setItem('studentToken', 'mock-jwt-token');
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<StudentPanel />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="results" element={<StudentResults />} />
        </Route>

        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tailwind-test" element={<TailwindTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
