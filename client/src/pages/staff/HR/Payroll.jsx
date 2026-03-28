import { useState, useEffect } from 'react';
import axios from 'axios';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HRPayroll = () => {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee: '', month: '', year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    fetchEmployees();
    fetchPayments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payroll/employees', { headers: headers() });
      if (res.data.success) setEmployees(res.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/payroll/salary-payments?limit=100', { headers: headers() });
      if (res.data.success) setPayments(res.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => {
    const emp = employees.find(e => e._id === p.employee);
    if (filters.employee && p.employee !== filters.employee) return false;
    if (filters.month && p.salaryMonth !== parseInt(filters.month)) return false;
    if (filters.year && p.salaryYear !== parseInt(filters.year)) return false;
    return true;
  });

  const totalNet = filtered.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalGross = filtered.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
  const totalDeductions = filtered.reduce((sum, p) => sum + (p.totalDeduction || 0), 0);

  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HR Payroll</h1>
        <p className="text-sm text-gray-500 mt-1">View employee salary payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Gross', value: totalGross, color: 'text-blue-600' },
          { label: 'Total Deductions', value: totalDeductions, color: 'text-red-600' },
          { label: 'Total Net Paid', value: totalNet, color: 'text-green-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value.toLocaleString()} AFN
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex gap-4 flex-wrap">
        <select
          value={filters.employee}
          onChange={e => setFilters({ ...filters, employee: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Employees</option>
          {employees.map(e => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeCode})</option>)}
        </select>
        <select
          value={filters.month}
          onChange={e => setFilters({ ...filters, month: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Months</option>
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input
          type="number"
          value={filters.year}
          onChange={e => setFilters({ ...filters, year: e.target.value })}
          placeholder="Year"
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 w-24"
        />
        <button
          onClick={() => setFilters({ employee: '', month: '', year: new Date().getFullYear() })}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Month/Year</th>
                <th className="p-3 text-left">Gross</th>
                <th className="p-3 text-left">Deductions</th>
                <th className="p-3 text-left">Net Salary</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No salary payments found</td></tr>
              ) : (
                filtered.map(p => {
                  const emp = employees.find(e => e._id === p.employee);
                  return (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{emp?.fullName || '-'}</td>
                      <td className="p-3">{months[p.salaryMonth - 1]} {p.salaryYear}</td>
                      <td className="p-3">{p.grossSalary?.toLocaleString()} AFN</td>
                      <td className="p-3 text-red-600">-{p.totalDeduction?.toLocaleString()} AFN</td>
                      <td className="p-3 font-semibold text-green-700">{p.netSalary?.toLocaleString()} AFN</td>
                      <td className="p-3 capitalize">{p.paymentMethod}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[p.paymentStatus]}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HRPayroll;
