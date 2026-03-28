import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];
const mealColors = { breakfast: 'bg-yellow-50 border-yellow-200', lunch: 'bg-blue-50 border-blue-200', dinner: 'bg-purple-50 border-purple-200' };
const mealBadge = { breakfast: 'bg-yellow-100 text-yellow-700', lunch: 'bg-blue-100 text-blue-700', dinner: 'bg-purple-100 text-purple-700' };

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

const WeeklyMenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', mealType: 'lunch', menuItems: '', notes: '' });

  useEffect(() => { fetchMenu(); }, [weekStart]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/kitchen/menu?weekStart=${weekStart}`, api());
      if (res.data.success) setMenu(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const payload = {
        ...form,
        menuItems: form.menuItems.split(',').map(i => i.trim()).filter(Boolean),
        weekStartDate: weekStart,
        weekEndDate: weekEnd.toISOString().split('T')[0]
      };
      await axios.post('http://localhost:5000/api/kitchen/menu', payload, api());
      fetchMenu();
      setShowModal(false);
      setForm({ day: 'Monday', mealType: 'lunch', menuItems: '', notes: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`http://localhost:5000/api/kitchen/menu/${id}`, api()); fetchMenu(); }
    catch (e) { alert('Failed to delete'); }
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d.toISOString().split('T')[0]); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d.toISOString().split('T')[0]); };

  const getMenuForDayMeal = (day, mealType) => menu.filter(m => m.day === day && m.mealType === mealType);

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Weekly Menu</h1>
          <p className="text-sm text-gray-500">Plan meals for the week</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white"><FiPlus className="inline mr-1" /> Add Menu Item</Button>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
        <button onClick={prevWeek} className="px-4 py-2 border rounded-lg hover:bg-gray-50">← Prev Week</button>
        <div className="text-center">
          <p className="font-semibold text-gray-800">{new Date(weekStart).toLocaleDateString()} — {weekEnd.toLocaleDateString()}</p>
          <button onClick={() => setWeekStart(getWeekStart())} className="text-xs text-cyan-600 hover:underline mt-1">This Week</button>
        </div>
        <button onClick={nextWeek} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next Week →</button>
      </div>

      {/* Calendar Grid */}
      {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map(day => (
            <div key={day} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="bg-cyan-500 text-white text-center py-2 text-sm font-semibold">{day}</div>
              <div className="p-2 space-y-2">
                {mealTypes.map(meal => {
                  const items = getMenuForDayMeal(day, meal);
                  return (
                    <div key={meal} className={`rounded-lg border p-2 ${mealColors[meal]}`}>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${mealBadge[meal]}`}>{meal}</span>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-400 mt-1">Not planned</p>
                      ) : items.map(item => (
                        <div key={item._id} className="mt-1">
                          <div className="flex justify-between items-start">
                            <p className="text-xs text-gray-700">{item.menuItems.join(', ')}</p>
                            <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 ml-1"><FiTrash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Menu Item</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Day *</label>
                  <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Meal *</label>
                  <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                    {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Menu Items * <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={form.menuItems} onChange={e => setForm({ ...form, menuItems: e.target.value })} required placeholder="e.g. Rice, Chicken, Salad" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
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

export default WeeklyMenuPage;
