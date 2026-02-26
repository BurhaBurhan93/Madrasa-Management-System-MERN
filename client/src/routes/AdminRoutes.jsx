import React from 'react';
import { Route } from 'react-router-dom';
import AdminPanel from '../panels/AdminPanel';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AdminRoutes = () => (
  <Route path="/admin/*" element={<AdminPanel />}>
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    
    {/* User Management Routes */}
    <Route path="users">
      <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">All Users</h1><p className="text-gray-600 mt-2">User management page coming soon...</p></div>} />
      <Route path="students" element={<div className="p-6"><h1 className="text-2xl font-bold">Students</h1><p className="text-gray-600 mt-2">Student management page coming soon...</p></div>} />
      <Route path="teachers" element={<div className="p-6"><h1 className="text-2xl font-bold">Teachers</h1><p className="text-gray-600 mt-2">Teacher management page coming soon...</p></div>} />
      <Route path="staff" element={<div className="p-6"><h1 className="text-2xl font-bold">Staff</h1><p className="text-gray-600 mt-2">Staff management page coming soon...</p></div>} />
    </Route>

    {/* Academic Routes */}
    <Route path="academic">
      <Route path="classes" element={<div className="p-6"><h1 className="text-2xl font-bold">Classes</h1><p className="text-gray-600 mt-2">Class management page coming soon...</p></div>} />
      <Route path="subjects" element={<div className="p-6"><h1 className="text-2xl font-bold">Subjects</h1><p className="text-gray-600 mt-2">Subject management page coming soon...</p></div>} />
      <Route path="exams" element={<div className="p-6"><h1 className="text-2xl font-bold">Exams</h1><p className="text-gray-600 mt-2">Exam management page coming soon...</p></div>} />
      <Route path="timetable" element={<div className="p-6"><h1 className="text-2xl font-bold">Timetable</h1><p className="text-gray-600 mt-2">Timetable management page coming soon...</p></div>} />
    </Route>

    {/* Attendance Routes */}
    <Route path="attendance">
      <Route path="daily" element={<div className="p-6"><h1 className="text-2xl font-bold">Daily Attendance</h1><p className="text-gray-600 mt-2">Daily attendance page coming soon...</p></div>} />
      <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Reports</h1><p className="text-gray-600 mt-2">Attendance reports page coming soon...</p></div>} />
      <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Settings</h1><p className="text-gray-600 mt-2">Attendance settings page coming soon...</p></div>} />
    </Route>

    {/* Finance Routes */}
    <Route path="finance">
      <Route path="fee-structure" element={<div className="p-6"><h1 className="text-2xl font-bold">Fee Structure</h1><p className="text-gray-600 mt-2">Fee structure page coming soon...</p></div>} />
      <Route path="payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments</h1><p className="text-gray-600 mt-2">Payments page coming soon...</p></div>} />
      <Route path="expenses" element={<div className="p-6"><h1 className="text-2xl font-bold">Expenses</h1><p className="text-gray-600 mt-2">Expenses page coming soon...</p></div>} />
      <Route path="salaries" element={<div className="p-6"><h1 className="text-2xl font-bold">Salaries</h1><p className="text-gray-600 mt-2">Salaries page coming soon...</p></div>} />
      <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Financial Reports</h1><p className="text-gray-600 mt-2">Financial reports page coming soon...</p></div>} />
    </Route>

    {/* Library Routes */}
    <Route path="library">
      <Route path="books" element={<div className="p-6"><h1 className="text-2xl font-bold">Books</h1><p className="text-gray-600 mt-2">Books management page coming soon...</p></div>} />
      <Route path="categories" element={<div className="p-6"><h1 className="text-2xl font-bold">Categories</h1><p className="text-gray-600 mt-2">Categories page coming soon...</p></div>} />
      <Route path="borrowed" element={<div className="p-6"><h1 className="text-2xl font-bold">Borrowed Books</h1><p className="text-gray-600 mt-2">Borrowed books page coming soon...</p></div>} />
      <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Library Reports</h1><p className="text-gray-600 mt-2">Library reports page coming soon...</p></div>} />
    </Route>

    {/* Complaints Routes */}
    <Route path="complaints">
      <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">All Complaints</h1><p className="text-gray-600 mt-2">All complaints page coming soon...</p></div>} />
      <Route path="pending" element={<div className="p-6"><h1 className="text-2xl font-bold">Pending Complaints</h1><p className="text-gray-600 mt-2">Pending complaints page coming soon...</p></div>} />
      <Route path="resolved" element={<div className="p-6"><h1 className="text-2xl font-bold">Resolved Complaints</h1><p className="text-gray-600 mt-2">Resolved complaints page coming soon...</p></div>} />
    </Route>

    {/* Reports Routes */}
    <Route path="reports">
      <Route path="academic" element={<div className="p-6"><h1 className="text-2xl font-bold">Academic Reports</h1><p className="text-gray-600 mt-2">Academic reports page coming soon...</p></div>} />
      <Route path="financial" element={<div className="p-6"><h1 className="text-2xl font-bold">Financial Reports</h1><p className="text-gray-600 mt-2">Financial reports page coming soon...</p></div>} />
      <Route path="attendance" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance Reports</h1><p className="text-gray-600 mt-2">Attendance reports page coming soon...</p></div>} />
    </Route>

    {/* Settings Routes */}
    <Route path="settings">
      <Route path="general" element={<div className="p-6"><h1 className="text-2xl font-bold">General Settings</h1><p className="text-gray-600 mt-2">General settings page coming soon...</p></div>} />
      <Route path="academic" element={<div className="p-6"><h1 className="text-2xl font-bold">Academic Settings</h1><p className="text-gray-600 mt-2">Academic settings page coming soon...</p></div>} />
      <Route path="notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gray-600 mt-2">Notifications settings page coming soon...</p></div>} />
    </Route>

    {/* Profile Route */}
    <Route path="profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Admin Profile</h1><p className="text-gray-600 mt-2">Profile page coming soon...</p></div>} />
  </Route>
);

export default AdminRoutes;
