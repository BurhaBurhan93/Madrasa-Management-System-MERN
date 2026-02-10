import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside style={{ width: 220, background: "#1f2937", color: "#fff", padding: 20 }}>
      <h3>Teacher Panel</h3>
      <nav>
        <ul>
          <li><Link to="/teacher">Dashboard</Link></li>
          <li><Link to="/teacher/classes">Classes</Link></li>
          <li><Link to="/teacher/students">Students</Link></li>
          <li><Link to="/teacher/attendance">Attendance</Link></li>
          <li><Link to="/teacher/exams">Exams</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
