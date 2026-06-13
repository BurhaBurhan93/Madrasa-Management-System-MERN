import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiDollarSign, FiCheckCircle, FiClock, FiUsers, FiSearch, FiFilter, FiDownload, FiPlus } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const AdminPayments = () => {
  const [payments, setPayments] = useState([
    { id: 1, student: 'Ahmed Khan', class: 'Class 5', amount: 5000, type: 'Tuition Fee', date: '2024-03-15', status: 'paid', method: 'Cash', receipt: 'REC001' },
    { id: 2, student: 'Fatima Ali', class: 'Class 7', amount: 6000, type: 'Tuition Fee', date: '2024-03-14', status: 'paid', method: 'Bank Transfer', receipt: 'REC002' },
    { id: 3, student: 'Hassan Raza', class: 'Class 9', amount: 7000, type: 'Tuition Fee', date: '2024-03-13', status: 'pending', method: 'Cash', receipt: 'REC003' },
    { id: 4, student: 'Sara Ahmed', class: 'Class 3', amount: 5000, type: 'Tuition Fee', date: '2024-03-12', status: 'paid', method: 'Bank Transfer', receipt: 'REC004' },
    { id: 5, student: 'Ali Hassan', class: 'Class 8', amount: 6000, type: 'Exam Fee', date: '2024-03-11', status: 'paid', method: 'Cash', receipt: 'REC005' },
    { id: 6, student: 'Aisha Khan', class: 'Class 10', amount: 7000, type: 'Tuition Fee', date: '2024-03-10', status: 'overdue', method: 'Bank Transfer', receipt: 'REC006' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student: '',
    class: 'Class 1',
    amount: '',
    type: 'Tuition Fee',
    method: 'Cash',
    date: new Date().toISOString().split('T')[0]
  });

  const statuses = ['all', 'paid', 'pending', 'overdue'];
  const paymentTypes = ['all', 'Tuition Fee', 'Exam Fee', 'Admission Fee', 'Library Fee', 'Hostel Fee', 'Other'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment'];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.receipt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    if (!newPayment.student || !newPayment.amount || !newPayment.type) {
      alert('Please fill all required fields');
      return;
    }

    const newPaymentObj = {
      id: payments.length + 1,
      student: newPayment.student,
      class: newPayment.class,
      amount: parseInt(newPayment.amount),
      type: newPayment.type,
      date: newPayment.date,
      status: 'paid',
      method: newPayment.method,
      receipt: `REC${(payments.length + 1).toString().padStart(3, '0')}`
    };

    setPayments([...payments, newPaymentObj]);
    setNewPayment({ 
      student: '', 
      class: 'Class 1', 
      amount: '', 
      type: 'Tuition Fee', 
      method: 'Cash',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
    alert('Payment recorded successfully');
  };

  const handleStatusChange = (id, newStatus) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, status: newStatus } : payment
    ));
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getMethodBadge = (method) => {
    const styles = {
      'Cash': 'bg-blue-100 text-blue-800',
      'Bank Transfer': 'bg-purple-100 text-purple-800',
      'Cheque': 'bg-orange-100 text-orange-800',
      'Online Payment': 'bg-teal-100 text-teal-800'
    };
    return styles[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Payments Management</h1>
          <p className="text-gray-600 mt-1">Manage all fee payments and transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">
            <FiDownload size={18} /> Export Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
          >
            <FiPlus size={18} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Paid</p>
              <p className="text-2xl font-bold">Rs. {totalPaid.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCheckCircle size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold">Rs. {totalPending.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiClock size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overdue</p>
              <p className="text-2xl font-bold">Rs. {totalOverdue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
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
              placeholder="Search payments by student name or receipt number..."
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
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {paymentTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.receipt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rs. {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMethodBadge(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-0 ${getStatusBadge(payment.status)}`}
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Paid Amount</span>
                <span className="text-sm font-semibold text-green-600">Rs. {totalPaid.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${totalRevenue > 0 ? (totalPaid / totalRevenue * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Pending Amount</span>
                <span className="text-sm font-semibold text-yellow-600">Rs. {totalPending.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-yellow-500"
                  style={{ width: `${totalRevenue > 0 ? (totalPending / totalRevenue * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Overdue Amount</span>
                <span className="text-sm font-semibold text-red-600">Rs. {totalOverdue.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${totalRevenue > 0 ? (totalOverdue / totalRevenue * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods Distribution</h3>
          <div className="space-y-3">
            {paymentMethods.map(method => {
              const methodCount = payments.filter(p => p.method === method).length;
              const methodAmount = payments.filter(p => p.method === method).reduce((sum, p) => sum + p.amount, 0);
              const percentage = totalRevenue > 0 ? ((methodAmount / totalRevenue) * 100).toFixed(1) : 0;
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${getMethodBadge(method).split(' ')[0]}`} />
                    <span className="text-sm text-gray-700">{method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rs. {methodAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{methodCount} payments • {percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Record New Payment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newPayment.student}
                  onChange={(e) => setNewPayment({...newPayment, student: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newPayment.class}
                  onChange={(e) => setNewPayment({...newPayment, class: e.target.value})}
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newPayment.type}
                  onChange={(e) => setNewPayment({...newPayment, type: e.target.value})}
                >
                  {paymentTypes.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <CalendarDatePicker value={newPayment.date} onChange={(date) => setNewPayment({...newPayment, date: date })} placeholder="Select date" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Record Payment
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

export default AdminPayments;