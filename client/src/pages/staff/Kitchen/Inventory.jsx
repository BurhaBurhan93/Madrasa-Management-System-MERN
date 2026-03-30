import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const statusColors = { available: 'bg-green-100 text-green-700', low: 'bg-yellow-100 text-yellow-700', out: 'bg-red-100 text-red-700' };
const units = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
    const res = await api.get('/kitchen/inventory');
      if (res.data.success) setItems(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/kitchen/inventory/${editItem._id}`, form);
      } else {
        await api.post('/kitchen/inventory', form);
      }
      fetchInventory();
      setEditItem(null);
      setForm({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ itemName: item.itemName, category: item.category || '', quantity: item.quantity, unit: item.unit, minimumStock: item.minimumStock, unitPrice: item.unitPrice });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/kitchen/inventory/${id}`);
      fetchInventory();
    } catch (e) { alert('Failed to delete'); }
  };

  const filtered = items.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()));
  const stats = { total: items.length, low: items.filter(i => i.status === 'low').length, out: items.filter(i => i.status === 'out').length };

  const resetForm = () => { setEditItem(null); setForm({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 }); };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kitchen Inventory</h1>
        <p className="text-sm text-gray-500">Track and manage kitchen stock</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Items', value: stats.total, color: 'text-gray-700' }, { label: 'Low Stock', value: stats.low, color: 'text-yellow-600' }, { label: 'Out of Stock', value: stats.out, color: 'text-red-600' }].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">{editItem ? 'Edit Item' : 'Add Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Quantity *" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Min Stock" value={form.minimumStock} onChange={e => setForm({ ...form, minimumStock: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="number" placeholder="Unit Price" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1">{editItem ? 'Update' : 'Add'}</Button>
              {editItem && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 space-y-3">
          <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500 bg-white" />
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Item Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Qty</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-left">Min Stock</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">No items found</td></tr>
                  ) : filtered.map(item => (
                    <tr key={item._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.itemName}</td>
                      <td className="p-3">{item.category || '-'}</td>
                      <td className="p-3 font-semibold">{item.quantity}</td>
                      <td className="p-3">{item.unit}</td>
                      <td className="p-3">{item.minimumStock}</td>
                      <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                      <td className="p-3 space-x-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
