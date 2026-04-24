import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiShoppingCart, FiDollarSign, FiTrendingUp, FiPackage } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const libraryPurchasesConfig = {
  title: 'Book Purchases',
  subtitle: 'Manage purchase records with the same reusable library management layout.',
  endpoint: '/staff/library/purchases',
  columns: [
    { key: 'purchaseCode', header: 'Purchase Code' },
    { key: 'purchaseDate', header: 'Purchase Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'supplierName', header: 'Supplier' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'totalPrice', header: 'Total Price' },
    { key: 'paymentMethod', header: 'Payment Method' }
  ],
  formFields: [
    { name: 'purchaseCode', label: 'Purchase Code', required: true },
    { name: 'supplierName', label: 'Supplier Name' },
    { name: 'invoiceReference', label: 'Invoice Reference' },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.title },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit' },
    { name: 'unitPrice', label: 'Unit Price', type: 'number', required: true },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' }
  ],
  initialForm: { purchaseCode: '', supplierName: '', invoiceReference: '', book: '', quantity: 1, unit: 'unit', unitPrice: 0, paymentMethod: 'cash', purchaseDate: '' },
  mapFormToPayload: (form) => ({ 
    ...form, 
    quantity: Number(form.quantity || 1), 
    unitPrice: Number(form.unitPrice || 0), 
    totalPrice: Number(form.quantity || 1) * Number(form.unitPrice || 0),
    purchaseDate: form.purchaseDate || new Date()
  }),
  mapRowToForm: (row) => ({ 
    purchaseCode: row.purchaseCode || '', 
    supplierName: row.supplierName || '', 
    invoiceReference: row.invoiceReference || '', 
    book: row.book?._id || row.book?.id || row.book || '', 
    quantity: row.quantity ?? 1, 
    unit: row.unit || 'unit',
    unitPrice: row.unitPrice ?? 0, 
    paymentMethod: row.paymentMethod || 'cash',
    purchaseDate: row.purchaseDate ? new Date(row.purchaseDate).toISOString().slice(0, 10) : '' 
  })
};

const StaffLibraryPurchases = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalQuantity: 0,
    totalSpent: 0,
    recentPurchases: 0,
    bySupplier: [],
    monthlyPurchases: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPurchaseStats();
  }, []);

  const fetchPurchaseStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/library/purchases`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const purchases = data.data || [];
        
        const totalPurchases = purchases.length;
        const totalQuantity = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const totalSpent = purchases.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
        
        // Recent (this month)
        const now = new Date();
        const recentPurchases = purchases.filter(p => {
          const date = new Date(p.purchaseDate);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        
        // By Supplier
        const supplierMap = {};
        purchases.forEach(p => {
          const supplier = p.supplierName || 'Unknown';
          supplierMap[supplier] = (supplierMap[supplier] || 0) + 1;
        });
        const bySupplier = Object.entries(supplierMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // Monthly Trend
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        purchases.forEach(p => {
          if (p.purchaseDate) {
            const date = new Date(p.purchaseDate);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const monthlyPurchases = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalPurchases,
          totalQuantity,
          totalSpent,
          recentPurchases,
          bySupplier,
          monthlyPurchases
        });
      }
    } catch (err) {
      console.error('Error fetching purchase stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Library" title="Book Purchases">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Library" title="Book Purchases" subtitle="Manage purchase records with the same reusable library management layout.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalPurchases}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalQuantity}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-slate-900">{stats.recentPurchases}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Purchases by Supplier</h3>
          {stats.bySupplier.length > 0 ? (
            <BarChartComponent data={stats.bySupplier} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Purchase Trend</h3>
          {stats.monthlyPurchases.length > 0 ? (
            <BarChartComponent data={stats.monthlyPurchases} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage title={libraryPurchasesConfig.title} subtitle={libraryPurchasesConfig.subtitle} endpoint={libraryPurchasesConfig.endpoint} columns={libraryPurchasesConfig.columns} createPath="/staff/library/purchases/create" editPathForRow={(row) => `/staff/library/purchases/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/library/purchases/view/${getId(row)}`} searchPlaceholder="Search purchases..." clientSidePagination={true} />
    </StaffPageLayout>
  );
};

export default StaffLibraryPurchases;
