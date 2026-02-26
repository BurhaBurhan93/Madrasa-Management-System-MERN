import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ExamProvider } from "./contexts/ExamContext";


// ================= AUTH =================
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// ================= HOME =================
import Home from './pages/Home';

// ================= PANELS =================
import AdminPanel from './panels/AdminPanel';
import StudentPanel from './panels/StudentPanel';
import TeacherPanel from './panels/TeacherPanel';
import StaffPanel from './panels/StaffPanel';

// ================= ADMIN PAGES =================
import AdminDashboard from './pages/admin/AdminDashboard';

// ================= STUDENT PAGES =================
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
import StudentExamAttempt from "./pages/StudentExamAttempt";
import StudentCertificates from './pages/StudentCertificates';
import StudentEvents from './pages/StudentEvents';
import StudentSettings from './pages/StudentSettings';
import LearningResources from './components/library/LearningResources';
import BorrowedBooks from './components/library/BorrowedBooks';
import PurchaseHistory from './components/library/PurchaseHistory';
import TransactionHistory from './components/finance/TransactionHistory';
import HomeworkSubmission from './components/assignments/HomeworkSubmission';
import Communications from './components/communications/Communications';

// ================= TEACHER PAGES =================
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherExamDetails from "./pages/teacher/TeacherExamDetails";
import TeacherAddQuestion from "./pages/teacher/TeacherAddQuestion";
import TeacherEditQuestion from "./pages/teacher/TeacherEditQuestion";
import TeacherExamsList from './pages/teacher/TeacherExamsList';
import TeacherCreateExam from "./pages/teacher/TeacherCreateExam";
import TeacherExamSubmissions from "./pages/teacher/TeacherExamSubmissions";
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherSessions from './pages/teacher/TeacherSessions';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherAttendanceReports from './pages/teacher/TeacherAttendanceReport';
import TeacherViewResults from './pages/teacher/TeacherViewResults';
import TeacherEnterMarks from './pages/teacher/TeacherEnterMarks';
import TeacherResults from './pages/teacher/TeacherResults';
import AssignedComplaints from './pages/teacher/AssignedCompliants';
import Messages from './pages/teacher/Messages';
import CreateAssignment from './pages/teacher/CreateAssignment';

// ================= STAFF PAGES =================
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffStudents from './pages/staff/StaffStudents';
import StaffInventory from './pages/staff/StaffInventory';
import StaffLibraryCategories from './pages/staff/library/Categories';
import StaffLibraryBooks from './pages/staff/library/Books';
import StaffLibraryBorrowed from './pages/staff/library/Borrowed';
import StaffLibraryPurchases from './pages/staff/library/Purchases';
import StaffLibrarySales from './pages/staff/library/Sales';
import StaffLibraryReports from './pages/staff/library/Reports';
import StaffComplaintsList from './pages/staff/complaints/ComplaintsList';
import StaffComplaintActions from './pages/staff/complaints/Actions';
import StaffComplaintFeedback from './pages/staff/complaints/Feedback';
import StaffComplaintReports from './pages/staff/complaints/Reports';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (auth === 'true' && role && token) {
      setIsAuthenticated(true);
      setUserRole(role);
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Protected route wrapper component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || !isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <ExamProvider>
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
            <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">All Users</h1><p className="text-gray-600 mt-2">User management page coming soon...</p></div>} />
            <Route path="users/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Students</h1><p className="text-gray-600 mt-2">Student management page coming soon...</p></div>} />
            <Route path="users/teachers" element={<div className="p-6"><h1 className="text-2xl font-bold">Teachers</h1><p className="text-gray-600 mt-2">Teacher management page coming soon...</p></div>} />
            <Route path="users/staff" element={<div className="p-6"><h1 className="text-2xl font-bold">Staff</h1><p className="text-gray-600 mt-2">Staff management page coming soon...</p></div>} />
            <Route path="academic/classes" element={<div className="p-6"><h1 className="text-2xl font-bold">Classes</h1><p className="text-gray-600 mt-2">Class management page coming soon...</p></div>} />
            <Route path="academic/subjects" element={<div className="p-6"><h1 className="text-2xl font-bold">Subjects</h1><p className="text-gray-600 mt-2">Subject management page coming soon...</p></div>} />
            <Route path="academic/exams" element={<div className="p-6"><h1 className="text-2xl font-bold">Exams</h1><p className="text-gray-600 mt-2">Exam management page coming soon...</p></div>} />
            <Route path="academic/timetable" element={<div className="p-6"><h1 className="text-2xl font-bold">Timetable</h1><p className="text-gray-600 mt-2">Timetable management page coming soon...</p></div>} />
            <Route path="attendance/daily" element={<div className="p-6"><h1 className="text-2xl font-bold">Daily Attendance</h1><p className="text-gray-600 mt-2">Daily attendance page coming soon...</p></div>} />
            <Route path="attendance/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Reports</h1><p className="text-gray-600 mt-2">Attendance reports page coming soon...</p></div>} />
            <Route path="attendance/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Settings</h1><p className="text-gray-600 mt-2">Attendance settings page coming soon...</p></div>} />
            <Route path="finance/fee-structure" element={<div className="p-6"><h1 className="text-2xl font-bold">Fee Structure</h1><p className="text-gray-600 mt-2">Fee structure page coming soon...</p></div>} />
            <Route path="finance/payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments</h1><p className="text-gray-600 mt-2">Payments page coming soon...</p></div>} />
            <Route path="finance/expenses" element={<div className="p-6"><h1 className="text-2xl font-bold">Expenses</h1><p className="text-gray-600 mt-2">Expenses page coming soon...</p></div>} />
            <Route path="finance/salaries" element={<div className="p-6"><h1 className="text-2xl font-bold">Salaries</h1><p className="text-gray-600 mt-2">Salaries page coming soon...</p></div>} />
            <Route path="finance/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Financial Reports</h1><p className="text-gray-600 mt-2">Financial reports page coming soon...</p></div>} />
            <Route path="library/books" element={<div className="p-6"><h1 className="text-2xl font-bold">Books</h1><p className="text-gray-600 mt-2">Books management page coming soon...</p></div>} />
            <Route path="library/categories" element={<div className="p-6"><h1 className="text-2xl font-bold">Categories</h1><p className="text-gray-600 mt-2">Categories page coming soon...</p></div>} />
            <Route path="library/borrowed" element={<div className="p-6"><h1 className="text-2xl font-bold">Borrowed Books</h1><p className="text-gray-600 mt-2">Borrowed books page coming soon...</p></div>} />
            <Route path="library/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Library Reports</h1><p className="text-gray-600 mt-2">Library reports page coming soon...</p></div>} />
            <Route path="complaints" element={<div className="p-6"><h1 className="text-2xl font-bold">All Complaints</h1><p className="text-gray-600 mt-2">All complaints page coming soon...</p></div>} />
            <Route path="complaints/pending" element={<div className="p-6"><h1 className="text-2xl font-bold">Pending Complaints</h1><p className="text-gray-600 mt-2">Pending complaints page coming soon...</p></div>} />
            <Route path="complaints/resolved" element={<div className="p-6"><h1 className="text-2xl font-bold">Resolved Complaints</h1><p className="text-gray-600 mt-2">Resolved complaints page coming soon...</p></div>} />
            <Route path="reports/academic" element={<div className="p-6"><h1 className="text-2xl font-bold">Academic Reports</h1><p className="text-gray-600 mt-2">Academic reports page coming soon...</p></div>} />
            <Route path="reports/financial" element={<div className="p-6"><h1 className="text-2xl font-bold">Financial Reports</h1><p className="text-gray-600 mt-2">Financial reports page coming soon...</p></div>} />
            <Route path="reports/attendance" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Reports</h1><p className="text-gray-600 mt-2">Attendance reports page coming soon...</p></div>} />
            <Route path="settings/general" element={<div className="p-6"><h1 className="text-2xl font-bold">General Settings</h1><p className="text-gray-600 mt-2">General settings page coming soon...</p></div>} />
            <Route path="settings/academic" element={<div className="p-6"><h1 className="text-2xl font-bold">Academic Settings</h1><p className="text-gray-600 mt-2">Academic settings page coming soon...</p></div>} />
            <Route path="settings/notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gray-600 mt-2">Notifications settings page coming soon...</p></div>} />
            <Route path="profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Admin Profile</h1><p className="text-gray-600 mt-2">Profile page coming soon...</p></div>} />
          </Route>

          {/* ================= TEACHER ================= */}
          <Route path="/teacher/*" element={<TeacherPanel />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path='students' element={<TeacherStudents />} />
            <Route path='assignments' element={<TeacherAssignments />} />
            <Route path='sessions' element={<TeacherSessions />} />
            <Route path='attendance' element={<TeacherAttendance />} />
            <Route path='attendance-reports' element={<TeacherAttendanceReports />} />
            <Route path='create-assignments' element={<CreateAssignment />} />
            <Route path="exams" element={<TeacherExamsList />} />
            <Route path="exams/:examId" element={<TeacherExamDetails />} />
            <Route path="exams/:examId/add-question" element={<TeacherAddQuestion />} />
            <Route path="exams/:examId/edit-question/:questionId" element={<TeacherEditQuestion />} />
            <Route path="exams/create" element={<TeacherCreateExam />} />
            <Route path="exams/:examId/submissions" element={<TeacherExamSubmissions />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="results/enter-marks" element={<TeacherEnterMarks />} />
            <Route path="results/view-results" element={<TeacherViewResults />} />
            <Route path="complaints" element={<AssignedComplaints />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* ================= STAFF ================= */}
          <Route path="/staff/*" element={<StaffPanel />}>
            <Route index element={<StaffDashboard />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="students" element={<StaffStudents />} />
            <Route path="inventory" element={<StaffInventory />} />
            <Route path="library/categories" element={<StaffLibraryCategories />} />
            <Route path="library/books" element={<StaffLibraryBooks />} />
            <Route path="library/borrowed" element={<StaffLibraryBorrowed />} />
            <Route path="library/purchases" element={<StaffLibraryPurchases />} />
            <Route path="library/sales" element={<StaffLibrarySales />} />
            <Route path="library/reports" element={<StaffLibraryReports />} />
            <Route path="complaints" element={<StaffComplaintsList />} />
            <Route path="complaints/actions" element={<StaffComplaintActions />} />
            <Route path="complaints/feedback" element={<StaffComplaintFeedback />} />
            <Route path="complaints/reports" element={<StaffComplaintReports />} />
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
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="events" element={<StudentEvents />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="exams/:examId/attempt" element={<StudentExamAttempt />} />
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ExamProvider>
  );
}

export default App;
