import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const reasons = ['spoiled', 'expired', 'overcooked', 'other'];
const reasonColors = { spoiled: 'bg-red-100 text-red-700', expired: 'bg-orange-100 text-orange-700', overcooked: 'bg-yellow-100 text-yellow-700', other: 'bg-gray-100 text-gray-700' };
const units = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'];

const WasteTracking = () => {
  const [waste, setWaste] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'kg', wasteDate: new Date().toISOString().split('T')[0], reason: 'spoiled', remarks: '' });

  useEffect(() => { fetchWaste(); fetchInventory(); }, [filters]);

  const fetchWaste = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/kitchen/waste?month=${filters.month}&year=${filters.year}`, api());
      if (res.data.success) setWaste(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/kitchen/inventory', api());
      if (res.data.success) setInventory(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/kitchen/waste', form, api());
      fetchWaste();
      fetchInventory();
      setShowModal(false);
      setForm({ itemName: '', quantity: '', unit: 'kg', wasteDate: new Date().toISOString().split('T')[0], reason: 'spoiled', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this waste record?')) return;
    try { await axios.delete(`http://localhost:5000/api/kitchen/waste/${id}`, api()); fetchWaste(); }
    catch (e) { alert('Failed to delete'); }
  };

  const byReason = reasons.reduce((acc, r) => ({ ...acc, [r]: waste.filter(w => w.reason === r).length }), {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waste Tracking</h1>
          <p className="text-sm text-gray-500">Record and monitor food waste — deducts from inventory automatically</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white"><FiPlus className="inline mr-1" /> Record Waste</Button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Record Waste</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Item *</label>
                <select value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Item</option>
                  {inventory.map(i => <option key={i._id} value={i.itemName}>{i.itemName} ({i.quantity} {i.unit} available)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Quantity *" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.wasteDate} onChange={e => setForm({ ...form, wasteDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                  {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <textarea placeholder="Remarks (optional)" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows="2" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
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

export default WasteTracking;
