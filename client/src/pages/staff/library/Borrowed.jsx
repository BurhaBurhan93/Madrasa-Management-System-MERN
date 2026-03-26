import React, { useMemo, useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [borrowRes, studentRes, bookRes] = await Promise.all([
        fetch(`${API_BASE}/library/borrowed`),
        fetch(`${API_BASE}/users?role=student`),
        fetch(`${API_BASE}/library/books`)
      ]);
      const [borrowData, studentData, bookData] = await Promise.all([
        borrowRes.json(), studentRes.json(), bookRes.json()
      ]);
      setRecords(borrowData.data || []);
      setStudents(studentData.data || []);
      setBooks(bookData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    try {
      await fetch(`${API_BASE}/library/borrowed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, borrowedAt: new Date() })
      });
      setShowForm(false);
      setForm({ borrower: '', book: '' });
      fetchAll();
    } catch (err) {
      alert('Error creating borrow record');
    }
  };

  const markReturned = async (id) => {
    try {
      await fetch(`${API_BASE}/library/borrowed/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'returned', returnDate: new Date() })
      });
      fetchAll();
    } catch (err) {
      alert('Error updating record');
    }
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      const studentName = r.borrower?.name || r.borrower || '';
      const bookTitle = r.book?.title || r.book || '';
      const s = search.toLowerCase();
      const matchS = studentName.toLowerCase().includes(s) || bookTitle.toLowerCase().includes(s);
      const matchF = filter === 'all' || r.status === filter;
      return matchS && matchF;
    });
  }, [records, search, filter]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowed Books</h1>
          <p className="text-gray-600">Manage borrow and return operations</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Borrow
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">New Borrow Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select value={form.borrower} onChange={e => setForm({...form, borrower: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
              <select value={form.book} onChange={e => setForm({...form, book: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- Select Book --</option>
                {books.map(b => <option key={b._id} value={b._id}>{b.title} ({b.available} available)</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleBorrow} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or book" className="px-3 py-2 border rounded" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded">
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
              {filtered.map(r => (
                <tr key={r._id}>
                  <td className="px-4 py-2">{r.borrower?.name || r.borrower}</td>
                  <td className="px-4 py-2">{r.book?.title || r.book}</td>
                  <td className="px-4 py-2">{r.borrowedAt ? new Date(r.borrowedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {r.status === 'borrowed' ? (
                      <Button size="sm" onClick={() => markReturned(r._id)}>Mark Returned</Button>
                    ) : (
                      <span className="text-gray-400 text-sm">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StaffLibraryBorrowed;
