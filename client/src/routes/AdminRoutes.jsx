import React from 'react';
import { Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserIndex from '../pages/admin/users/UserIndex';
import UserRegister from '../pages/admin/users/UserRegister';
import UserEdit from '../pages/admin/users/UserEdit';
import AdminClasses from '../pages/admin/academic/AdminClasses';
import AdminSubjects from '../pages/admin/academic/AdminSubjects';
import AdminExams from '../pages/admin/academic/AdminExams';
import AdminTimetable from '../pages/admin/academic/AdminTimetable';
import AdminDegrees from '../pages/admin/academic/AdminDegrees';
import AdminSyllabus from '../pages/admin/academic/AdminSyllabus';
import AdminGrading from '../pages/admin/academic/AdminGrading';
import AdminAttendanceDaily from '../pages/admin/attendance/AdminAttendanceDaily';
import AdminAttendanceReports from '../pages/admin/attendance/AdminAttendanceReports';
import AdminAttendanceSettings from '../pages/admin/attendance/AdminAttendanceSettings';
import AdminAttendanceWarnings from '../pages/admin/attendance/AdminAttendanceWarnings';
import AdminAttendanceCorrections from '../pages/admin/attendance/AdminAttendanceCorrections';
import AdminFeeStructure from '../pages/admin/finance/AdminFeeStructure';
import AdminPayments from '../pages/admin/finance/AdminPayments';
import AdminExpenses from '../pages/admin/finance/AdminExpenses';
import AdminSalaries from '../pages/admin/finance/AdminSalaries';
import AdminAccounts from '../pages/admin/finance/AdminAccounts';
import AdminTransactions from '../pages/admin/finance/AdminTransactions';
import AdminFinanceReports from '../pages/admin/finance/AdminFinanceReports';
import AdminLibraryBooks from '../pages/admin/library/AdminLibraryBooks';
import AdminLibraryCategories from '../pages/admin/library/AdminLibraryCategories';
import AdminBorrowedBooks from '../pages/admin/library/AdminBorrowedBooks';
import AdminPurchases from '../pages/admin/library/AdminPurchases';
import AdminSales from '../pages/admin/library/AdminSales';
import AdminLibraryReports from '../pages/admin/library/AdminLibraryReports';
import AdminComplaints from '../pages/admin/complaints/AdminComplaints';
import AdminComplaintsPending from '../pages/admin/complaints/AdminComplaintsPending';
import AdminComplaintsResolved from '../pages/admin/complaints/AdminComplaintsResolved';
import AdminComplaintActions from '../pages/admin/complaints/AdminComplaintActions';
import AdminComplaintFeedback from '../pages/admin/complaints/AdminComplaintFeedback';
import AdminComplaintReports from '../pages/admin/complaints/AdminComplaintReports';
import AdminGeneralSettings from '../pages/admin/settings/AdminGeneralSettings';
import AdminAcademicSettings from '../pages/admin/settings/AdminAcademicSettings';
import AdminNotificationsSettings from '../pages/admin/settings/AdminNotificationsSettings';
import AdminSecuritySettings from '../pages/admin/settings/AdminSecuritySettings';
import AdminBackupSettings from '../pages/admin/settings/AdminBackupSettings';
import AdminAPISettings from '../pages/admin/settings/AdminAPISettings';
import AdminKitchenInventory from '../pages/admin/kitchen/AdminKitchenInventory';
import AdminKitchenMeals from '../pages/admin/kitchen/AdminKitchenMeals';
import AdminKitchenMenu from '../pages/admin/kitchen/AdminKitchenMenu';
import AdminKitchenSuppliers from '../pages/admin/kitchen/AdminKitchenSuppliers';
import AdminKitchenWaste from '../pages/admin/kitchen/AdminKitchenWaste';
import AdminKitchenReports from '../pages/admin/kitchen/AdminKitchenReports';
import AdminHREmployees from '../pages/admin/hr/AdminHREmployees';
import AdminHRDepartments from '../pages/admin/hr/AdminHRDepartments';
import AdminHRDesignations from '../pages/admin/hr/AdminHRDesignations';
import AdminHRAttendance from '../pages/admin/hr/AdminHRAttendance';
import AdminHRLeave from '../pages/admin/hr/AdminHRLeave';
import AdminHRPayroll from '../pages/admin/hr/AdminHRPayroll';
import AdminHRReports from '../pages/admin/hr/AdminHRReports';
import AdminHostelRooms from '../pages/admin/hostel/AdminHostelRooms';
import AdminHostelAllocations from '../pages/admin/hostel/AdminHostelAllocations';
import AdminHostelMeals from '../pages/admin/hostel/AdminHostelMeals';
import AdminHostelAttendance from '../pages/admin/hostel/AdminHostelAttendance';
import AdminHostelReports from '../pages/admin/hostel/AdminHostelReports';
import AdminProfile from '../pages/admin/AdminProfile';
import Students from '../pages/admin/users/Students';
import Teachers from '../pages/admin/users/Teachers';
import Staff from '../pages/admin/users/Staff';
import RolesPermissions from '../pages/admin/users/RolesPermissions';
import AuditLogs from '../pages/admin/users/AuditLogs';
import AdminAcademicReports from '../pages/admin/reports/AdminAcademicReports';
import AdminFinancialReports from '../pages/admin/reports/AdminFinancialReports';
import AdminAttendanceReportsPage from '../pages/admin/reports/AdminAttendanceReportsPage';
import AdminOperationalReports from '../pages/admin/reports/AdminOperationalReports';
import AdminAnalyticsDashboard from '../pages/admin/reports/AdminAnalyticsDashboard';

// Simple placeholder components exist in their respective folders

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
  </>
);

export default adminRoutes;
