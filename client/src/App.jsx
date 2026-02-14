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
import StudentSchedule from './pages/StudentSchedule';
import StudentExams from './pages/StudentExams';
import StudentFees from './pages/StudentFees';
import StudentLibrary from './pages/StudentLibrary';
import StudentComplaints from './pages/StudentComplaints';

// Import Library Components
import LearningResources from './components/library/LearningResources';
import BorrowedBooks from './components/library/BorrowedBooks';
import PurchaseHistory from './components/library/PurchaseHistory';

// Import Finance Components
import TransactionHistory from './components/finance/TransactionHistory';

// Import additional components
import Communications from './components/communications/Communications';
import Security from './components/profile/Security';

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
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="resources" element={<LearningResources />} />
            <Route path="borrowed" element={<BorrowedBooks />} />
            <Route path="purchase" element={<PurchaseHistory />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="communications" element={<Communications />} />
            <Route path="feedback" element={<Communications />} />
            <Route path="settings" element={<StudentProfile />} />
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
