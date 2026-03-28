import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import Progress from '../../components/UIHelper/Progress';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = { active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAssignments(); fetchSubjects(); }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/assignments', api());
      if (res.data.success) setAssignments(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/subjects', api());
      if (res.data.success) setSubjects(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/assignments/${id}`, api());
      fetchAssignments();
    } catch (e) { alert('Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/assignments/${id}`, { status }, api());
      fetchAssignments();
    } catch (e) { alert('Failed to update'); }
  };

  const filtered = assignments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSubject = filterSubject === 'all' || a.courseId?._id === filterSubject;
    return matchStatus && matchSubject;
  });

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => new Date(a.dueDate) < new Date() && a.status === 'active').length,
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-500">Manage and track student assignments</p>
        </div>
        <Button onClick={() => navigate('/teacher/create-assignments')}>+ Create Assignment</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, color: 'text-green-600' },
          { label: 'Completed', value: stats.completed, color: 'text-purple-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-600' },
        ].map(c => (
          <Card key={c.label} className="text-center">
            <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">No assignments found</div>
          ) : filtered.map(a => {
            const isOverdue = new Date(a.dueDate) < new Date() && a.status === 'active';
            return (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                      <p className="text-sm text-gray-500">{a.courseId?.name || 'No Subject'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[a.status]}`}>{a.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{a.description}</p>
                  <div className="text-sm space-y-1">
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                      Due: {new Date(a.dueDate).toLocaleDateString()} {isOverdue && '⚠️ Overdue'}
                    </p>
                    <p className="text-gray-500">Max Points: {a.maxPoints}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {a.status === 'active' && (
                      <button onClick={() => handleStatusChange(a._id, 'completed')} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Mark Complete</button>
                    )}
                    <button onClick={() => handleDelete(a._id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Delete</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
