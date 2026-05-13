import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiDollarSign, FiUsers, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';

const AdminFeeStructure = () => {
  const [feeStructures, setFeeStructures] = useState([
    { id: 1, name: 'Primary School', class: 'Class 1-5', amount: 5000, frequency: 'Monthly', students: 150, dueDate: '5th of each month' },
    { id: 2, name: 'Middle School', class: 'Class 6-8', amount: 6000, frequency: 'Monthly', students: 120, dueDate: '5th of each month' },
    { id: 3, name: 'High School', class: 'Class 9-10', amount: 7000, frequency: 'Monthly', students: 90, dueDate: '5th of each month' },
    { id: 4, name: 'Admission Fee', class: 'All Classes', amount: 10000, frequency: 'One-time', students: 45, dueDate: 'On admission' },
    { id: 5, name: 'Exam Fee', class: 'All Classes', amount: 2000, frequency: 'Per Exam', students: 360, dueDate: 'Before exams' },
    { id: 6, name: 'Library Fee', class: 'All Classes', amount: 500, frequency: 'Annual', students: 360, dueDate: 'Start of year' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFee, setNewFee] = useState({
    name: '',
    class: '',
    amount: '',
    frequency: 'Monthly',
    dueDate: ''
  });

  const filteredFees = feeStructures.filter(fee =>
    fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.frequency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyRevenue = feeStructures
    .filter(fee => fee.frequency === 'Monthly')
    .reduce((sum, fee) => sum + (fee.amount * fee.students), 0);

  const totalAnnualRevenue = feeStructures
    .reduce((sum, fee) => {
      const multiplier = fee.frequency === 'Monthly' ? 12 : 
                        fee.frequency === 'Annual' ? 1 : 
                        fee.frequency === 'Per Exam' ? 2 : 1;
      return sum + (fee.amount * fee.students * multiplier);
    }, 0);

  const handleAddFee = () => {
    if (!newFee.name || !newFee.class || !newFee.amount) {
      alert('Please fill all required fields');
      return;
    }

    const newFeeObj = {
      id: feeStructures.length + 1,
      name: newFee.name,
      class: newFee.class,
      amount: parseInt(newFee.amount),
      frequency: newFee.frequency,
      students: 0,
      dueDate: newFee.dueDate || '5th of each month'
    };

    setFeeStructures([...feeStructures, newFeeObj]);
    setNewFee({ name: '', class: '', amount: '', frequency: 'Monthly', dueDate: '' });
    setShowAddModal(false);
    alert('Fee structure added successfully');
  };

  const handleDeleteFee = (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      setFeeStructures(feeStructures.filter(fee => fee.id !== id));
      alert('Fee structure deleted successfully');
    }
  };

  const FeeCard = ({ fee }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{fee.name}</h3>
          <p className="text-gray-600">Class: {fee.class}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteFee(fee.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <FiDollarSign size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900">Rs. {fee.amount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Students</p>
            <p className="font-semibold text-gray-900">{fee.students}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Frequency:</span>
          <span className="font-medium text-gray-900">{fee.frequency}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Due Date:</span>
          <span className="font-medium text-gray-900">{fee.dueDate}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Monthly Collection</p>
        <p className="text-lg font-bold text-green-600">
          Rs. {(fee.amount * fee.students).toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Fee Structure Management</h1>
          <p className="text-gray-600 mt-1">Manage all fee structures and pricing</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">
            <FiDownload size={18} /> Export Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
          >
            <FiPlus size={18} /> Add New Fee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Fee Structures</p>
              <p className="text-2xl font-bold">{feeStructures.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Monthly Revenue</p>
              <p className="text-2xl font-bold">Rs. {totalMonthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCalendar size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Annual Revenue</p>
              <p className="text-2xl font-bold">Rs. {totalAnnualRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Students</p>
              <p className="text-2xl font-bold">{new Set(feeStructures.flatMap(fee => fee.students)).size}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
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
              placeholder="Search fee structures by name, class, or frequency..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>All Frequencies</option>
              <option>Monthly</option>
              <option>Annual</option>
              <option>One-time</option>
              <option>Per Exam</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>Sort by Name</option>
              <option>Sort by Amount</option>
              <option>Sort by Students</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Fee Structures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFees.map(fee => (
          <FeeCard key={fee.id} fee={fee} />
        ))}
      </div>

      {/* Revenue Summary */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Collection</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeStructures.map(fee => {
                const monthlyCollection = fee.amount * fee.students;
                const annualMultiplier = fee.frequency === 'Monthly' ? 12 : 
                                       fee.frequency === 'Annual' ? 1 : 
                                       fee.frequency === 'Per Exam' ? 2 : 1;
                const annualCollection = monthlyCollection * annualMultiplier;

                return (
                  <tr key={fee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {fee.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.students}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {fee.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      Rs. {monthlyCollection.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                      Rs. {annualCollection.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Fee Structure</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newFee.name}
                  onChange={(e) => setNewFee({...newFee, name: e.target.value})}
                  placeholder="e.g., Tuition Fee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Class/Level *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newFee.class}
                  onChange={(e) => setNewFee({...newFee, class: e.target.value})}
                  placeholder="e.g., Class 1-5 or All Classes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newFee.frequency}
                  onChange={(e) => setNewFee({...newFee, frequency: e.target.value})}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="One-time">One-time</option>
                  <option value="Per Exam">Per Exam</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newFee.dueDate}
                  onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                  placeholder="e.g., 5th of each month"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddFee}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add Fee Structure
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

export default AdminFeeStructure;