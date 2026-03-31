import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';

const StaffLibraryPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', supplierName: '', invoiceReference: '', book: '', quantity: 1, unitPrice: 0, purchaseDate: '' });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [purchaseRes, bookRes] = await Promise.all([
        axios.get(`${API_BASE}/staff/library/purchases`, getConfig()),
        axios.get(`${API_BASE}/staff/library/books`, getConfig())
      ]);
      setPurchases(purchaseRes.data || []);
      setBooks(bookRes.data || []);
    } catch (err) {
      setError('Failed to fetch purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchData();
    const intervalId = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = useMemo(() => purchases.filter((purchase) => {
    const q = search.toLowerCase();
    return (purchase.supplierName || '').toLowerCase().includes(q) || (purchase.invoiceReference || '').toLowerCase().includes(q) || (purchase.book?.title || '').toLowerCase().includes(q);
  }), [purchases, search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      supplierName: form.supplierName,
      invoiceReference: form.invoiceReference,
      book: form.book,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      totalPrice: Number(form.quantity) * Number(form.unitPrice),
      purchaseDate: form.purchaseDate || null
    };
    if (form.id) {
      await axios.put(`${API_BASE}/staff/library/purchases/${form.id}`, payload, getConfig());
    } else {
      await axios.post(`${API_BASE}/staff/library/purchases`, payload, getConfig());
    }
    setForm({ id: '', supplierName: '', invoiceReference: '', book: '', quantity: 1, unitPrice: 0, purchaseDate: '' });
    await fetchData();
  };

  const onEdit = (purchase) => setForm({
    id: purchase._id,
    supplierName: purchase.supplierName || '',
    invoiceReference: purchase.invoiceReference || '',
    book: purchase.book?._id || '',
    quantity: purchase.quantity || 1,
    unitPrice: purchase.unitPrice || 0,
    purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : ''
  });

  const onDelete = async (id) => {
    await axios.delete(`${API_BASE}/staff/library/purchases/${id}`, getConfig());
    await fetchData();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Purchases</h1>
        <p className="text-gray-600">Record purchases and update stock from live data</p>
      </div>

      {error && !loading && <ErrorPage type="server" title="Unable to Load Purchases" message={error} onRetry={fetchData} onHome={() => { window.location.href = '/staff/dashboard'; }} showBackButton={false} />}

      {loading ? <div className="text-center py-8 text-gray-600">Loading purchases...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Purchase' : 'Add Purchase'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Supplier" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
              <Input label="Invoice" value={form.invoiceReference} onChange={(e) => setForm({ ...form, invoiceReference: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })}>
                  <option value="">Select book</option>
                  {books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
                </select>
              </div>
              <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Input label="Unit Price" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              <Input label="Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Purchases</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Book</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((purchase) => (
                  <tr key={purchase._id}>
                    <td className="px-4 py-2">{purchase.supplierName}</td>
                    <td className="px-4 py-2">{purchase.invoiceReference}</td>
                    <td className="px-4 py-2">{purchase.book?.title}</td>
                    <td className="px-4 py-2">{purchase.quantity}</td>
                    <td className="px-4 py-2">{purchase.totalPrice}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(purchase)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(purchase._id)}>Delete</Button>
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

export default StaffLibraryPurchases;
