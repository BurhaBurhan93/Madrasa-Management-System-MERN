import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffLibraryBorrowed = () => {
  const [records, setRecords] = useState([
    { id: '1', student: 'STD1001', book: 'Fiqh Essentials', borrowDate: '2026-02-01', returnDate: '', status: 'borrowed' },
    { id: '2', student: 'STD1002', book: 'Tajweed Rules', borrowDate: '2026-01-15', returnDate: '2026-01-28', status: 'returned' },
  ]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return records.filter(r => {
      const s = search.toLowerCase();
      const matchS = r.student.toLowerCase().includes(s) || r.book.toLowerCase().includes(s);
      const matchF = filter === 'all' || r.status === filter;
      return matchS && matchF;
    });
  }, [records, search, filter]);

  const markReturned = (id) => {
    setRecords(prev => prev.map(r => (r.id === id ? { ...r, status: 'returned', returnDate: new Date().toISOString().slice(0, 10) } : r)));
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrowed Books</h1>
        <p className="text-gray-600">Manage borrow and return operations</p>
      </div>

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
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.student}</td>
                  <td className="px-4 py-2">{r.book}</td>
                  <td className="px-4 py-2">{r.borrowDate}</td>
                  <td className="px-4 py-2">{r.returnDate || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {r.status === 'borrowed' ? (
                      <Button size="sm" onClick={() => markReturned(r.id)}>Mark Returned</Button>
                    ) : (
                      <span className="text-gray-400 text-sm">Returned</span>
                    )}
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
