import React, { useState } from 'react';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      transactionCode: 'TXN2024001',
      account: 'Main Account',
      transactionType: 'income',
      amount: 2000,
      transactionDate: '2024-01-15',
      referenceType: 'Fee Payment',
      referenceId: 'FP2024001',
      balanceAfter: 5000,
      performedBy: 'Student Portal',
      verificationStatus: 'verified',
      description: 'Tuition fee payment - Fall 2024'
    },
    {
      id: 2,
      transactionCode: 'TXN2024002',
      account: 'Main Account',
      transactionType: 'expense',
      amount: 150,
      transactionDate: '2024-01-18',
      referenceType: 'Library Fee',
      referenceId: 'LF2024001',
      balanceAfter: 4850,
      performedBy: 'Student Portal',
      verificationStatus: 'verified',
      description: 'Library access fee'
    },
    {
      id: 3,
      transactionCode: 'TXN2024003',
      account: 'Main Account',
      transactionType: 'income',
      amount: 500,
      transactionDate: '2024-01-20',
      referenceType: 'Fee Payment',
      referenceId: 'FP2024002',
      balanceAfter: 5350,
      performedBy: 'Student Portal',
      verificationStatus: 'verified',
      description: 'Accommodation deposit'
    },
    {
      id: 4,
      transactionCode: 'TXN2024004',
      account: 'Main Account',
      transactionType: 'expense',
      amount: 75,
      transactionDate: '2024-02-01',
      referenceType: 'Meal Plan',
      referenceId: 'MP2024001',
      balanceAfter: 5275,
      performedBy: 'Student Portal',
      verificationStatus: 'pending',
      description: 'Weekly meal plan'
    }
  ]);

  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  });

  const transactionTypeColors = {
    income: 'success',
    expense: 'danger'
  };

  const statusColors = {
    verified: 'success',
    pending: 'warning',
    rejected: 'danger'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    return (
      (filters.type === 'all' || transaction.transactionType === filters.type) &&
      (filters.status === 'all' || transaction.verificationStatus === filters.status)
    );
  });

  const totalIncome = transactions
    .filter(t => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600">View and manage your financial transactions</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </Card>
        
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </Card>
        
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Net Balance</h3>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${netBalance.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.account}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={transactionTypeColors[transaction.transactionType]}>
                      {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transactionType === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.referenceType}</div>
                    <div className="text-sm text-gray-500">{transaction.referenceId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[transaction.verificationStatus]}>
                      {transaction.verificationStatus.charAt(0).toUpperCase() + transaction.verificationStatus.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Transactions Summary */}
      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions.slice(0, 3).map(transaction => (
              <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                  <p className="text-sm text-gray-600">{formatDate(transaction.transactionDate)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transactionType === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant={statusColors[transaction.verificationStatus]}>
                    {transaction.verificationStatus.charAt(0).toUpperCase() + transaction.verificationStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <div className="mt-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Export Options</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Export to CSV
            </Button>
            <Button variant="outline">
              Export to PDF
            </Button>
            <Button variant="outline">
              Print Statement
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;
