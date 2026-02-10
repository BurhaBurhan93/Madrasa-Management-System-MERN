import { Routes, Route } from "react-router-dom";
import TeacherLayout from "./components/TeacherLayout";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";

export default function TeacherRoutes() {
  return (
    <TeacherLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="classes" element={<Classes />} />
        <Route path="students" element={<Students />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />
      </Routes>
    </TeacherLayout>
  );
}
