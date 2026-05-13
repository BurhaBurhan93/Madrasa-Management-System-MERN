import React from 'react';
import { Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserIndex from '../pages/admin/users/UserIndex';
import UserRegister from '../pages/admin/users/UserRegister';
import UserEdit from '../pages/admin/users/UserEdit';
import AdminClasses from '../pages/admin/academic/AdminClasses';
import AdminSubjects from '../pages/admin/academic/AdminSubjects';
import AdminExams from '../pages/admin/academic/AdminExams';
import AdminAttendanceDaily from '../pages/admin/attendance/AdminAttendanceDaily';
import AdminFeeStructure from '../pages/admin/finance/AdminFeeStructure';
import AdminPayments from '../pages/admin/finance/AdminPayments';
import AdminLibraryBooks from '../pages/admin/library/AdminLibraryBooks';
import AdminGeneralSettings from '../pages/admin/settings/AdminGeneralSettings';
import AdminHREmployees from '../pages/admin/hr/AdminHREmployees';
import AdminProfile from '../pages/admin/AdminProfile';
import Students from '../pages/admin/users/Students';
import Teachers from '../pages/admin/users/Teachers';
import Staff from '../pages/admin/users/Staff';
import RolesPermissions from '../pages/admin/users/RolesPermissions';
import AuditLogs from '../pages/admin/users/AuditLogs';

const ComingSoon = ({ title }) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
    <div className="text-4xl">Under Construction</div>
    <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
    <p className="text-sm">This page is coming soon.</p>
  </div>
);

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
    <Route path="academic/timetable" element={<ComingSoon title="Timetable" />} />
    <Route path="academic/degrees" element={<ComingSoon title="Degrees" />} />
    <Route path="academic/syllabus" element={<ComingSoon title="Syllabus" />} />
    <Route path="academic/grading" element={<ComingSoon title="Grading System" />} />

    <Route path="attendance/daily" element={<AdminAttendanceDaily />} />
    <Route path="attendance/reports" element={<ComingSoon title="Attendance Reports" />} />
    <Route path="attendance/settings" element={<ComingSoon title="Attendance Settings" />} />
    <Route path="attendance/warnings" element={<ComingSoon title="Attendance Warnings" />} />
    <Route path="attendance/corrections" element={<ComingSoon title="Attendance Corrections" />} />

    <Route path="finance/fee-structure" element={<AdminFeeStructure />} />
    <Route path="finance/payments" element={<AdminPayments />} />
    <Route path="finance/expenses" element={<ComingSoon title="Expenses" />} />
    <Route path="finance/salaries" element={<ComingSoon title="Salaries" />} />
    <Route path="finance/accounts" element={<ComingSoon title="Accounts" />} />
    <Route path="finance/transactions" element={<ComingSoon title="Transactions" />} />
    <Route path="finance/reports" element={<ComingSoon title="Financial Reports" />} />

    <Route path="library/books" element={<AdminLibraryBooks />} />
    <Route path="library/categories" element={<ComingSoon title="Categories" />} />
    <Route path="library/borrowed" element={<ComingSoon title="Borrowed Books" />} />
    <Route path="library/purchases" element={<ComingSoon title="Purchases" />} />
    <Route path="library/sales" element={<ComingSoon title="Sales" />} />
    <Route path="library/reports" element={<ComingSoon title="Library Reports" />} />

    <Route path="complaints" element={<ComingSoon title="All Complaints" />} />
    <Route path="complaints/pending" element={<ComingSoon title="Pending Complaints" />} />
    <Route path="complaints/resolved" element={<ComingSoon title="Resolved Complaints" />} />
    <Route path="complaints/actions" element={<ComingSoon title="Complaint Actions" />} />
    <Route path="complaints/feedback" element={<ComingSoon title="Complaint Feedback" />} />
    <Route path="complaints/reports" element={<ComingSoon title="Complaint Reports" />} />

    <Route path="hostel/rooms" element={<ComingSoon title="Hostel Rooms" />} />
    <Route path="hostel/allocations" element={<ComingSoon title="Room Allocations" />} />
    <Route path="hostel/meals" element={<ComingSoon title="Meal Management" />} />
    <Route path="hostel/attendance" element={<ComingSoon title="Meal Attendance" />} />
    <Route path="hostel/reports" element={<ComingSoon title="Hostel Reports" />} />

    <Route path="hr/departments" element={<ComingSoon title="Departments" />} />
    <Route path="hr/designations" element={<ComingSoon title="Designations" />} />
    <Route path="hr/employees" element={<AdminHREmployees />} />
    <Route path="hr/attendance" element={<ComingSoon title="Employee Attendance" />} />
    <Route path="hr/leave" element={<ComingSoon title="Leave Management" />} />
    <Route path="hr/payroll" element={<ComingSoon title="Payroll" />} />
    <Route path="hr/reports" element={<ComingSoon title="HR Reports" />} />

    <Route path="kitchen/inventory" element={<ComingSoon title="Kitchen Inventory" />} />
    <Route path="kitchen/meals" element={<ComingSoon title="Meal Planning" />} />
    <Route path="kitchen/menu" element={<ComingSoon title="Weekly Menu" />} />
    <Route path="kitchen/suppliers" element={<ComingSoon title="Suppliers" />} />
    <Route path="kitchen/waste" element={<ComingSoon title="Waste Tracking" />} />
    <Route path="kitchen/reports" element={<ComingSoon title="Kitchen Reports" />} />

    <Route path="reports/academic" element={<ComingSoon title="Academic Reports" />} />
    <Route path="reports/financial" element={<ComingSoon title="Financial Reports" />} />
    <Route path="reports/attendance" element={<ComingSoon title="Attendance Reports" />} />
    <Route path="reports/operational" element={<ComingSoon title="Operational Reports" />} />
    <Route path="reports/analytics" element={<ComingSoon title="Analytics Dashboard" />} />

    <Route path="settings/general" element={<AdminGeneralSettings />} />
    <Route path="settings/academic" element={<ComingSoon title="Academic Settings" />} />
    <Route path="settings/notifications" element={<ComingSoon title="Notifications" />} />
    <Route path="settings/security" element={<ComingSoon title="Security" />} />
    <Route path="settings/backup" element={<ComingSoon title="Backup & Restore" />} />
    <Route path="settings/api" element={<ComingSoon title="API Management" />} />

    <Route path="profile" element={<AdminProfile />} />
  </>
);

export default adminRoutes;
