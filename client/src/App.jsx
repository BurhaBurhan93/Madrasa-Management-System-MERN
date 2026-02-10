import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true to bypass login
  const [loading, setLoading] = useState(false);

  // Initialize with default authentication
  useEffect(() => {
    // Set a mock token to simulate logged in state
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
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<StudentPanel /> }>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="schedule" element={<div className="p-6">Schedule page coming soon</div>} />
            <Route path="exams" element={<div className="p-6">Exams page coming soon</div>} />
            <Route path="resources" element={<div className="p-6">Resources page coming soon</div>} />
            <Route path="borrowed" element={<div className="p-6">Borrowed books page coming soon</div>} />
            <Route path="purchase" element={<div className="p-6">Purchase history page coming soon</div>} />
            <Route path="fees" element={<div className="p-6">Fees & payments page coming soon</div>} />
            <Route path="transactions" element={<div className="p-6">Transaction history page coming soon</div>} />
            <Route path="messages" element={<div className="p-6">Messages page coming soon</div>} />
            <Route path="announcements" element={<div className="p-6">Announcements page coming soon</div>} />
            <Route path="feedback" element={<div className="p-6">Feedback page coming soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings page coming soon</div>} />
            <Route path="security" element={<div className="p-6">Security page coming soon</div>} />
          </Route>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tailwind-test" element={<TailwindTest />} />
          <Route path="/*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
