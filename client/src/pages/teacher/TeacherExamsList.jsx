import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  finished: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TeacherExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/exams', api());
      if (res.data.success) setExams(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/exams/${id}`, api());
      fetchExams();
    } catch (e) { alert('Failed to delete'); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/exams/${id}/publish`, {}, api());
      if (res.data.success) { alert('Exam published!'); fetchExams(); }
    } catch (e) { alert(e.response?.data?.message || 'Failed to publish'); }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/exams/${id}/close`, {}, api());
      fetchExams();
    } catch (e) { alert('Failed to close'); }
  };

  const filtered = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: exams.length,
    published: exams.filter(e => e.status === 'published').length,
    draft: exams.filter(e => e.status === 'draft').length,
    finished: exams.filter(e => e.status === 'finished').length,
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
          <p className="text-sm text-gray-500">Manage and monitor your exams</p>
        </div>
        <Button onClick={() => navigate('/teacher/exams/create')}>+ Create Exam</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700' },
          { label: 'Draft', value: stats.draft, color: 'text-yellow-600' },
          { label: 'Published', value: stats.published, color: 'text-green-600' },
          { label: 'Finished', value: stats.finished, color: 'text-blue-600' },
        ].map(c => (
          <Card key={c.label} className="text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4 p-2">
          <input type="text" placeholder="Search exam..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-green-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Total Marks</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No exams found</td></tr>
              ) : filtered.map(exam => (
                <tr key={exam._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{exam.title}</td>
                  <td className="p-3">{exam.subject?.name || '-'}</td>
                  <td className="p-3">{exam.class?.name || '-'}</td>
                  <td className="p-3">{exam.duration} min</td>
                  <td className="p-3">{exam.totalMarks}</td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[exam.status]}`}>{exam.status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => navigate(`/teacher/exams/${exam._id}`)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View</button>
                      {exam.status === 'draft' && <button onClick={() => handlePublish(exam._id)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Publish</button>}
                      {exam.status === 'published' && <button onClick={() => handleClose(exam._id)} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Close</button>}
                      {(exam.status === 'published' || exam.status === 'finished') && <button onClick={() => navigate(`/teacher/exams/${exam._id}/submissions`)} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Submissions</button>}
                      {exam.status === 'draft' && <button onClick={() => handleDelete(exam._id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default TeacherExamsList;
