import { useState, useEffect } from 'react';

import axios from 'axios';

import Card from '../../../components/UIHelper/Card';

import ErrorPage from '../../../components/UIHelper/ErrorPage';

import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import AgGridTable from '../../../components/UIHelper/AgGridTable';



const statusColors = {

  active: 'bg-green-100 text-green-700',

  inactive: 'bg-red-100 text-red-700',

};



const Employees = () => {

  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState('');

  const [filterDept, setFilterDept] = useState('');

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);



  const token = () => localStorage.getItem('token');

  const headers = () => ({ Authorization: `Bearer ${token()}` });



  useEffect(() => {

    fetchEmployees();

    fetchDepartments();

  }, []);



  const fetchEmployees = async () => {

    setLoading(true);

    setError(null);

    try {

      const res = await axios.get('http://localhost:5000/api/hr/employees', { headers: headers() });

      if (res.data.success) setEmployees(res.data.data);

    } catch (error) {

      console.error('Error fetching employees:', error);

      setError('Failed to fetch employees. Please try again.');

    } finally {

      setLoading(false);

    }

  };



  const fetchDepartments = async () => {

    try {

      const res = await axios.get('http://localhost:5000/api/hr/departments', { headers: headers() });

      if (res.data.success) setDepartments(res.data.data);

    } catch (error) {

      console.error('Error fetching departments:', error);

    }

  };



  const filtered = employees.filter(emp => {

    const matchSearch = emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||

      emp.employeeCode?.toLowerCase().includes(search.toLowerCase());

    const matchDept = filterDept ? emp.department?._id === filterDept : true;

    return matchSearch && matchDept;

  });



  return (

    <div className="p-6 space-y-6">

      {error && !loading && (

        <ErrorPage 

          type="server" 

          title="Employees Data Unavailable"

          message={error}

          onRetry={fetchEmployees}

          onHome={() => window.location.href = '/staff/dashboard'}

          showBackButton={false}

        />

      )}

      

      <div>

        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>

        <p className="text-sm text-gray-500 mt-1">Overview of all registered employees</p>

      </div>



      {/* Summary Cards */}

      <div className="grid grid-cols-3 gap-4">

        {[

          { label: 'Total Employees', value: employees.length, color: 'text-gray-700' },

          { label: 'Active', value: employees.filter(e => e.status === 'active').length, color: 'text-green-600' },

          { label: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, color: 'text-red-600' },

        ].map(card => (

          <div key={card.label} className="bg-white rounded-xl shadow p-4">

            <p className="text-sm text-gray-500">{card.label}</p>

            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>

          </div>

        ))}

      </div>



      {/* Charts Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Employee Status Distribution">

          <PieChartComponent 

            data={[

              { name: 'Active', value: employees.filter(e => e.status === 'active').length, color: '#10B981' },

              { name: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, color: '#EF4444' }

            ].filter(d => d.value > 0)}

            dataKey="value"

            nameKey="name"

            height={250}

          />

        </Card>



        <Card title="Employees by Department">

          <BarChartComponent 

            data={departments.map(dept => ({

              name: dept.departmentName?.substring(0, 15) || 'Unknown',

              value: employees.filter(e => e.department?._id === dept._id).length

            }))}

            dataKey="value"

            nameKey="name"

            height={250}

          />

        </Card>

      </div>



      {/* Search & Filter */}

      <div className="bg-white p-4 rounded-xl shadow flex gap-4">

        <input

          type="text"

          placeholder="Search by name or code..."

          value={search}

          onChange={e => setSearch(e.target.value)}

          className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-cyan-500"

        />

        <select

          value={filterDept}

          onChange={e => setFilterDept(e.target.value)}

          className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"

        >

          <option value="">All Departments</option>

          {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}

        </select>

      </div>



      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (

          <div className="p-8 text-center text-gray-500">Loading...</div>

        ) : (

          <table className="w-full text-left">

            <thead className="bg-gray-50 text-gray-600 text-sm">

              <tr>

                <th className="p-3">Code</th>

                <th className="p-3">Name</th>

                <th className="p-3">Department</th>

                <th className="p-3">Designation</th>

                <th className="p-3">Phone</th>

                <th className="p-3">Type</th>

                <th className="p-3">Status</th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 ? (

                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No employees found</td></tr>

              ) : (

                filtered.map(emp => (

                  <tr key={emp._id} className="border-t hover:bg-gray-50">

                    <td className="p-3 font-medium text-cyan-600">{emp.employeeCode}</td>

                    <td className="p-3 font-medium">{emp.fullName}</td>

                    <td className="p-3">{emp.department?.departmentName || '-'}</td>

                    <td className="p-3">{emp.designation?.designationTitle || '-'}</td>

                    <td className="p-3">{emp.phoneNumber || '-'}</td>

                    <td className="p-3 capitalize">{emp.employeeType}</td>

                    <td className="p-3">

                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[emp.status]}`}>

                        {emp.status}

                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

};



export default Employees;

