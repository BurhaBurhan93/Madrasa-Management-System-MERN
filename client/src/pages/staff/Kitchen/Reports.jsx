import { useState, useEffect } from 'react';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReport(); }, [filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/kitchen/reports?month=${filters.month}&year=${filters.year}`, api());
      if (res.data.success) setReport(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Reports</h1>
          <p className="text-sm text-gray-500">Monthly kitchen summary and analytics</p>
        </div>
        <div className="flex gap-3">
          <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className="border rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      {loading ? <div className="p-8 text-center text-gray-500">Loading report...</div> : report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Purchases', value: `${report.totalPurchases.toLocaleString()} AFN`, color: 'text-red-600' },
              { label: 'Total Meals Served', value: report.totalMeals, color: 'text-blue-600' },
              { label: 'Student Meals', value: report.totalStudentMeals, color: 'text-green-600' },
              { label: 'Staff Meals', value: report.totalStaffMeals, color: 'text-purple-600' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                <div className="text-sm text-gray-500 mt-1">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Inventory Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Inventory Items', value: report.totalInventoryItems, color: 'text-gray-700' },
              { label: 'Low Stock Items', value: report.lowStockItems, color: 'text-yellow-600' },
              { label: 'Waste Records', value: report.totalWasteRecords, color: 'text-red-600' },
              { label: 'Active Students', value: report.activeStudents, color: 'text-blue-600' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                <div className="text-sm text-gray-500 mt-1">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Budget */}
          {report.budget && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Budget — {months[filters.month - 1]} {filters.year}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Allocated', value: `${report.budget.allocatedAmount.toLocaleString()} AFN`, color: 'text-blue-600' },
                  { label: 'Approved', value: `${report.budget.approvedAmount.toLocaleString()} AFN`, color: 'text-green-600' },
                  { label: 'Spent', value: `${report.budget.spentAmount.toLocaleString()} AFN`, color: 'text-red-600' },
                  { label: 'Remaining', value: `${report.budget.remainingAmount.toLocaleString()} AFN`, color: 'text-purple-600' },
                ].map(c => (
                  <div key={c.label} className="text-center">
                    <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                    <div className="text-sm text-gray-500">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Budget Usage</span>
                  <span>{report.budget.approvedAmount > 0 ? Math.round((report.budget.spentAmount / report.budget.approvedAmount) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${report.budget.approvedAmount > 0 ? Math.min((report.budget.spentAmount / report.budget.approvedAmount) * 100, 100) : 0}%` }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
