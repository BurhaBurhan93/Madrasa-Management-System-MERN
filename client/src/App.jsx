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

// ================= STAFF USER MANAGEMENT =================
import UserIndex from './pages/admin/users/UserIndex';
import UserRegister from './pages/admin/users/UserRegister';
import UserEdit from './pages/admin/users/UserEdit';

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
import StudentExamAttempt from "./pages/StudentExamAttempt";
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
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherAttendanceReports from './pages/teacher/TeacherAttendanceReport';
import TeacherViewResults from './pages/teacher/TeacherViewResults';
import TeacherEnterMarks from './pages/teacher/TeacherEnterMarks';
import TeacherResults from './pages/teacher/TeacherResults';
import AssignedComplaints from './pages/teacher/AssignedCompliants';
import CreateAssignment from './pages/teacher/CreateAssignment';

// ================= STAFF PAGES =================
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffStudents from './pages/staff/StaffStudents';
import StudentAdmissions from './pages/staff/registrar/StudentAdmissions';
import StudentsList from './pages/staff/registrar/StudentsList';
import StudentProfiles from './pages/staff/registrar/StudentProfiles';
import ClassAssignment from './pages/staff/registrar/ClassAssignment';
import DataCorrection from './pages/staff/registrar/DataCorrection';
import GuardianManagement from './pages/staff/registrar/GuardianManagement';
import EducationHistory from './pages/staff/registrar/EducationHistory';
import DocumentsManagement from './pages/staff/registrar/DocumentsManagement';
import RegistrarReports from './pages/staff/registrar/RegistrarReports';
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
import StaffFinanceIndex from './pages/staff/finance/Finance';
import StaffFinanceTransactions from './pages/staff/finance/Transactions';
import StaffFinanceAccounts from './pages/staff/finance/Accounts';
import StaffFinanceFeeStructures from './pages/staff/finance/FeeStructures';
import StaffFinanceStudentFees from './pages/staff/finance/StudentFees';
import StaffFinanceFeePayments from './pages/staff/finance/FeePayments';
import StaffFinanceExpenses from './pages/staff/finance/Expenses';
import StaffFinanceReports from './pages/staff/finance/FinancialReports';
import StaffFinanceTransactionsCreate from './pages/staff/finance/TransactionsCreate';
import StaffFinanceTransactionsEdit from './pages/staff/finance/TransactionsEdit';
import StaffFinanceTransactionsView from './pages/staff/finance/TransactionsView';
import StaffFinanceAccountsCreate from './pages/staff/finance/AccountsCreate';
import StaffFinanceAccountsEdit from './pages/staff/finance/AccountsEdit';
import StaffFinanceAccountsView from './pages/staff/finance/AccountsView';
import StaffFinanceFeeStructuresCreate from './pages/staff/finance/FeeStructuresCreate';
import StaffFinanceFeeStructuresEdit from './pages/staff/finance/FeeStructuresEdit';
import StaffFinanceFeeStructuresView from './pages/staff/finance/FeeStructuresView';
import StaffFinanceStudentFeesCreate from './pages/staff/finance/StudentFeesCreate';
import StaffFinanceStudentFeesEdit from './pages/staff/finance/StudentFeesEdit';
import StaffFinanceStudentFeesView from './pages/staff/finance/StudentFeesView';
import StaffFinanceFeePaymentsCreate from './pages/staff/finance/FeePaymentsCreate';
import StaffFinanceFeePaymentsEdit from './pages/staff/finance/FeePaymentsEdit';
import StaffFinanceFeePaymentsView from './pages/staff/finance/FeePaymentsView';
import StaffFinanceExpensesCreate from './pages/staff/finance/ExpensesCreate';
import StaffFinanceExpensesEdit from './pages/staff/finance/ExpensesEdit';
import StaffFinanceExpensesView from './pages/staff/finance/ExpensesView';
import StaffFinanceReportsCreate from './pages/staff/finance/FinancialReportsCreate';
import StaffFinanceReportsEdit from './pages/staff/finance/FinancialReportsEdit';
import StaffFinanceReportsView from './pages/staff/finance/FinancialReportsView';
import StaffPayrollIndex from './pages/staff/payroll/Payroll';
import StaffPayrollSalaryStructures from './pages/staff/payroll/SalaryStructures';
import StaffPayrollSalaryPayments from './pages/staff/payroll/SalaryPayments';
import StaffPayrollSalaryDeductions from './pages/staff/payroll/SalaryDeductions';
import StaffPayrollSalaryAdvances from './pages/staff/payroll/SalaryAdvances';
import StaffPayrollSalaryStructuresCreate from './pages/staff/payroll/SalaryStructuresCreate';
import StaffPayrollSalaryStructuresEdit from './pages/staff/payroll/SalaryStructuresEdit';
import StaffPayrollSalaryStructuresView from './pages/staff/payroll/SalaryStructuresView';
import StaffPayrollSalaryPaymentsCreate from './pages/staff/payroll/SalaryPaymentsCreate';
import StaffPayrollSalaryPaymentsEdit from './pages/staff/payroll/SalaryPaymentsEdit';
import StaffPayrollSalaryPaymentsView from './pages/staff/payroll/SalaryPaymentsView';
import StaffPayrollSalaryDeductionsCreate from './pages/staff/payroll/SalaryDeductionsCreate';
import StaffPayrollSalaryDeductionsEdit from './pages/staff/payroll/SalaryDeductionsEdit';
import StaffPayrollSalaryDeductionsView from './pages/staff/payroll/SalaryDeductionsView';
import StaffPayrollSalaryAdvancesCreate from './pages/staff/payroll/SalaryAdvancesCreate';
import StaffPayrollSalaryAdvancesEdit from './pages/staff/payroll/SalaryAdvancesEdit';
import StaffPayrollSalaryAdvancesView from './pages/staff/payroll/SalaryAdvancesView';

import Employees from './pages/staff/HR/Employees';
import DepartmentRegistration from './pages/staff/HR/DepartmentRegistration';
import DesignationRegistration from './pages/staff/HR/DesignationRegistration';
import LeaveTypeRegistration from './pages/staff/HR/LeaveTypeRegistration';
import EmployeeRegistration from './pages/staff/HR/EmployeeRegistration';
import HRAttendance from './pages/staff/HR/Attendance';
import LeaveManagement from './pages/staff/HR/LeaveManagment';
import HRPayroll from './pages/staff/HR/Payroll';
import HRReports from './pages/staff/HR/Reports';
import Inventory from './pages/staff/Kitchen/Inventory';
import MealPlaning from './pages/staff/Kitchen/MealPlaning';
import DailyPlaning from './pages/staff/Kitchen/DailyPlaning';
import FoodRequest from './pages/staff/Kitchen/FoodRequest';
import KitchenReports from './pages/staff/Kitchen/Reports';
import WeeklyMenuPage from './pages/staff/Kitchen/WeeklyMenu';
import Suppliers from './pages/staff/Kitchen/Suppliers';
import WasteTracking from './pages/staff/Kitchen/WasteTracking';

function App() {
  console.log('App component rendering...');
  console.log('Current path:', window.location.pathname);
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
          </Route>

          {/* ================= STAFF ================= */}
          <Route path="/staff/*" element={<StaffPanel />}>
            <Route index element={<StaffDashboard />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="users" element={<UserIndex />} />
            <Route path="users/register" element={<UserRegister />} />
            <Route path="users/edit/:id" element={<UserEdit />} />
            <Route path="registrar/admissions" element={<StudentAdmissions />} />
            <Route path="registrar/students" element={<StudentsList />} />
            <Route path="registrar/profiles" element={<StudentProfiles />} />
            <Route path="registrar/class-assignment" element={<ClassAssignment />} />
            <Route path="registrar/data-correction" element={<DataCorrection />} />
            <Route path="registrar/guardians" element={<GuardianManagement />} />
            <Route path="registrar/education-history" element={<EducationHistory />} />
            <Route path="registrar/documents" element={<DocumentsManagement />} />
            <Route path="registrar/reports" element={<RegistrarReports />} />
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
            <Route path="finance" element={<StaffFinanceIndex />} />
            <Route path="finance/transactions" element={<StaffFinanceTransactions />} />
            <Route path="finance/transactions/create" element={<StaffFinanceTransactionsCreate />} />
            <Route path="finance/transactions/edit/:id" element={<StaffFinanceTransactionsEdit />} />
            <Route path="finance/transactions/view/:id" element={<StaffFinanceTransactionsView />} />
            <Route path="finance/accounts" element={<StaffFinanceAccounts />} />
            <Route path="finance/accounts/create" element={<StaffFinanceAccountsCreate />} />
            <Route path="finance/accounts/edit/:id" element={<StaffFinanceAccountsEdit />} />
            <Route path="finance/accounts/view/:id" element={<StaffFinanceAccountsView />} />
            <Route path="finance/fee-structures" element={<StaffFinanceFeeStructures />} />
            <Route path="finance/fee-structures/create" element={<StaffFinanceFeeStructuresCreate />} />
            <Route path="finance/fee-structures/edit/:id" element={<StaffFinanceFeeStructuresEdit />} />
            <Route path="finance/fee-structures/view/:id" element={<StaffFinanceFeeStructuresView />} />
            <Route path="finance/student-fees" element={<StaffFinanceStudentFees />} />
            <Route path="finance/student-fees/create" element={<StaffFinanceStudentFeesCreate />} />
            <Route path="finance/student-fees/edit/:id" element={<StaffFinanceStudentFeesEdit />} />
            <Route path="finance/student-fees/view/:id" element={<StaffFinanceStudentFeesView />} />
            <Route path="finance/fee-payments" element={<StaffFinanceFeePayments />} />
            <Route path="finance/fee-payments/create" element={<StaffFinanceFeePaymentsCreate />} />
            <Route path="finance/fee-payments/edit/:id" element={<StaffFinanceFeePaymentsEdit />} />
            <Route path="finance/fee-payments/view/:id" element={<StaffFinanceFeePaymentsView />} />
            <Route path="finance/expenses" element={<StaffFinanceExpenses />} />
            <Route path="finance/expenses/create" element={<StaffFinanceExpensesCreate />} />
            <Route path="finance/expenses/edit/:id" element={<StaffFinanceExpensesEdit />} />
            <Route path="finance/expenses/view/:id" element={<StaffFinanceExpensesView />} />
            <Route path="finance/reports" element={<StaffFinanceReports />} />
            <Route path="finance/reports/create" element={<StaffFinanceReportsCreate />} />
            <Route path="finance/reports/edit/:id" element={<StaffFinanceReportsEdit />} />
            <Route path="finance/reports/view/:id" element={<StaffFinanceReportsView />} />
            <Route path="payroll" element={<StaffPayrollIndex />} />
            <Route path="payroll/salary-structures" element={<StaffPayrollSalaryStructures />} />
            <Route path="payroll/salary-structures/create" element={<StaffPayrollSalaryStructuresCreate />} />
            <Route path="payroll/salary-structures/edit/:id" element={<StaffPayrollSalaryStructuresEdit />} />
            <Route path="payroll/salary-structures/view/:id" element={<StaffPayrollSalaryStructuresView />} />
            <Route path="payroll/salary-payments" element={<StaffPayrollSalaryPayments />} />
            <Route path="payroll/salary-payments/create" element={<StaffPayrollSalaryPaymentsCreate />} />
            <Route path="payroll/salary-payments/edit/:id" element={<StaffPayrollSalaryPaymentsEdit />} />
            <Route path="payroll/salary-payments/view/:id" element={<StaffPayrollSalaryPaymentsView />} />
            <Route path="payroll/salary-deductions" element={<StaffPayrollSalaryDeductions />} />
            <Route path="payroll/salary-deductions/create" element={<StaffPayrollSalaryDeductionsCreate />} />
            <Route path="payroll/salary-deductions/edit/:id" element={<StaffPayrollSalaryDeductionsEdit />} />
            <Route path="payroll/salary-deductions/view/:id" element={<StaffPayrollSalaryDeductionsView />} />
            <Route path="payroll/salary-advances" element={<StaffPayrollSalaryAdvances />} />
            <Route path="payroll/salary-advances/create" element={<StaffPayrollSalaryAdvancesCreate />} />
            <Route path="payroll/salary-advances/edit/:id" element={<StaffPayrollSalaryAdvancesEdit />} />
            <Route path="payroll/salary-advances/view/:id" element={<StaffPayrollSalaryAdvancesView />} />

            <Route path="hr/employees" element={<Employees />} />
            <Route path="hr/departments" element={<DepartmentRegistration />} />
            <Route path="hr/designations" element={<DesignationRegistration />} />
            <Route path="hr/leave-types" element={<LeaveTypeRegistration />} />
            <Route path="hr/employee-registration" element={<EmployeeRegistration />} />
            <Route path="hr/attendance" element={<HRAttendance />} />
            <Route path="hr/leave" element={<LeaveManagement />} />
            <Route path="hr/payroll" element={<HRPayroll />} />
            <Route path="hr/reports" element={<HRReports />} />

            <Route path="kitchen/inventory" element={<Inventory />} />
            <Route path="kitchen/meals" element={<MealPlaning />} />
            <Route path="kitchen/menu" element={<DailyPlaning />} />
            <Route path="kitchen/weekly-menu" element={<WeeklyMenuPage />} />
            <Route path="kitchen/suppliers" element={<Suppliers />} />
            <Route path="kitchen/waste" element={<WasteTracking />} />
            <Route path="kitchen/requests" element={<FoodRequest />} />
            <Route path="kitchen/reports" element={<KitchenReports />} />
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



