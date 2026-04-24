import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiTag, FiBook, FiLayers } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const libraryCategoriesConfig = {
  title: 'Library Categories',
  subtitle: 'Manage category records with the unified library table and form design.',
  endpoint: '/staff/library/categories',
  columns: [
    { key: 'name', header: 'Category Name' },
    { key: 'description', header: 'Description' }
  ],
  formFields: [
    { name: 'name', label: 'Category Name' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ],
  initialForm: { name: '', description: '' },
  mapRowToForm: (row) => ({ name: row.name || '', description: row.description || '' })
};

const StaffLibraryCategories = () => {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBooks: 0,
    averageBooksPerCategory: 0,
    byBookCount: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/library/categories`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const categories = data.data || [];
        
        const totalCategories = categories.length;
        
        // Fetch books to calculate books per category
        const booksRes = await fetch(`${API_BASE}/staff/library/books`, config);
        const booksData = await booksRes.json();
        const books = booksData.data || [];
        
        const totalBooks = books.length;
        const averageBooksPerCategory = totalCategories > 0 ? (totalBooks / totalCategories).toFixed(1) : 0;
        
        // Books per category distribution
        const categoryBookMap = {};
        categories.forEach(cat => {
          const catName = cat.name || 'Uncategorized';
          const bookCount = books.filter(b => 
            b.category?._id === cat._id || b.category === cat._id || b.category === catName
          ).length;
          categoryBookMap[catName] = bookCount;
        });
        
        const byBookCount = Object.entries(categoryBookMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
        
        setStats({
          totalCategories,
          totalBooks,
          averageBooksPerCategory,
          byBookCount
        });
      }
    } catch (err) {
      console.error('Error fetching category stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Library" title="Library Categories">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Library" title="Library Categories" subtitle="Manage category records with the unified library table and form design.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Categories</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiTag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Books</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiBook className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Avg Books/Category</p>
              <p className="text-2xl font-bold text-slate-900">{stats.averageBooksPerCategory}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiLayers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Books per Category</h3>
          {stats.byBookCount.length > 0 ? (
            <BarChartComponent data={stats.byBookCount} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={libraryCategoriesConfig.title}
        subtitle={libraryCategoriesConfig.subtitle}
        endpoint={libraryCategoriesConfig.endpoint}
        columns={libraryCategoriesConfig.columns}
        createPath="/staff/library/categories/create"
        editPathForRow={(row) => `/staff/library/categories/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/categories/view/${getId(row)}`}
        searchPlaceholder="Search categories..."
        clientSidePagination={true}
      />
    </StaffPageLayout>
  );
};

export default StaffLibraryCategories;
