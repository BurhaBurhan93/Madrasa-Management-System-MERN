import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

// ================= HOME =================
import Home from './pages/Home';

// ================= AUTH =================
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// ================= PANELS =================
import AdminPanel from './panels/AdminPanel';
import StudentPanel from './panels/StudentPanel';
import TeacherPanel from './panels/TeacherPanel';
import StaffPanel from './panels/StaffPanel';

// ================= ADMIN PAGES =================
import AdminDashboard from './pages/admin/AdminDashboard';

// ================= STUDENT PAGES =================
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfileReadonly';
import StudentCourses from './pages/StudentCourses';
import StudentAttendance from './pages/StudentAttendance';
import StudentAssignments from './pages/StudentAssignments';
import StudentResults from './pages/StudentResults';
import StudentSchedule from './pages/StudentSchedule';
import StudentExams from './pages/StudentExams';
import StudentFees from './pages/StudentFees';
import StudentLibrary from './pages/StudentLibrary';
import StudentComplaints from './pages/StudentComplaints';
import StudentExamAttempt from './pages/StudentExamAttempt';
import StudentCertificates from './pages/StudentCertificates';
import StudentEvents from './pages/StudentEvents';
import StudentSettings from './pages/StudentSettings';
import StudentExamResults from './pages/StudentExamResults';
import StudentTimetable from './pages/StudentTimetable';
import StudentHostel from './pages/StudentHostel';
import StudentLeave from './pages/StudentLeave';
import StudentDegree from './pages/StudentDegree';
import StudentEducation from './pages/StudentEducation';
import LearningResources from './components/library/LearningResources';
import BorrowedBooks from './components/library/BorrowedBooks';
import PurchaseHistory from './components/library/PurchaseHistory';
import TransactionHistory from './components/finance/TransactionHistory';
import HomeworkSubmission from './components/assignments/HomeworkSubmission';
import Communications from './components/communications/Communications';

// ================= TEACHER PAGES =================
import TeacherDashboard from './pages/teacher/TeacherDashboard';

// ================= STAFF PAGES =================
import StaffDashboard from './pages/staff/StaffDashboard';

function App() {
  console.log('App component rendering...');
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole');
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    
    if (auth === 'true' && role && token) {
      setIsAuthenticated(true);
      setUserRole(role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Protected route wrapper component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    
    if (!token || !isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* ================= HOME (ROOT) ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ================= TEACHER ================= */}
        <Route path="/teacher/*" element={<TeacherPanel />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* ================= STAFF ================= */}
        <Route path="/staff/*" element={<StaffPanel />}>
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
        </Route>

        {/* ================= STUDENT ================= */}
        <Route path="/student/*" element={<StudentPanel />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="homework-submission" element={<HomeworkSubmission />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="exam-results" element={<StudentExamResults />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="degrees" element={<StudentDegree />} />
          <Route path="education" element={<StudentEducation />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="exams/:examId/attempt" element={<StudentExamAttempt />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="resources" element={<LearningResources />} />
          <Route path="borrowed" element={<BorrowedBooks />} />
          <Route path="purchase" element={<PurchaseHistory />} />
          <Route path="transactions" element={<TransactionHistory />} />
          <Route path="complaints" element={<StudentComplaints />} />
          <Route path="communications" element={<Communications />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="hostel" element={<StudentHostel />} />
          <Route path="leave" element={<StudentLeave />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
