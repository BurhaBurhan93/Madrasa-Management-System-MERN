import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserIndex from './pages/admin/users/UserIndex';
import UserRegister from './pages/admin/users/UserRegister';
import UserEdit from './pages/admin/users/UserEdit';

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
import LearningResources from './components/library/LearningResources';
import BorrowedBooks from './components/library/BorrowedBooks';
import PurchaseHistory from './components/library/PurchaseHistory';
import TransactionHistory from './components/finance/TransactionHistory';
import HomeworkSubmission from './components/assignments/HomeworkSubmission';
import Communications from './components/communications/Communications';

// Staff — all routes controlled from StaffRoutes
import staffRoutes from './routes/StaffRoutes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken(); // validates & clears if expired/fake
    const role  = getUserRole();
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      clearAuth();
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const role = getUserRole();
    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
    if (!isTokenValid()) { clearAuth(); return <Navigate to="/login" replace />; }
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <ExamProvider>
      <Router>
        <Routes>

          {/* ── Public ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin ── */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserIndex />} />
            <Route path="users/register" element={<UserRegister />} />
            <Route path="users/edit/:id" element={<UserEdit />} />
            <Route path="academic/classes"    element={<ComingSoon title="Classes" />} />
            <Route path="academic/subjects"   element={<ComingSoon title="Subjects" />} />
            <Route path="academic/exams"      element={<ComingSoon title="Exams" />} />
            <Route path="academic/timetable"  element={<ComingSoon title="Timetable" />} />
            <Route path="attendance/daily"    element={<ComingSoon title="Daily Attendance" />} />
            <Route path="attendance/reports"  element={<ComingSoon title="Attendance Reports" />} />
            <Route path="attendance/settings" element={<ComingSoon title="Attendance Settings" />} />
            <Route path="finance/fee-structure" element={<ComingSoon title="Fee Structure" />} />
            <Route path="finance/payments"    element={<ComingSoon title="Payments" />} />
            <Route path="finance/expenses"    element={<ComingSoon title="Expenses" />} />
            <Route path="finance/salaries"    element={<ComingSoon title="Salaries" />} />
            <Route path="finance/reports"     element={<ComingSoon title="Financial Reports" />} />
            <Route path="library/books"       element={<ComingSoon title="Books" />} />
            <Route path="library/categories"  element={<ComingSoon title="Categories" />} />
            <Route path="library/borrowed"    element={<ComingSoon title="Borrowed Books" />} />
            <Route path="library/reports"     element={<ComingSoon title="Library Reports" />} />
            <Route path="complaints"          element={<ComingSoon title="All Complaints" />} />
            <Route path="complaints/pending"  element={<ComingSoon title="Pending Complaints" />} />
            <Route path="complaints/resolved" element={<ComingSoon title="Resolved Complaints" />} />
            <Route path="reports/academic"    element={<ComingSoon title="Academic Reports" />} />
            <Route path="reports/financial"   element={<ComingSoon title="Financial Reports" />} />
            <Route path="reports/attendance"  element={<ComingSoon title="Attendance Reports" />} />
            <Route path="settings/general"    element={<ComingSoon title="General Settings" />} />
            <Route path="settings/academic"   element={<ComingSoon title="Academic Settings" />} />
            <Route path="settings/notifications" element={<ComingSoon title="Notifications" />} />
            <Route path="profile"             element={<ComingSoon title="Admin Profile" />} />
          </Route>

          {/* ── Teacher ── */}
          <Route path="/teacher/*" element={<TeacherPanel />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="subjects"            element={<TeacherSubjects />} />
            <Route path="profile"             element={<TeacherProfile />} />
            <Route path="students"            element={<TeacherStudents />} />
            <Route path="assignments"         element={<TeacherAssignments />} />
            <Route path="create-assignments"  element={<CreateAssignment />} />
            <Route path="attendance"          element={<TeacherAttendance />} />
            <Route path="attendance-reports"  element={<TeacherAttendanceReports />} />
            <Route path="exams"               element={<TeacherExamsList />} />
            <Route path="exams/create"        element={<TeacherCreateExam />} />
            <Route path="exams/:examId"       element={<TeacherExamDetails />} />
            <Route path="exams/:examId/add-question"                    element={<TeacherAddQuestion />} />
            <Route path="exams/:examId/edit-question/:questionId"       element={<TeacherEditQuestion />} />
            <Route path="exams/:examId/submissions"                     element={<TeacherExamSubmissions />} />
            <Route path="results"             element={<TeacherResults />} />
            <Route path="results/enter-marks" element={<TeacherEnterMarks />} />
            <Route path="results/view-results" element={<TeacherViewResults />} />
            <Route path="complaints"          element={<AssignedComplaints />} />
          </Route>

          {/* ── Staff — fully controlled by StaffRoutes ── */}
          {staffRoutes}

          {/* ── Student ── */}
          <Route path="/student/*" element={<StudentPanel />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard"           element={<StudentDashboard />} />
            <Route path="profile"             element={<StudentProfile />} />
            <Route path="courses"             element={<StudentCourses />} />
            <Route path="attendance"          element={<StudentAttendance />} />
            <Route path="assignments"         element={<StudentAssignments />} />
            <Route path="homework-submission" element={<HomeworkSubmission />} />
            <Route path="results"             element={<StudentResults />} />
            <Route path="exam-results"        element={<StudentExamResults />} />
            <Route path="timetable"           element={<StudentTimetable />} />
            <Route path="schedule"            element={<StudentSchedule />} />
            <Route path="exams"               element={<StudentExams />} />
            <Route path="exams/:examId/attempt" element={<StudentExamAttempt />} />
            <Route path="fees"                element={<StudentFees />} />
            <Route path="library"             element={<StudentLibrary />} />
            <Route path="resources"           element={<LearningResources />} />
            <Route path="borrowed"            element={<BorrowedBooks />} />
            <Route path="purchase"            element={<PurchaseHistory />} />
            <Route path="transactions"        element={<TransactionHistory />} />
            <Route path="complaints"          element={<StudentComplaints />} />
            <Route path="communications"      element={<Communications />} />
            <Route path="certificates"        element={<StudentCertificates />} />
            <Route path="events"              element={<StudentEvents />} />
            <Route path="settings"            element={<StudentSettings />} />
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
