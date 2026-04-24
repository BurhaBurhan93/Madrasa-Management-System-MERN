import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiBook, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const libraryBooksConfig = {
  title: 'Library Books',
  subtitle: 'Manage books with the same polished list, filter, and form experience.',
  endpoint: '/staff/library/books',
  columns: [
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category', render: (value) => value?.name || '-' },
    { key: 'publisher', header: 'Publisher' },
    { key: 'pages', header: 'Pages' },
    { key: 'stock', header: 'Stock' },
    { key: 'purchasePrice', header: 'Purchase Price' },
    { key: 'salePrice', header: 'Sale Price' }
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Category', type: 'relation', relationEndpoint: '/staff/library/categories', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.name },
    { name: 'pages', label: 'Pages', type: 'number' },
    { name: 'publisher', label: 'Publisher' },
    { name: 'publisherYear', label: 'Publisher Year', type: 'number' },
    { name: 'stock', label: 'Stock', type: 'number' },
    { name: 'purchasePrice', label: 'Purchase Price', type: 'number' },
    { name: 'salePrice', label: 'Sale Price', type: 'number' }
  ],
  initialForm: { title: '', category: '', pages: '', publisher: '', publisherYear: '', stock: 0, purchasePrice: 0, salePrice: 0 },
  mapFormToPayload: (form) => ({ 
    ...form, 
    pages: Number(form.pages || 0), 
    publisherYear: form.publisherYear ? Number(form.publisherYear) : undefined,
    stock: Number(form.stock || 0), 
    purchasePrice: Number(form.purchasePrice || 0), 
    salePrice: Number(form.salePrice || 0)
  }),
  mapRowToForm: (row) => ({ 
    title: row.title || '', 
    category: row.category?._id || row.category || '', 
    pages: row.pages || '', 
    publisher: row.publisher || '',
    publisherYear: row.publisherYear || '',
    stock: row.stock ?? 0, 
    purchasePrice: row.purchasePrice ?? 0,
    salePrice: row.salePrice ?? 0
  })
};

const StaffLibraryBooks = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStock: 0,
    lowStockBooks: 0,
    totalValue: 0,
    byCategory: [],
    stockDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBookStats();
  }, []);

  const fetchBookStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/library/books`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const books = data.data || [];
        
        const totalBooks = books.length;
        const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
        const lowStockBooks = books.filter(b => (b.stock || 0) < 5).length;
        const totalValue = books.reduce((sum, b) => sum + ((b.purchasePrice || 0) * (b.stock || 0)), 0);
        
        // By Category
        const categoryMap = {};
        books.forEach(b => {
          const cat = b.category?.name || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // Stock Distribution
        const stockRanges = {
          'Out of Stock': books.filter(b => (b.stock || 0) === 0).length,
          'Low (1-5)': books.filter(b => (b.stock || 0) >= 1 && (b.stock || 0) <= 5).length,
          'Medium (6-20)': books.filter(b => (b.stock || 0) > 5 && (b.stock || 0) <= 20).length,
          'High (21+)': books.filter(b => (b.stock || 0) > 20).length
        };
        const stockDistribution = Object.entries(stockRanges)
          .filter(([, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalBooks,
          totalStock,
          lowStockBooks,
          totalValue,
          byCategory,
          stockDistribution
        });
      }
    } catch (err) {
      console.error('Error fetching book stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Library" title="Library Books">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Library" title="Library Books" subtitle="Manage books with the same polished list, filter, and form experience.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Books</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Stock</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStock}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Inventory Value</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lowStockBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Books by Category</h3>
          {stats.byCategory.length > 0 ? (
            <PieChartComponent data={stats.byCategory} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Stock Distribution</h3>
          {stats.stockDistribution.length > 0 ? (
            <BarChartComponent data={stats.stockDistribution} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={libraryBooksConfig.title}
        subtitle={libraryBooksConfig.subtitle}
        endpoint={libraryBooksConfig.endpoint}
        columns={libraryBooksConfig.columns}
        createPath="/staff/library/books/create"
        editPathForRow={(row) => `/staff/library/books/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/books/view/${getId(row)}`}
        searchPlaceholder="Search books..."
        clientSidePagination={true}
      />
    </StaffPageLayout>
  );
};

export default StaffLibraryBooks;
