import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';

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
  const [loading, setLoading] = useState(false);
  // activeSlot = { day, mealType } — which slot is open for input
  const [activeSlot, setActiveSlot] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => { fetchMenu(); }, [weekStart]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kitchen/menu?weekStart=${weekStart}`);
      if (res.data.success) setMenu(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSlotClick = (day, mealType) => {
    if (activeSlot?.day === day && activeSlot?.mealType === mealType) {
      setActiveSlot(null);
      setInputValue('');
    } else {
      setActiveSlot({ day, mealType });
      setInputValue('');
    }
  };

  const handleAdd = async (day, mealType) => {
    if (!inputValue.trim()) return;
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      await api.post('/kitchen/menu', {
        day,
        mealType,
        menuItems: inputValue.split(',').map(i => i.trim()).filter(Boolean),
        weekStartDate: weekStart,
        weekEndDate: weekEnd.toISOString().split('T')[0]
      });
      fetchMenu();
      setActiveSlot(null);
      setInputValue('');
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/kitchen/menu/${id}`); fetchMenu(); }
    catch (e) { alert('Failed to delete'); }
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d.toISOString().split('T')[0]); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d.toISOString().split('T')[0]); };
  const getMenuForDayMeal = (day, mealType) => menu.filter(m => m.day === day && m.mealType === mealType);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Weekly Menu</h1>
        <p className="text-sm text-gray-500">Click + on any meal slot to add items directly</p>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
        <button onClick={prevWeek} className="px-4 py-2 border rounded-lg hover:bg-gray-50">← Prev</button>
        <div className="text-center">
          <p className="font-semibold text-gray-800">{new Date(weekStart).toLocaleDateString()} — {weekEnd.toLocaleDateString()}</p>
          <button onClick={() => { setWeekStart(getWeekStart()); setActiveSlot(null); }} className="text-xs text-cyan-600 hover:underline mt-1">This Week</button>
        </div>
        <button onClick={nextWeek} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next →</button>
      </div>

      {/* Full Width Calendar */}
      {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {days.map(day => (
            <div key={day} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Day Header */}
              <div className="bg-cyan-500 text-white text-center py-2 text-sm font-semibold">{day}</div>

              {/* Meal Slots */}
              <div className="p-2 space-y-2">
                {mealTypes.map(meal => {
                  const items = getMenuForDayMeal(day, meal);
                  const isActive = activeSlot?.day === day && activeSlot?.mealType === meal;
                  return (
                    <div key={meal} className={`rounded-lg border p-2 ${mealColors[meal]}`}>
                      {/* Meal badge + add button */}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${mealBadge[meal]}`}>{meal}</span>
                        <button
                          onClick={() => handleSlotClick(day, meal)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                            isActive ? 'bg-cyan-500 text-white' : 'bg-white border border-gray-300 text-gray-400 hover:border-cyan-400 hover:text-cyan-500'
                          }`}
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>

                      {/* Existing items */}
                      {items.map(item => (
                        <div key={item._id} className="mt-1 flex justify-between items-start">
                          <p className="text-xs text-gray-700">{item.menuItems.join(', ')}</p>
                          <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 ml-1 flex-shrink-0"><FiTrash2 size={10} /></button>
                        </div>
                      ))}

                      {/* Inline input — appears when slot is active */}
                      {isActive && (
                        <div className="mt-2 flex gap-1">
                          <input
                            autoFocus
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(day, meal); } if (e.key === 'Escape') { setActiveSlot(null); setInputValue(''); } }}
                            placeholder="Rice, Chicken..."
                            className="flex-1 border rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-cyan-500 min-w-0"
                          />
                          <button
                            onClick={() => handleAdd(day, meal)}
                            className="bg-cyan-500 text-white rounded px-1.5 py-1 hover:bg-cyan-600 flex-shrink-0"
                          >
                            <FiCheck size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyMenuPage;
