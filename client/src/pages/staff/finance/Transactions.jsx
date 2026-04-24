import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import Badge from '../../../components/UIHelper/Badge';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity, FiCreditCard } from 'react-icons/fi';

export const transactionsConfig = {
  title: 'Financial Transactions',
  subtitle: 'Manage income and expense transactions',
  endpoint: '/finance/transactions',
  columns: [
    { key: 'transactionDate', header: 'Date', render: (value) => new Date(value).toISOString().slice(0, 10) },
    { key: 'transactionCode', header: 'Code' },
    { key: 'description', header: 'Description' },
    { key: 'transactionType', header: 'Type', render: (value) => (
      <Badge variant={value === 'income' ? 'success' : 'danger'}>
        {value === 'income' ? 'Income' : 'Expense'}
      </Badge>
    ) },
    { key: 'amount', header: 'Amount' },
    { key: 'verificationStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'transactionType', label: 'Transaction Type', type: 'select', options: [
      { value: 'income', label: 'Income' },
      { value: 'expense', label: 'Expense' }
    ]},
    { name: 'account', label: 'Account', type: 'relation', relationEndpoint: '/finance/accounts', relationLabel: (r) => `${r.accountName} (${r.accountCode})` },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
    { name: 'referenceType', label: 'Reference Type' },
    { name: 'description', label: 'Description' },
    { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: [
      { value: 'verified', label: 'Verified' },
      { value: 'pending', label: 'Pending' },
      { value: 'rejected', label: 'Rejected' }
    ]},
    { name: 'accountCode', label: 'Account Code' }
  ],
  initialForm: {
    transactionType: 'income',
    account: '',
    amount: 0,
    transactionDate: '',
    referenceType: '',
    description: '',
    verificationStatus: 'verified',
  },
  mapFormToPayload: (form) => ({
    ...form,
    amount: Number(form.amount)
  }),
  mapRowToForm: (row) => ({
    transactionType: row.transactionType || 'income',
    account: row.account?._id || row.account || '',
    amount: row.amount ?? 0,
    transactionDate: row.transactionDate ? new Date(row.transactionDate).toISOString().slice(0, 10) : '',
    referenceType: row.referenceType || '',
    description: row.description || '',
    verificationStatus: row.verificationStatus || 'verified',
  })
};

const Transactions = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingTransactions: 0,
    byType: [],
    byMonth: [],
    byStatus: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTransactionStats();
  }, []);

  const fetchTransactionStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/finance/transactions`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const transactions = data.data || [];
        
        const totalTransactions = transactions.length;
        const totalIncome = transactions
          .filter(t => t.transactionType === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpenses = transactions
          .filter(t => t.transactionType === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const netBalance = totalIncome - totalExpenses;
        const pendingTransactions = transactions.filter(t => t.verificationStatus === 'pending').length;
        
        // By Type
        const byType = [
          { name: 'Income', value: totalIncome },
          { name: 'Expenses', value: totalExpenses }
        ];
        
        // By Status
        const statusMap = {};
        transactions.forEach(t => {
          const status = t.verificationStatus || 'unknown';
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        
        // By Month (last 6 months)
        const monthMap = {};
        transactions.forEach(t => {
          const date = new Date(t.transactionDate || t.createdAt);
          const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          monthMap[month] = (monthMap[month] || 0) + (t.amount || 0);
        });
        const byMonth = Object.entries(monthMap)
          .map(([name, value]) => ({ name, value }))
          .slice(-6);
        
        setStats({
          totalTransactions,
          totalIncome,
          totalExpenses,
          netBalance,
          pendingTransactions,
          byType,
          byMonth,
          byStatus
        });
      }
    } catch (err) {
      console.error('Error fetching transaction stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Finance" title="Financial Transactions">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Finance" title="Financial Transactions" subtitle="Manage income and expense transactions">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalIncome.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Net Balance</p>
              <p className="text-2xl font-bold text-slate-900">${stats.netBalance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingTransactions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
          {stats.byType.length > 0 ? (
            <PieChartComponent data={stats.byType} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Transactions by Status</h3>
          {stats.byStatus.length > 0 ? (
            <BarChartComponent data={stats.byStatus} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={transactionsConfig.title}
        subtitle={transactionsConfig.subtitle}
        endpoint={transactionsConfig.endpoint}
        columns={transactionsConfig.columns}
        createPath="/staff/finance/transactions/create"
        editPathForRow={(row) => `/staff/finance/transactions/edit/${row._id}`}
        viewPathForRow={(row) => '/staff/finance/transactions/view/' + row._id}
        searchPlaceholder="Search transactions..."
      />
    </StaffPageLayout>
  );
};

export default Transactions;

