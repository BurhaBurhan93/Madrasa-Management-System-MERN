import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherRoutes from "../features/teacher/routes";
import App from "../App";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher/*" element={<TeacherRoutes />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
