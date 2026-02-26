import React from 'react';
import { Route } from 'react-router-dom';
import StudentPanel from '../panels/StudentPanel';
import StudentDashboard from '../pages/StudentDashboard';
import StudentProfile from '../pages/StudentProfile';
import StudentCourses from '../pages/StudentCourses';
import StudentAttendance from '../pages/StudentAttendance';
import StudentAssignments from '../pages/StudentAssignments';
import StudentResults from '../pages/StudentResults';
import StudentSchedule from '../pages/StudentSchedule';
import StudentExams from '../pages/StudentExams';
import StudentFees from '../pages/StudentFees';
import StudentLibrary from '../pages/StudentLibrary';
import StudentComplaints from '../pages/StudentComplaints';
import StudentExamAttempt from "../pages/StudentExamAttempt";
import LearningResources from '../components/library/LearningResources';
import BorrowedBooks from '../components/library/BorrowedBooks';
import PurchaseHistory from '../components/library/PurchaseHistory';
import TransactionHistory from '../components/finance/TransactionHistory';
import HomeworkSubmission from '../components/assignments/HomeworkSubmission';
import Communications from '../components/communications/Communications';

const StudentRoutes = () => (
  <Route path="/" element={<StudentPanel />}>
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
    <Route path="exams/:examId/attempt" element={<StudentExamAttempt />} />
  </Route>
);

export default StudentRoutes;
