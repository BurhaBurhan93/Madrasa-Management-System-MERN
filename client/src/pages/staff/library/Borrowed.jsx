import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';

const API_BASE = 'http://localhost:5000/api';

const StaffLibraryBorrowed = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ borrower: '', book: '' });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [borrowRes, studentRes, bookRes] = await Promise.all([
        axios.get(`${API_BASE}/staff/library/borrowed`, getConfig()),
        axios.get(`${API_BASE}/staff/students`, getConfig()),
        axios.get(`${API_BASE}/staff/library/books`, getConfig())
      ]);
      setRecords(borrowRes.data || []);
      setStudents(studentRes.data || []);
      setBooks(bookRes.data || []);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchAll();
    const intervalId = window.setInterval(fetchAll, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleBorrow = async () => {
    await axios.post(`${API_BASE}/staff/library/borrowed`, form, getConfig());
    setShowForm(false);
    setForm({ borrower: '', book: '' });
    await fetchAll();
  };

  const markReturned = async (id) => {
    await axios.put(`${API_BASE}/staff/library/borrowed/${id}`, { status: 'returned', returnDate: new Date() }, getConfig());
    await fetchAll();
  };

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const studentName = record.borrower?.name || '';
      const bookTitle = record.book?.title || '';
      const q = search.toLowerCase();
      const matchesSearch = studentName.toLowerCase().includes(q) || bookTitle.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || record.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowed Books</h1>
          <p className="text-gray-600">Manage borrow and return operations from the database</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Borrow
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">New Borrow Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select value={form.borrower} onChange={(e) => setForm({ ...form, borrower: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.email})</option>)}
            </select>
            <select value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Book</option>
              {books.map((book) => <option key={book.id} value={book.id}>{book.title} ({book.stock} available)</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleBorrow} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student or book" className="px-3 py-2 border rounded" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="all">All</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Book</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Borrow Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Return Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((record) => (
                <tr key={record._id}>
                  <td className="px-4 py-2">{record.borrower?.name}</td>
                  <td className="px-4 py-2">{record.book?.title}</td>
                  <td className="px-4 py-2">{record.borrowedAt ? new Date(record.borrowedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">{record.status}</td>
                  <td className="px-4 py-2">
                    {record.status === 'borrowed' ? <Button size="sm" onClick={() => markReturned(record._id)}>Mark Returned</Button> : <span className="text-gray-400 text-sm">Returned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StaffLibraryBorrowed;
