import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ExamProvider } from './contexts/ExamContext';
import { isTokenValid, getToken, getUserRole, clearAuth } from './lib/auth';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Home
import Home from './pages/Home';

// Panels
import AdminPanel from './panels/AdminPanel';
import StudentPanel from './panels/StudentPanel';
import TeacherPanel from './panels/TeacherPanel';
import StaffPanel from './panels/StaffPanel';
import PrintPage from './components/PrintPage';

import AdminRoutes from './routes/AdminRoutes';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherExamDetails from './pages/teacher/TeacherExamDetails';
import TeacherAddQuestion from './pages/teacher/TeacherAddQuestion';
import TeacherEditQuestion from './pages/teacher/TeacherEditQuestion';
import TeacherExamsList from './pages/teacher/TeacherExamsList';
import TeacherCreateExam from './pages/teacher/TeacherCreateExam';
import TeacherExamSubmissions from './pages/teacher/TeacherExamSubmissions';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherAttendanceReports from './pages/teacher/TeacherAttendanceReport';
import TeacherViewResults from './pages/teacher/TeacherViewResults';
import TeacherEnterMarks from './pages/teacher/TeacherEnterMarks';
import TeacherResults from './pages/teacher/TeacherResults';
import AssignedComplaints from './pages/teacher/AssignedCompliants';
import CreateAssignment from './pages/teacher/CreateAssignment';

// Student
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfileReadonly';
import StudentCourses from './pages/StudentCourses';
import StudentAttendance from './pages/StudentAttendance';
import StudentResults from './pages/StudentResults';
import StudentExamResults from './pages/StudentExamResults';
import StudentTimetable from './pages/StudentTimetable';
import StudentSchedule from './pages/StudentSchedule';
import StudentExams from './pages/StudentExams';
import StudentExamAttempt from './pages/StudentExamAttempt';
import StudentFees from './pages/StudentFees';
import StudentLibrary from './pages/StudentLibrary';
import StudentCertificates from './pages/StudentCertificates';
import StudentEvents from './pages/StudentEvents';
import StudentHostel from './pages/StudentHostel';
import StudentLeave from './pages/StudentLeave';
import StudentSettings from './pages/StudentSettings';
import LearningResources from './components/library/LearningResources';
import BorrowedBooks from './components/library/BorrowedBooks';
import PurchaseHistory from './components/library/PurchaseHistory';
import TransactionHistory from './components/finance/TransactionHistory';
import StudentComplaints from './pages/StudentComplaints';
import Communications from './components/communications/Communications';
import HomeworkSubmission from './components/assignments/HomeworkSubmission';

// Staff — all routes controlled from StaffRoutes
import staffRoutes from './routes/StaffRoutes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HomeWithRedirect = ({ isAuthenticated, loading }) => {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        navigate(lastPath, { replace: true });
      } else {
        const role = getUserRole();
        const defaultPaths = {
          admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
          staff: '/staff/dashboard',
          student: '/student/dashboard'
        };
        if (defaultPaths[role]) {
          navigate(defaultPaths[role], { replace: true });
        }
      }
      setRedirecting(true);
    }
  }, [navigate, isAuthenticated, loading]);

  if (loading || redirecting) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
  }
  return <Home />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      const token = getToken();
      const role = getUserRole();

      if (!token || !role) {
        clearAuth();
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
        }
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = response.data?.user || response.data?.data?.user || null;

        if (!mounted) return;

        if (currentUser) {
          localStorage.setItem('user', JSON.stringify(currentUser));
          localStorage.setItem('userRole', currentUser.role || role);
          setUserRole(currentUser.role || role);
        } else {
          setUserRole(role);
        }
        setIsAuthenticated(true);
      } catch (error) {
        clearAuth();
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const role = getUserRole();
    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
    if (!isAuthenticated || !isTokenValid()) { clearAuth(); return <Navigate to="/login" replace />; }
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
  };

  const adminRoles = ['admin'];
  const teacherRoles = ['teacher'];
  const staffRoles = ['staff'];
  const studentRoles = ['student'];

  return (
    <ExamProvider>
      <Router>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomeWithRedirect isAuthenticated={isAuthenticated} loading={loading} />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin ── */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={adminRoles}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            {AdminRoutes}
          </Route>

          {/* ── Teacher ── */}
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={teacherRoles}>
              <TeacherPanel />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="create-assignments" element={<CreateAssignment />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="attendance-reports" element={<TeacherAttendanceReports />} />
            <Route path="exams" element={<TeacherExamsList />} />
            <Route path="exams/create" element={<TeacherCreateExam />} />
            <Route path="exams/:examId" element={<TeacherExamDetails />} />
            <Route path="exams/:examId/add-question" element={<TeacherAddQuestion />} />
            <Route path="exams/:examId/edit-question/:questionId" element={<TeacherEditQuestion />} />
            <Route path="exams/:examId/submissions" element={<TeacherExamSubmissions />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="results/enter-marks" element={<TeacherEnterMarks />} />
            <Route path="results/view-results" element={<TeacherViewResults />} />
            <Route path="complaints" element={<AssignedComplaints />} />
            <Route path="print/:type/:id?" element={<PrintPage />} />
          </Route>

          {/* ── Staff ── */}
          <Route path="/staff/*" element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <StaffPanel />
            </ProtectedRoute>
          }>
            {staffRoutes}
          </Route>

          {/* ── Student ── */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={studentRoles}>
              <StudentPanel />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="homework-submission" element={<HomeworkSubmission />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="exam-results" element={<StudentExamResults />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="schedule" element={<StudentSchedule />} />
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
            <Route path="print/:type/:id?" element={<PrintPage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ExamProvider>
  );
}

const ComingSoon = ({ title }) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
    <div className="text-4xl">🚧</div>
    <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
    <p className="text-sm">This page is coming soon.</p>
  </div>
);

export default App;
