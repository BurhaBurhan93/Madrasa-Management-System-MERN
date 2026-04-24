import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiBriefcase, FiDollarSign, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

export const accountsConfig = {
  title: 'Financial Accounts',
  subtitle: 'Manage financial account records',
  endpoint: '/finance/accounts',
  columns: [
    { key: 'accountCode', header: 'Account Code' },
    { key: 'accountName', header: 'Account Name' },
    { key: 'accountType', header: 'Type' },
    { key: 'openingBalance', header: 'Opening Balance' },
    { key: 'currentBalance', header: 'Current Balance' },
    { key: 'currency', header: 'Currency' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'accountCode', label: 'Account Code' },
    { name: 'accountName', label: 'Account Name' },
    { name: 'accountType', label: 'Account Type', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'petty_cash', label: 'Petty Cash' }
    ]},
    { name: 'openingBalance', label: 'Opening Balance', type: 'number' },
    { name: 'currentBalance', label: 'Current Balance', type: 'number' },
    { name: 'currency', label: 'Currency' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    accountCode: '',
    accountName: '',
    accountType: 'cash',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'USD',
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    openingBalance: Number(form.openingBalance),
    currentBalance: Number(form.currentBalance)
  })
};

const Accounts = () => {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    totalBalance: 0,
    byType: [],
    byStatus: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAccountStats();
  }, []);

  const fetchAccountStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/finance/accounts`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const accounts = data.data || [];
        
        const totalAccounts = accounts.length;
        const activeAccounts = accounts.filter(a => a.status === 'active').length;
        const inactiveAccounts = accounts.filter(a => a.status === 'inactive').length;
        const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
        
        // By Type
        const typeMap = {};
        accounts.forEach(a => {
          const type = a.accountType || 'unknown';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });
        const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
        
        // By Status
        const byStatus = [
          { name: 'Active', value: activeAccounts },
          { name: 'Inactive', value: inactiveAccounts }
        ];
        
        setStats({
          totalAccounts,
          activeAccounts,
          inactiveAccounts,
          totalBalance,
          byType,
          byStatus
        });
      }
    } catch (err) {
      console.error('Error fetching account stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Finance" title="Financial Accounts">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Finance" title="Financial Accounts" subtitle="Manage financial account records">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Accounts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalAccounts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Accounts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeAccounts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Inactive Accounts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.inactiveAccounts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalBalance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Accounts by Type</h3>
          {stats.byType.length > 0 ? (
            <BarChartComponent data={stats.byType} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Account Status Distribution</h3>
          {stats.byStatus.length > 0 ? (
            <BarChartComponent data={stats.byStatus} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={accountsConfig.title}
        subtitle={accountsConfig.subtitle}
        endpoint={accountsConfig.endpoint}
        columns={accountsConfig.columns}
        createPath="/staff/finance/accounts/create"
        editPathForRow={(row) => `/staff/finance/accounts/edit/${row._id}`}
        viewPathForRow={(row) => `/staff/finance/accounts/view/${row._id}`}
        searchPlaceholder="Search accounts..."
      />
    </StaffPageLayout>
  );
};

export default Accounts;

