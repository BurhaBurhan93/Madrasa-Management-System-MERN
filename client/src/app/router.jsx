import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherRoutes from "../features/teacher/routes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher/*" element={<TeacherRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
