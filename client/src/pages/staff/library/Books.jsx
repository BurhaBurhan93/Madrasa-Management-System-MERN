import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
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
    { key: 'category', header: 'Category', render: (value, row) => row?.categoryName || '-' },
    { key: 'publisher', header: 'Publisher' },
    { key: 'publisherYear', header: 'Pub. Year' },
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
  const { t } = useTranslation(['staff', 'common']);
  const localizedConfig = useMemo(() => ({
    ...libraryBooksConfig,
    title: t('staff.library.books.title'),
    subtitle: t('staff.library.books.subtitle'),
    columns: libraryBooksConfig.columns.map(col => ({ ...col, header: t(`staff.library.books.column${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`) })),
    formFields: libraryBooksConfig.formFields.map(f => ({ ...f, label: t(`staff.library.books.field${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`) }))
  }), [t]);
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
          const cat = b.category?.name || t('common.uncategorized');
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // Stock Distribution
        const stockRanges = {
          [t('staff.library.books.outOfStock')]: books.filter(b => (b.stock || 0) === 0).length,
          [t('staff.library.books.lowRange')]: books.filter(b => (b.stock || 0) >= 1 && (b.stock || 0) <= 5).length,
          [t('staff.library.books.mediumRange')]: books.filter(b => (b.stock || 0) > 5 && (b.stock || 0) <= 20).length,
          [t('staff.library.books.highRange')]: books.filter(b => (b.stock || 0) > 20).length
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
      console.error(t('staff.library.books.errorFetching'), err);
    } finally {
      setLoading(false);
    }
  };

  const headerContent = stats.byCategory.length > 0 ? (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.books.totalBooks')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.books.totalStock')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStock}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.books.inventoryValue')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.books.lowStock')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.lowStockBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.library.books.booksByCategory')}</h3>
          <PieChartComponent data={stats.byCategory} height={250} />
        </Card>
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.library.books.stockDistribution')}</h3>
          <BarChartComponent data={stats.stockDistribution} dataKey="value" nameKey="name" height={250} />
        </Card>
      </div>
    </>
  ) : null;

  if (loading) {
    return (
      <ListPage
        eyebrow={t('common.library')} title={localizedConfig.title} subtitle={localizedConfig.subtitle}
        endpoint={libraryBooksConfig.endpoint} columns={localizedConfig.columns}
        createPath="/staff/library/books/create"
        editPathForRow={(row) => `/staff/library/books/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/books/view/${getId(row)}`}
        searchPlaceholder={t('staff.library.books.searchPlaceholder')} clientSidePagination={true}
        headerContent={<PageSkeleton type="dashboard" />}
      />
    );
  }

  return (
    <ListPage
      eyebrow={t('common.library')} title={localizedConfig.title} subtitle={localizedConfig.subtitle}
      endpoint={libraryBooksConfig.endpoint} columns={localizedConfig.columns}
      createPath="/staff/library/books/create"
      editPathForRow={(row) => `/staff/library/books/edit/${getId(row)}`}
      viewPathForRow={(row) => `/staff/library/books/view/${getId(row)}`}
      searchPlaceholder={t('staff.library.books.searchPlaceholder')} clientSidePagination={true}
      headerContent={headerContent}
    />
  );
};

export default StaffLibraryBooks;
