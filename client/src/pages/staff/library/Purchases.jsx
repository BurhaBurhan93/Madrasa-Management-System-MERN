import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffLibraryPurchases = () => {
  const [purchases, setPurchases] = useState([
    { id: '1', supplier: 'EduBooks', invoice: 'INV-1001', title: 'Fiqh Essentials', qty: 10, price: 12.5, date: '2026-01-15' },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', supplier: '', invoice: '', title: '', qty: 1, price: 0, date: '' });

  const filtered = useMemo(() => {
    return purchases.filter(p => {
      const s = search.toLowerCase();
      return p.supplier.toLowerCase().includes(s) || p.title.toLowerCase().includes(s) || p.invoice.toLowerCase().includes(s);
    });
  }, [purchases, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.supplier || !form.qty) return;
    if (form.id) {
      setPurchases(prev => prev.map(p => (p.id === form.id ? { ...form, qty: Number(form.qty), price: Number(form.price) } : p)));
    } else {
      setPurchases(prev => [...prev, { ...form, id: Date.now().toString(), qty: Number(form.qty), price: Number(form.price) }]);
    }
    setForm({ id: '', supplier: '', invoice: '', title: '', qty: 1, price: 0, date: '' });
  };

  const onEdit = (p) => setForm(p);
  const onDelete = (id) => setPurchases(prev => prev.filter(p => p.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Purchases</h1>
        <p className="text-gray-600">Record purchases and update stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Purchase' : 'Add Purchase'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Supplier" id="supplier" name="supplier" type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            <Input label="Invoice" id="invoice" name="invoice" type="text" value={form.invoice} onChange={e => setForm({ ...form, invoice: e.target.value })} />
            <Input label="Book Title" id="title" name="title" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="Quantity" id="qty" name="qty" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <Input label="Price" id="price" name="price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <Input label="Date" id="date" name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Purchases</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{p.supplier}</td>
                    <td className="px-4 py-2">{p.invoice}</td>
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{p.qty}</td>
                    <td className="px-4 py-2">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-2">${(Number(p.price) * Number(p.qty)).toFixed(2)}</td>
                    <td className="px-4 py-2">{p.date}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(p)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(p.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffLibraryPurchases;
