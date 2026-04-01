import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiTrash2 } from 'react-icons/fi';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const reasons = ['spoiled', 'expired', 'overcooked', 'other'];
const reasonColors = { spoiled: 'bg-red-100 text-red-700', expired: 'bg-orange-100 text-orange-700', overcooked: 'bg-yellow-100 text-yellow-700', other: 'bg-gray-100 text-gray-700' };
const units = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'];

const WasteTracking = () => {
  const [waste, setWaste] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'kg', wasteDate: new Date().toISOString().split('T')[0], reason: 'spoiled', remarks: '' });

  useEffect(() => { fetchWaste(); fetchInventory(); }, [filters.month, filters.year]);

  const fetchWaste = async () => {
    setLoading(true);
    try {
    const res = await api.get(`/kitchen/waste?month=${filters.month}&year=${filters.year}`);
      if (res.data.success) setWaste(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchInventory = async () => {
    try {
    const res = await api.get('/kitchen/inventory');
      if (res.data.success) setInventory(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/kitchen/waste', form);
      fetchWaste();
      fetchInventory();
      setForm({ itemName: '', quantity: '', unit: 'kg', wasteDate: new Date().toISOString().split('T')[0], reason: 'spoiled', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this waste record?')) return;
    try { await api.delete(`/kitchen/waste/${id}`); fetchWaste(); }
    catch (e) { alert('Failed to delete'); }
  };

  const byReason = reasons.reduce((acc, r) => ({ ...acc, [r]: waste.filter(w => w.reason === r).length }), {});

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Waste Tracking</h1>
        <p className="text-sm text-gray-500">Record and monitor food waste — deducts from inventory automatically</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: waste.length, color: 'text-gray-700' },
          { label: 'Spoiled', value: byReason.spoiled, color: 'text-red-600' },
          { label: 'Expired', value: byReason.expired, color: 'text-orange-600' },
          { label: 'Overcooked', value: byReason.overcooked, color: 'text-yellow-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Record Waste</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">Select Item *</option>
              {inventory.map(i => <option key={i._id} value={i.itemName}>{i.itemName} ({i.quantity} {i.unit})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Quantity *" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <input type="date" value={form.wasteDate} onChange={e => setForm({ ...form, wasteDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea placeholder="Remarks (optional)" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows="2" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-3">
            <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className="border rounded-lg px-3 py-2 w-24 text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-white" />
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Remarks</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waste.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No waste records found</td></tr>
                  ) : waste.map(w => (
                    <tr key={w._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{new Date(w.wasteDate).toLocaleDateString()}</td>
                      <td className="p-3 font-medium">{w.itemName}</td>
                      <td className="p-3">{w.quantity} {w.unit}</td>
                      <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${reasonColors[w.reason]}`}>{w.reason}</span></td>
                      <td className="p-3 text-gray-500">{w.remarks || '-'}</td>
                      <td className="p-3"><button onClick={() => handleDelete(w._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button></td>
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

export default WasteTracking;
