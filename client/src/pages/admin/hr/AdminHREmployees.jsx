import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiUsers, FiBriefcase, FiDollarSign, FiCalendar, FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const AdminHREmployees = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Mr. Ahmed Khan', designation: 'Mathematics Teacher', department: 'Academic', joinDate: '2020-01-15', salary: 50000, status: 'active', type: 'Permanent' },
    { id: 2, name: 'Ms. Fatima Ali', designation: 'English Teacher', department: 'Academic', joinDate: '2021-03-10', salary: 48000, status: 'active', type: 'Permanent' },
    { id: 3, name: 'Prof. Hassan Raza', designation: 'Science Teacher', department: 'Academic', joinDate: '2019-06-20', salary: 55000, status: 'active', type: 'Permanent' },
    { id: 4, name: 'Sheikh Muhammad', designation: 'Islamic Studies Teacher', department: 'Academic', joinDate: '2018-08-05', salary: 45000, status: 'active', type: 'Permanent' },
    { id: 5, name: 'Mr. Ali Ahmed', designation: 'Accountant', department: 'Finance', joinDate: '2022-02-28', salary: 40000, status: 'active', type: 'Permanent' },
    { id: 6, name: 'Dr. Sara Khan', designation: 'Librarian', department: 'Library', joinDate: '2021-11-15', salary: 35000, status: 'inactive', type: 'Contract' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    designation: '',
    department: 'Academic',
    joinDate: new Date().toISOString().split('T')[0],
    salary: '',
    type: 'Permanent',
    email: '',
    phone: ''
  });

  const departments = ['all', 'Academic', 'Finance', 'Library', 'Administration', 'Hostel', 'Kitchen', 'Maintenance'];
  const statuses = ['all', 'active', 'inactive'];
  const employeeTypes = ['Permanent', 'Contract', 'Part-time'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.designation || !newEmployee.salary || !newEmployee.email) {
      alert('Please fill all required fields');
      return;
    }

    const newEmployeeObj = {
      id: employees.length + 1,
      name: newEmployee.name,
      designation: newEmployee.designation,
      department: newEmployee.department,
      joinDate: newEmployee.joinDate,
      salary: parseInt(newEmployee.salary),
      status: 'active',
      type: newEmployee.type,
      email: newEmployee.email,
      phone: newEmployee.phone || 'N/A'
    };

    setEmployees([...employees, newEmployeeObj]);
    setNewEmployee({ 
      name: '', 
      designation: '', 
      department: 'Academic', 
      joinDate: new Date().toISOString().split('T')[0], 
      salary: '', 
      type: 'Permanent',
      email: '',
      phone: ''
    });
    setShowAddModal(false);
    alert('Employee added successfully');
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(employee => employee.id !== id));
      alert('Employee deleted successfully');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setEmployees(employees.map(employee => 
      employee.id === id ? { ...employee, status: newStatus } : employee
    ));
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const styles = {
      'Permanent': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-yellow-100 text-yellow-800',
      'Part-time': 'bg-purple-100 text-purple-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const EmployeeCard = ({ employee }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
          <p className="text-gray-600">{employee.designation}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteEmployee(employee.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Department:</span>
          <span className="font-medium text-gray-900">{employee.department}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Join Date:</span>
          <span className="font-medium text-gray-900">
            {new Date(employee.joinDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Monthly Salary:</span>
          <span className="font-medium text-gray-900">Rs. {employee.salary.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Employment Type:</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(employee.type)}`}>
            {employee.type}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={employee.status}
          onChange={(e) => handleStatusChange(employee.id, e.target.value)}
          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-0 ${getStatusBadge(employee.status)}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="text-sm text-blue-600 hover:text-blue-900 font-medium">
          View Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 HR Employees Management</h1>
          <p className="text-gray-600 mt-1">Manage all staff and employee records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Employees</p>
              <p className="text-2xl font-bold">{activeEmployees}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBriefcase size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Monthly Salary</p>
              <p className="text-2xl font-bold">Rs. {totalSalary.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Salary</p>
              <p className="text-2xl font-bold">Rs. {avgSalary.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCalendar size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees by name or designation..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.filter(d => d !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {statuses.filter(s => s !== 'all').map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>

      {/* Employees Table */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Employees</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{employee.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rs. {employee.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(employee.type)}`}>
                      {employee.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Department Summary */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Department Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.filter(d => d !== 'all').map(dept => {
                const deptEmployees = employees.filter(e => e.department === dept);
                const deptActive = deptEmployees.filter(e => e.status === 'active').length;
                const deptSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
                const deptAvgSalary = deptEmployees.length > 0 ? Math.round(deptSalary / deptEmployees.length) : 0;
                const deptPercentage = totalSalary > 0 ? ((deptSalary / totalSalary) * 100).toFixed(1) : 0;

                return (
                  <tr key={dept}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deptEmployees.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deptActive}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {deptSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {deptAvgSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${deptPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{deptPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Employee</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.designation}
                  onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                  placeholder="Enter designation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                >
                  {departments.filter(d => d !== 'all').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (Rs.) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  placeholder="Enter monthly salary"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newEmployee.type}
                  onChange={(e) => setNewEmployee({...newEmployee, type: e.target.value})}
                >
                  {employeeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <CalendarDatePicker value={newEmployee.joinDate} onChange={(date) => setNewEmployee({...newEmployee, joinDate: date })} placeholder="Select date" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddEmployee}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add Employee
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHREmployees;