import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PrintPage from '../components/PrintPage';

// Lazy load all admin page components for code-splitting and skeleton loading
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserIndex = lazy(() => import('../pages/admin/users/UserIndex'));
const UserRegister = lazy(() => import('../pages/admin/users/UserRegister'));
const UserEdit = lazy(() => import('../pages/admin/users/UserEdit'));
const AdminClasses = lazy(() => import('../pages/admin/academic/AdminClasses'));
const AdminSubjects = lazy(() => import('../pages/admin/academic/AdminSubjects'));
const AdminExams = lazy(() => import('../pages/admin/academic/AdminExams'));
const AdminTimetable = lazy(() => import('../pages/admin/academic/AdminTimetable'));
const AdminDegrees = lazy(() => import('../pages/admin/academic/AdminDegrees'));
const AdminSyllabus = lazy(() => import('../pages/admin/academic/AdminSyllabus'));
const AdminGrading = lazy(() => import('../pages/admin/academic/AdminGrading'));
const AdminAttendanceDaily = lazy(() => import('../pages/admin/attendance/AdminAttendanceDaily'));
const AdminAttendanceReports = lazy(() => import('../pages/admin/attendance/AdminAttendanceReports'));
const AdminAttendanceSettings = lazy(() => import('../pages/admin/attendance/AdminAttendanceSettings'));
const AdminAttendanceWarnings = lazy(() => import('../pages/admin/attendance/AdminAttendanceWarnings'));
const AdminAttendanceCorrections = lazy(() => import('../pages/admin/attendance/AdminAttendanceCorrections'));
const AdminFeeStructure = lazy(() => import('../pages/admin/finance/AdminFeeStructure'));
const AdminPayments = lazy(() => import('../pages/admin/finance/AdminPayments'));
const AdminExpenses = lazy(() => import('../pages/admin/finance/AdminExpenses'));
const AdminSalaries = lazy(() => import('../pages/admin/finance/AdminSalaries'));
const AdminAccounts = lazy(() => import('../pages/admin/finance/AdminAccounts'));
const AdminTransactions = lazy(() => import('../pages/admin/finance/AdminTransactions'));
const AdminFinanceReports = lazy(() => import('../pages/admin/finance/AdminFinanceReports'));
const AdminLibraryBooks = lazy(() => import('../pages/admin/library/AdminLibraryBooks'));
const AdminLibraryCategories = lazy(() => import('../pages/admin/library/AdminLibraryCategories'));
const AdminBorrowedBooks = lazy(() => import('../pages/admin/library/AdminBorrowedBooks'));
const AdminPurchases = lazy(() => import('../pages/admin/library/AdminPurchases'));
const AdminSales = lazy(() => import('../pages/admin/library/AdminSales'));
const AdminLibraryReports = lazy(() => import('../pages/admin/library/AdminLibraryReports'));
const AdminComplaints = lazy(() => import('../pages/admin/complaints/AdminComplaints'));
const AdminComplaintsPending = lazy(() => import('../pages/admin/complaints/AdminComplaintsPending'));
const AdminComplaintsResolved = lazy(() => import('../pages/admin/complaints/AdminComplaintsResolved'));
const AdminComplaintActions = lazy(() => import('../pages/admin/complaints/AdminComplaintActions'));
const AdminComplaintFeedback = lazy(() => import('../pages/admin/complaints/AdminComplaintFeedback'));
const AdminComplaintReports = lazy(() => import('../pages/admin/complaints/AdminComplaintReports'));
const AdminGeneralSettings = lazy(() => import('../pages/admin/settings/AdminGeneralSettings'));
const AdminAcademicSettings = lazy(() => import('../pages/admin/settings/AdminAcademicSettings'));
const AdminNotificationsSettings = lazy(() => import('../pages/admin/settings/AdminNotificationsSettings'));
const AdminSecuritySettings = lazy(() => import('../pages/admin/settings/AdminSecuritySettings'));
const AdminBackupSettings = lazy(() => import('../pages/admin/settings/AdminBackupSettings'));
const AdminAPISettings = lazy(() => import('../pages/admin/settings/AdminAPISettings'));
const AdminKitchenInventory = lazy(() => import('../pages/admin/kitchen/AdminKitchenInventory'));
const AdminKitchenMeals = lazy(() => import('../pages/admin/kitchen/AdminKitchenMeals'));
const AdminKitchenMenu = lazy(() => import('../pages/admin/kitchen/AdminKitchenMenu'));
const AdminKitchenSuppliers = lazy(() => import('../pages/admin/kitchen/AdminKitchenSuppliers'));
const AdminKitchenWaste = lazy(() => import('../pages/admin/kitchen/AdminKitchenWaste'));
const AdminKitchenReports = lazy(() => import('../pages/admin/kitchen/AdminKitchenReports'));
const AdminHREmployees = lazy(() => import('../pages/admin/hr/AdminHREmployees'));
const AdminHRDepartments = lazy(() => import('../pages/admin/hr/AdminHRDepartments'));
const AdminHRDesignations = lazy(() => import('../pages/admin/hr/AdminHRDesignations'));
const AdminHRAttendance = lazy(() => import('../pages/admin/hr/AdminHRAttendance'));
const AdminHRLeave = lazy(() => import('../pages/admin/hr/AdminHRLeave'));
const AdminHRPayroll = lazy(() => import('../pages/admin/hr/AdminHRPayroll'));
const AdminHRReports = lazy(() => import('../pages/admin/hr/AdminHRReports'));
const AdminHostelRooms = lazy(() => import('../pages/admin/hostel/AdminHostelRooms'));
const AdminHostelAllocations = lazy(() => import('../pages/admin/hostel/AdminHostelAllocations'));
const AdminHostelMeals = lazy(() => import('../pages/admin/hostel/AdminHostelMeals'));
const AdminHostelAttendance = lazy(() => import('../pages/admin/hostel/AdminHostelAttendance'));
const AdminHostelReports = lazy(() => import('../pages/admin/hostel/AdminHostelReports'));
const AdminProfile = lazy(() => import('../pages/admin/AdminProfile'));
const AdminMadrasaInfo = lazy(() => import('../pages/admin/AdminMadrasaInfo'));
const Students = lazy(() => import('../pages/admin/users/Students'));
const Teachers = lazy(() => import('../pages/admin/users/Teachers'));
const Staff = lazy(() => import('../pages/admin/users/Staff'));
const RolesPermissions = lazy(() => import('../pages/admin/users/RolesPermissions'));
const AuditLogs = lazy(() => import('../pages/admin/users/AuditLogs'));
const AdminAcademicReports = lazy(() => import('../pages/admin/reports/AdminAcademicReports'));
const AdminFinancialReports = lazy(() => import('../pages/admin/reports/AdminFinancialReports'));
const AdminAttendanceReportsPage = lazy(() => import('../pages/admin/reports/AdminAttendanceReportsPage'));
const AdminOperationalReports = lazy(() => import('../pages/admin/reports/AdminOperationalReports'));
const AdminAnalyticsDashboard = lazy(() => import('../pages/admin/reports/AdminAnalyticsDashboard'));

const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />

    <Route path="users" element={<UserIndex />} />
    <Route path="users/register" element={<UserRegister />} />
    <Route path="users/edit/:id" element={<UserEdit />} />
    <Route path="users/students" element={<Students />} />
    <Route path="users/teachers" element={<Teachers />} />
    <Route path="users/staff" element={<Staff />} />
    <Route path="users/roles" element={<RolesPermissions />} />
    <Route path="users/audit" element={<AuditLogs />} />

    <Route path="academic/classes" element={<AdminClasses />} />
    <Route path="academic/subjects" element={<AdminSubjects />} />
    <Route path="academic/exams" element={<AdminExams />} />
    <Route path="academic/timetable" element={<AdminTimetable />} />
    <Route path="academic/degrees" element={<AdminDegrees />} />
    <Route path="academic/syllabus" element={<AdminSyllabus />} />
    <Route path="academic/grading" element={<AdminGrading />} />

    <Route path="attendance/daily" element={<AdminAttendanceDaily />} />
    <Route path="attendance/reports" element={<AdminAttendanceReports />} />
    <Route path="attendance/settings" element={<AdminAttendanceSettings />} />
    <Route path="attendance/warnings" element={<AdminAttendanceWarnings />} />
    <Route path="attendance/corrections" element={<AdminAttendanceCorrections />} />

    <Route path="finance/fee-structure" element={<AdminFeeStructure />} />
    <Route path="finance/payments" element={<AdminPayments />} />
    <Route path="finance/expenses" element={<AdminExpenses />} />
    <Route path="finance/salaries" element={<AdminSalaries />} />
    <Route path="finance/accounts" element={<AdminAccounts />} />
    <Route path="finance/transactions" element={<AdminTransactions />} />
    <Route path="finance/reports" element={<AdminFinanceReports />} />

    <Route path="library/books" element={<AdminLibraryBooks />} />
    <Route path="library/categories" element={<AdminLibraryCategories />} />
    <Route path="library/borrowed" element={<AdminBorrowedBooks />} />
    <Route path="library/purchases" element={<AdminPurchases />} />
    <Route path="library/sales" element={<AdminSales />} />
    <Route path="library/reports" element={<AdminLibraryReports />} />

    <Route path="complaints" element={<AdminComplaints />} />
    <Route path="complaints/pending" element={<AdminComplaintsPending />} />
    <Route path="complaints/resolved" element={<AdminComplaintsResolved />} />
    <Route path="complaints/actions" element={<AdminComplaintActions />} />
    <Route path="complaints/feedback" element={<AdminComplaintFeedback />} />
    <Route path="complaints/reports" element={<AdminComplaintReports />} />

    <Route path="hostel/rooms" element={<AdminHostelRooms />} />
    <Route path="hostel/allocations" element={<AdminHostelAllocations />} />
    <Route path="hostel/meals" element={<AdminHostelMeals />} />
    <Route path="hostel/attendance" element={<AdminHostelAttendance />} />
    <Route path="hostel/reports" element={<AdminHostelReports />} />

    <Route path="hr/departments" element={<AdminHRDepartments />} />
    <Route path="hr/designations" element={<AdminHRDesignations />} />
    <Route path="hr/employees" element={<AdminHREmployees />} />
    <Route path="hr/attendance" element={<AdminHRAttendance />} />
    <Route path="hr/leave" element={<AdminHRLeave />} />
    <Route path="hr/payroll" element={<AdminHRPayroll />} />
    <Route path="hr/reports" element={<AdminHRReports />} />

    <Route path="kitchen/inventory" element={<AdminKitchenInventory />} />
    <Route path="kitchen/meals" element={<AdminKitchenMeals />} />
    <Route path="kitchen/menu" element={<AdminKitchenMenu />} />
    <Route path="kitchen/suppliers" element={<AdminKitchenSuppliers />} />
    <Route path="kitchen/waste" element={<AdminKitchenWaste />} />
    <Route path="kitchen/reports" element={<AdminKitchenReports />} />

    <Route path="reports/academic" element={<AdminAcademicReports />} />
    <Route path="reports/financial" element={<AdminFinancialReports />} />
    <Route path="reports/attendance" element={<AdminAttendanceReportsPage />} />
    <Route path="reports/operational" element={<AdminOperationalReports />} />
    <Route path="reports/analytics" element={<AdminAnalyticsDashboard />} />

    <Route path="settings/general" element={<AdminGeneralSettings />} />
    <Route path="settings/academic" element={<AdminAcademicSettings />} />
    <Route path="settings/notifications" element={<AdminNotificationsSettings />} />
    <Route path="settings/security" element={<AdminSecuritySettings />} />
    <Route path="settings/backup" element={<AdminBackupSettings />} />
    <Route path="settings/api" element={<AdminAPISettings />} />

    <Route path="profile" element={<AdminProfile />} />
    <Route path="madrasa-info" element={<AdminMadrasaInfo />} />
    <Route path="print/:type/:id?" element={<PrintPage />} />
  </>
);

export default adminRoutes;
