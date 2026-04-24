import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const librarySalesConfig = {
  title: 'Book Sales',
  subtitle: 'Handle book sales with the same shared library table, filters, and forms.',
  endpoint: '/staff/library/sales',
  columns: [
    { key: 'receiptNo', header: 'Receipt No' },
    { key: 'saleDate', header: 'Sale Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'student', header: 'Student', render: (value) => value?.firstName || value?.userId?.name || '-' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'totalAmount', header: 'Total Amount' }
  ],
  formFields: [
    { name: 'receiptNo', label: 'Receipt No', required: true },
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/staff/students', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.userId?.name || 'Student' },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.title },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unitPrice', label: 'Unit Price', type: 'number', required: true },
    { name: 'saleDate', label: 'Sale Date', type: 'date' }
  ],
  initialForm: { receiptNo: '', student: '', book: '', quantity: 1, unitPrice: 0, saleDate: '' },
  mapFormToPayload: (form) => ({ 
    ...form, 
    student: form.student || null, 
    quantity: Number(form.quantity || 1), 
    unitPrice: Number(form.unitPrice || 0), 
    totalAmount: Number(form.quantity || 1) * Number(form.unitPrice || 0),
    saleDate: form.saleDate || new Date()
  }),
  mapRowToForm: (row) => ({ 
    receiptNo: row.receiptNo || '', 
    student: row.student?._id || row.student?.id || row.student || '', 
    book: row.book?._id || row.book?.id || row.book || '', 
    quantity: row.quantity ?? 1, 
    unitPrice: row.unitPrice ?? 0, 
    saleDate: row.saleDate ? new Date(row.saleDate).toISOString().slice(0, 10) : '' 
  })
};

const StaffLibrarySales = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalQuantitySold: 0,
    thisMonthSales: 0,
    byStudent: [],
    monthlySales: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSalesStats();
  }, []);

  const fetchSalesStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/library/sales`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const sales = data.data || [];
        
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const totalQuantitySold = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
        
        // This month
        const now = new Date();
        const thisMonthSales = sales.filter(s => {
          const date = new Date(s.saleDate);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        
        // By Student (top buyers)
        const studentMap = {};
        sales.forEach(s => {
          const student = s.student?.name || s.student?.userId?.name || 'Walk-in';
          studentMap[student] = (studentMap[student] || 0) + 1;
        });
        const byStudent = Object.entries(studentMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
        
        // Monthly Trend
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        sales.forEach(s => {
          if (s.saleDate) {
            const date = new Date(s.saleDate);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const monthlySales = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalSales,
          totalRevenue,
          totalQuantitySold,
          thisMonthSales,
          byStudent,
          monthlySales
        });
      }
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Library" title="Book Sales">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Library" title="Book Sales" subtitle="Handle book sales with the same shared library table, filters, and forms.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalSales}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Quantity Sold</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalQuantitySold}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-slate-900">{stats.thisMonthSales}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Top Buyers</h3>
          {stats.byStudent.length > 0 ? (
            <PieChartComponent data={stats.byStudent} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Sales Trend</h3>
          {stats.monthlySales.length > 0 ? (
            <BarChartComponent data={stats.monthlySales} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage title={librarySalesConfig.title} subtitle={librarySalesConfig.subtitle} endpoint={librarySalesConfig.endpoint} columns={librarySalesConfig.columns} createPath="/staff/library/sales/create" editPathForRow={(row) => `/staff/library/sales/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/library/sales/view/${getId(row)}`} searchPlaceholder="Search sales..." clientSidePagination={true} />
    </StaffPageLayout>
  );
};

export default StaffLibrarySales;
