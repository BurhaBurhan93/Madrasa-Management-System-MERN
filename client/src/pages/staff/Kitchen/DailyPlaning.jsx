import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const units = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'];

const DailyPlaning = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ itemName: '', category: '', quantity: '', unit: 'kg', unitPrice: '', purchaseDate: new Date().toISOString().split('T')[0], supplier: '', paymentMethod: 'cash', remarks: '' });

  useEffect(() => { fetchPurchases(); }, [filters]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/kitchen/purchases?month=${filters.month}&year=${filters.year}`, api());
      if (res.data.success) setPurchases(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/kitchen/purchases', form, api());
      fetchPurchases();
      setShowModal(false);
      setForm({ itemName: '', category: '', quantity: '', unit: 'kg', unitPrice: '', purchaseDate: new Date().toISOString().split('T')[0], supplier: '', paymentMethod: 'cash', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase?')) return;
    try { await axios.delete(`http://localhost:5000/api/kitchen/purchases/${id}`, api()); fetchPurchases(); }
    catch (e) { alert('Failed to delete'); }
  };

  const totalSpent = purchases.reduce((s, p) => s + p.totalPrice, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Purchases</h1>
          <p className="text-sm text-gray-500">Record kitchen purchases and update inventory</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white"><FiPlus className="inline mr-1" /> Add Purchase</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Purchases', value: purchases.length, color: 'text-gray-700' }, { label: 'Total Spent', value: `${totalSpent.toLocaleString()} AFN`, color: 'text-red-600' }, { label: 'This Month', value: `${months[filters.month - 1]} ${filters.year}`, color: 'text-blue-600' }].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
            <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow flex gap-4">
        <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className="border rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Unit Price</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Supplier</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No purchases found</td></tr>
              ) : purchases.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{p.itemName}</td>
                  <td className="p-3">{p.quantity} {p.unit}</td>
                  <td className="p-3">{p.unitPrice} AFN</td>
                  <td className="p-3 font-semibold text-red-600">{p.totalPrice.toLocaleString()} AFN</td>
                  <td className="p-3">{p.supplier || '-'}</td>
                  <td className="p-3 capitalize">{p.paymentMethod}</td>
                  <td className="p-3"><button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Purchase</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Quantity *" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="number" placeholder="Unit Price *" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="text" placeholder="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="other">Other</option>
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPlaning;
