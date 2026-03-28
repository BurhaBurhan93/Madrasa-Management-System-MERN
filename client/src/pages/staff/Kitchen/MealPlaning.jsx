import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];
const mealColors = { breakfast: 'bg-yellow-100 text-yellow-700', lunch: 'bg-blue-100 text-blue-700', dinner: 'bg-purple-100 text-purple-700' };

const MealPlaning = () => {
  const [records, setRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ consumptionDate: new Date().toISOString().split('T')[0], mealType: 'lunch', numberOfStudents: '', numberOfStaff: '', itemName: '', quantityUsed: '', unit: 'kg', preparedBy: '', remarks: '' });

  useEffect(() => { fetchRecords(); fetchInventory(); fetchStudentCount(); }, [filters]);

  const fetchStudentCount = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/kitchen/consumption/student-count', api());
      if (res.data.success) setForm(prev => ({ ...prev, numberOfStudents: res.data.data.count }));
    } catch (e) { console.error(e); }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/kitchen/consumption?month=${filters.month}&year=${filters.year}`, api());
      if (res.data.success) setRecords(res.data.data);
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
      await axios.post('http://localhost:5000/api/kitchen/consumption', form, api());
      fetchRecords();
      setShowModal(false);
      setForm({ consumptionDate: new Date().toISOString().split('T')[0], mealType: 'lunch', numberOfStudents: '', numberOfStaff: '', itemName: '', quantityUsed: '', unit: 'kg', preparedBy: '', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await axios.delete(`http://localhost:5000/api/kitchen/consumption/${id}`, api()); fetchRecords(); }
    catch (e) { alert('Failed to delete'); }
  };

  const totalStudents = records.reduce((s, r) => s + r.numberOfStudents, 0);
  const totalStaff = records.reduce((s, r) => s + r.numberOfStaff, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meal Planning</h1>
          <p className="text-sm text-gray-500">Track daily meal consumption</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white"><FiPlus className="inline mr-1" /> Record Meal</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Records', value: records.length, color: 'text-gray-700' }, { label: 'Student Meals', value: totalStudents, color: 'text-blue-600' }, { label: 'Staff Meals', value: totalStaff, color: 'text-green-600' }].map(c => (
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
                <th className="p-3 text-left">Meal</th>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Qty Used</th>
                <th className="p-3 text-left">Students</th>
                <th className="p-3 text-left">Staff</th>
                <th className="p-3 text-left">Prepared By</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No records found</td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{new Date(r.consumptionDate).toLocaleDateString()}</td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${mealColors[r.mealType]}`}>{r.mealType}</span></td>
                  <td className="p-3">{r.itemName || '-'}</td>
                  <td className="p-3">{r.quantityUsed} {r.unit}</td>
                  <td className="p-3">{r.numberOfStudents}</td>
                  <td className="p-3">{r.numberOfStaff}</td>
                  <td className="p-3">{r.preparedBy || '-'}</td>
                  <td className="p-3"><button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button></td>
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
              <h2 className="text-xl font-bold">Record Meal Consumption</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
                  <input type="date" value={form.consumptionDate} onChange={e => setForm({ ...form, consumptionDate: e.target.value })} required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Meal Type *</label>
                  <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                    {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Students Count" value={form.numberOfStudents} onChange={e => setForm({ ...form, numberOfStudents: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="number" placeholder="Staff Count" value={form.numberOfStaff} onChange={e => setForm({ ...form, numberOfStaff: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Item</option>
                  {inventory.map(i => <option key={i._id} value={i.itemName}>{i.itemName} ({i.quantity} {i.unit})</option>)}
                </select>
                <input type="number" placeholder="Qty Used" value={form.quantityUsed} onChange={e => setForm({ ...form, quantityUsed: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <input type="text" placeholder="Prepared By" value={form.preparedBy} onChange={e => setForm({ ...form, preparedBy: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              <textarea placeholder="Remarks" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows="2" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
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

export default MealPlaning;
