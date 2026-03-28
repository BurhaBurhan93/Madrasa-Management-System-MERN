import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiX } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

const FoodRequest = () => {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), allocatedAmount: '', remarks: '' });

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/kitchen/budgets', api());
      if (res.data.success) setBudgets(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/kitchen/budgets', form, api());
      fetchBudgets();
      setShowModal(false);
      setForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), allocatedAmount: '', remarks: '' });
    } catch (e) { alert(e.response?.data?.message || 'Failed to submit request'); }
  };

  const totalRequested = budgets.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalApproved = budgets.filter(b => b.budgetStatus === 'approved').reduce((s, b) => s + (b.approvedAmount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget Requests</h1>
          <p className="text-sm text-gray-500">Submit and track monthly kitchen budget requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white"><FiPlus className="inline mr-1" /> New Request</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: budgets.length, color: 'text-gray-700' },
          { label: 'Total Requested', value: `${totalRequested.toLocaleString()} AFN`, color: 'text-blue-600' },
          { label: 'Total Approved', value: `${totalApproved.toLocaleString()} AFN`, color: 'text-green-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
            <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Month/Year</th>
                <th className="p-3 text-left">Requested</th>
                <th className="p-3 text-left">Approved</th>
                <th className="p-3 text-left">Spent</th>
                <th className="p-3 text-left">Remaining</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No budget requests found</td></tr>
              ) : budgets.map(b => (
                <tr key={b._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{months[b.month - 1]} {b.year}</td>
                  <td className="p-3">{b.allocatedAmount.toLocaleString()} AFN</td>
                  <td className="p-3">{b.approvedAmount.toLocaleString()} AFN</td>
                  <td className="p-3 text-red-600">{b.spentAmount.toLocaleString()} AFN</td>
                  <td className="p-3 text-green-600">{b.remainingAmount.toLocaleString()} AFN</td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[b.budgetStatus]}`}>{b.budgetStatus}</span></td>
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
              <h2 className="text-xl font-bold">New Budget Request</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Month *</label>
                  <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Year *</label>
                  <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Requested Amount (AFN) *</label>
                <input type="number" value={form.allocatedAmount} onChange={e => setForm({ ...form, allocatedAmount: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g. 50000" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodRequest;
