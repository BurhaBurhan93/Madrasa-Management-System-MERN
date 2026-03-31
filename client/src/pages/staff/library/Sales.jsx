import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';

const StaffLibrarySales = () => {
  const [sales, setSales] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', student: '', book: '', quantity: 1, unitPrice: 0, saleDate: '', receiptNo: '' });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesRes, bookRes, studentRes] = await Promise.all([
        axios.get(`${API_BASE}/staff/library/sales`, getConfig()),
        axios.get(`${API_BASE}/staff/library/books`, getConfig()),
        axios.get(`${API_BASE}/staff/students`, getConfig())
      ]);
      setSales(salesRes.data || []);
      setBooks(bookRes.data || []);
      setStudents(studentRes.data || []);
    } catch (err) {
      setError('Failed to fetch sales. Please try again.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchData();
    const intervalId = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = useMemo(() => sales.filter((sale) => {
    const q = search.toLowerCase();
    return (sale.receiptNo || '').toLowerCase().includes(q) || (sale.book?.title || '').toLowerCase().includes(q) || (sale.student?.userId?.name || '').toLowerCase().includes(q);
  }), [sales, search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      student: form.student || null,
      book: form.book,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      totalAmount: Number(form.quantity) * Number(form.unitPrice),
      saleDate: form.saleDate || null,
      receiptNo: form.receiptNo || undefined
    };
    if (form.id) {
      await axios.put(`${API_BASE}/staff/library/sales/${form.id}`, payload, getConfig());
    } else {
      await axios.post(`${API_BASE}/staff/library/sales`, payload, getConfig());
    }
    setForm({ id: '', student: '', book: '', quantity: 1, unitPrice: 0, saleDate: '', receiptNo: '' });
    await fetchData();
  };

  const onEdit = (sale) => setForm({
    id: sale._id,
    student: sale.student?._id || '',
    book: sale.book?._id || '',
    quantity: sale.quantity || 1,
    unitPrice: sale.unitPrice || 0,
    saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : '',
    receiptNo: sale.receiptNo || ''
  });

  const onDelete = async (id) => {
    await axios.delete(`${API_BASE}/staff/library/sales/${id}`, getConfig());
    await fetchData();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Sales</h1>
        <p className="text-gray-600">Record book sales with database-backed data</p>
      </div>

      {error && !loading && <ErrorPage type="server" title="Unable to Load Sales Data" message={error} onRetry={fetchData} onHome={() => { window.location.href = '/staff/dashboard'; }} showBackButton={false} />}

      {loading ? <div className="text-center py-8 text-gray-600">Loading sales...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Sale' : 'New Sale'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
                  <option value="">Select student</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })}>
                  <option value="">Select book</option>
                  {books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
                </select>
              </div>
              <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Input label="Unit Price" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              <Input label="Date" type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
              <Input label="Receipt No" value={form.receiptNo} onChange={(e) => setForm({ ...form, receiptNo: e.target.value })} />
              <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sales</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Book</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Receipt</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-4 py-2">{sale.student?.userId?.name || '-'}</td>
                    <td className="px-4 py-2">{sale.book?.title || '-'}</td>
                    <td className="px-4 py-2">{sale.quantity}</td>
                    <td className="px-4 py-2">{sale.totalAmount}</td>
                    <td className="px-4 py-2">{sale.receiptNo}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(sale)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(sale._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffLibrarySales;
