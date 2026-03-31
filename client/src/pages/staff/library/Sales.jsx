import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffLibrarySales = () => {
  console.log('[StaffLibrarySales] Component initializing...');
  const [sales, setSales] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', student: '', title: '', qty: 1, price: 0, date: '', receipt: '' });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StaffLibrarySales] Token exists:', !!token);
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    console.log('[StaffLibrarySales] useEffect triggered - fetching data from API...');
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StaffLibrarySales] Fetching books from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/library/books', config);
      
      console.log('[StaffLibrarySales] Books API response:', response.data);
      setBooks(response.data || []);
    } catch (err) {
      console.error('[StaffLibrarySales] Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const q = search.toLowerCase();
      return s.student.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.receipt.toLowerCase().includes(q);
    });
  }, [sales, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.student) return;
    const receiptNo = form.receipt && form.receipt.length > 0
      ? form.receipt
      : `SAL-${(Math.random() * 10000).toFixed(0).padStart(4, '0')}`;
    if (form.id) {
      setSales(prev => prev.map(s => (s.id === form.id ? { ...form, receipt: receiptNo, qty: Number(form.qty), price: Number(form.price) } : s)));
    } else {
      setSales(prev => [...prev, { ...form, id: Date.now().toString(), receipt: receiptNo, qty: Number(form.qty), price: Number(form.price) }]);
    }
    setForm({ id: '', student: '', title: '', qty: 1, price: 0, date: '', receipt: '' });
  };

  const onEdit = (s) => setForm(s);
  const onDelete = (id) => setSales(prev => prev.filter(s => s.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Sales</h1>
        <p className="text-gray-600">Record sales and generate receipts</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Sale' : 'New Sale'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Student ID" id="student" name="student" type="text" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} />
            <Input label="Book Title" id="title" name="title" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="Quantity" id="qty" name="qty" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <Input label="Price" id="price" name="price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <Input label="Date" id="date" name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Receipt No" id="receipt" name="receipt" type="text" value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} />
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Receipt</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-2">{s.student}</td>
                    <td className="px-4 py-2">{s.title}</td>
                    <td className="px-4 py-2">{s.qty}</td>
                    <td className="px-4 py-2">${Number(s.price).toFixed(2)}</td>
                    <td className="px-4 py-2">${(Number(s.price) * Number(s.qty)).toFixed(2)}</td>
                    <td className="px-4 py-2">{s.date}</td>
                    <td className="px-4 py-2">{s.receipt}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(s)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(s.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      )}
    </div>
  );
};

export default StaffLibrarySales;
