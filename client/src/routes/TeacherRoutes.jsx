import React from 'react';
import { Route } from 'react-router-dom';
import TeacherPanel from '../panels/TeacherPanel';
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherSubjects from '../pages/teacher/TeacherSubjects';
import TeacherProfile from '../pages/teacher/TeacherProfile';
import TeacherExamDetails from "../pages/teacher/TeacherExamDetails";
import TeacherAddQuestion from "../pages/teacher/TeacherAddQuestion";
import TeacherEditQuestion from "../pages/teacher/TeacherEditQuestion";
import TeacherExamsList from '../pages/teacher/TeacherExamsList';
import TeacherCreateExam from "../pages/teacher/TeacherCreateExam";
import TeacherExamSubmissions from "../pages/teacher/TeacherExamSubmissions";
import TeacherStudents from '../pages/teacher/TeacherStudents';
import TeacherAssignments from '../pages/teacher/TeacherAssignments';
import TeacherSessions from '../pages/teacher/TeacherSessions';
import TeacherAttendance from '../pages/teacher/TeacherAttendance';
import TeacherAttendanceReports from '../pages/teacher/TeacherAttendanceReport';
import TeacherViewResults from '../pages/teacher/TeacherViewResults';
import TeacherEnterMarks from '../pages/teacher/TeacherEnterMarks';
import TeacherResults from '../pages/teacher/TeacherResults';
import AssignedComplaints from '../pages/teacher/AssignedCompliants';
import Messages from '../pages/teacher/Messages';
import CreateAssignment from '../pages/teacher/CreateAssignment';

const TeacherRoutes = () => (
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
    <Route path="exams">
      <Route index element={<TeacherExamsList />} />
      <Route path=":examId" element={<TeacherExamDetails />} />
      <Route path=":examId/add-question" element={<TeacherAddQuestion />} />
      <Route path=":examId/edit-question/:questionId" element={<TeacherEditQuestion />} />
      <Route path="create" element={<TeacherCreateExam />} />
      <Route path=":examId/submissions" element={<TeacherExamSubmissions />} />
    </Route>
    <Route path="results">
      <Route index element={<TeacherResults />} />
      <Route path="enter-marks" element={<TeacherEnterMarks />} />
      <Route path="view-results" element={<TeacherViewResults />} />
    </Route>
    <Route path="complaints" element={<AssignedComplaints />} />
    <Route path="messages" element={<Messages />} />
  </Route>
);

export default TeacherRoutes;
