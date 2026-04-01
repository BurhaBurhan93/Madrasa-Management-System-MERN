import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiTrash2 } from 'react-icons/fi';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];
const mealColors = { breakfast: 'bg-yellow-100 text-yellow-700', lunch: 'bg-blue-100 text-blue-700', dinner: 'bg-purple-100 text-purple-700' };

const MealPlaning = () => {
  const [records, setRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ consumptionDate: new Date().toISOString().split('T')[0], mealType: 'lunch', numberOfStudents: '', numberOfStaff: '', itemName: '', quantityUsed: '', unit: 'kg', preparedBy: '', remarks: '' });

  useEffect(() => { fetchRecords(); fetchInventory(); }, [filters.month, filters.year]);

  useEffect(() => { fetchStudentCount(); }, []);

  const fetchStudentCount = async () => {
    try {
    const res = await api.get('/kitchen/consumption/student-count');
      if (res.data.success) setForm(prev => ({ ...prev, numberOfStudents: res.data.data.count }));
    } catch (e) { console.error(e); }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
    const res = await api.get(`/kitchen/consumption?month=${filters.month}&year=${filters.year}`);
      if (res.data.success) setRecords(res.data.data);
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
      await api.post('/kitchen/consumption', form);
      fetchRecords();
      setForm({ consumptionDate: new Date().toISOString().split('T')[0], mealType: 'lunch', numberOfStudents: '', numberOfStaff: '', itemName: '', quantityUsed: '', unit: 'kg', preparedBy: '', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(`/kitchen/consumption/${id}`); fetchRecords(); }
    catch (e) { alert('Failed to delete'); }
  };

  const totalStudents = records.reduce((s, r) => s + r.numberOfStudents, 0);
  const totalStaff = records.reduce((s, r) => s + r.numberOfStaff, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Meal Planning</h1>
        <p className="text-sm text-gray-500">Track daily meal consumption</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Record Meal</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="date" value={form.consumptionDate} onChange={e => setForm({ ...form, consumptionDate: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
              {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Students" value={form.numberOfStudents} onChange={e => setForm({ ...form, numberOfStudents: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="number" placeholder="Staff" value={form.numberOfStaff} onChange={e => setForm({ ...form, numberOfStaff: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <select value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">Select Item</option>
              {inventory.map(i => <option key={i._id} value={i.itemName}>{i.itemName} ({i.quantity} {i.unit})</option>)}
            </select>
            <input type="number" placeholder="Qty Used" value={form.quantityUsed} onChange={e => setForm({ ...form, quantityUsed: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" placeholder="Prepared By" value={form.preparedBy} onChange={e => setForm({ ...form, preparedBy: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
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
                    <th className="p-3 text-left">Meal</th>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Qty</th>
                    <th className="p-3 text-left">Students</th>
                    <th className="p-3 text-left">Staff</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">No records found</td></tr>
                  ) : records.map(r => (
                    <tr key={r._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{new Date(r.consumptionDate).toLocaleDateString()}</td>
                      <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${mealColors[r.mealType]}`}>{r.mealType}</span></td>
                      <td className="p-3">{r.itemName || '-'}</td>
                      <td className="p-3">{r.quantityUsed} {r.unit}</td>
                      <td className="p-3">{r.numberOfStudents}</td>
                      <td className="p-3">{r.numberOfStaff}</td>
                      <td className="p-3"><button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button></td>
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

export default MealPlaning;
