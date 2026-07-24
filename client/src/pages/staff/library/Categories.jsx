import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiTag, FiBook, FiLayers } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';

const getId = (row) => row?._id || row?.id;

export const libraryCategoriesConfig = {
  title: 'Library Categories',
  subtitle: 'Manage category records with the unified library table and form design.',
  endpoint: '/staff/library/categories',
  columns: [
    { key: 'name', header: 'Category Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ],
  formFields: [
    { name: 'name', label: 'Category Name' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ],
  initialForm: { name: '', description: '' },
  mapRowToForm: (row) => ({ name: row.name || '', description: row.description || '' })
};

const StaffLibraryCategories = () => {
  const { t } = useTranslation(['staff', 'common']);
  const localizedConfig = useMemo(() => ({
    ...libraryCategoriesConfig,
    title: t('library.categories.title'),
    subtitle: t('library.categories.subtitle'),
    columns: libraryCategoriesConfig.columns.map(col => ({ ...col, header: t(`library.categories.column${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`) })),
    formFields: libraryCategoriesConfig.formFields.map(f => ({ ...f, label: t(`library.categories.field${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`) }))
  }), [t]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBooks: 0,
    averageBooksPerCategory: 0,
    byBookCount: []
  });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const catRes = await apiFetch('/staff/library/categories');
      const catData = await parseJsonSafe(catRes);
      const categories = catData.data || [];

      const booksRes = await apiFetch('/staff/library/books');
      const booksData = await parseJsonSafe(booksRes);
      const books = booksData.data || [];

      setItems(categories);
      const totalCategories = categories.length;
      const totalBooks = books.length;
      const averageBooksPerCategory = totalCategories > 0 ? (totalBooks / totalCategories).toFixed(1) : 0;

      const categoryBookMap = {};
      categories.forEach(cat => {
        const catName = cat.name || t('common.uncategorized');
        const bookCount = books.filter(b =>
          b.category?._id === cat._id || b.category === cat._id || b.category === catName
        ).length;
        categoryBookMap[catName] = bookCount;
      });

      const byBookCount = Object.entries(categoryBookMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setStats({ totalCategories, totalBooks, averageBooksPerCategory, byBookCount });
    } catch (err) {
      console.error(t('library.categories.errorFetching'), err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ListPage
        eyebrow={t('common.library')}
        title={localizedConfig.title}
        subtitle={localizedConfig.subtitle}
        endpoint={libraryCategoriesConfig.endpoint}
        columns={localizedConfig.columns}
        createPath="/staff/library/categories/create"
        editPathForRow={(row) => `/staff/library/categories/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/categories/view/${getId(row)}`}
        searchPlaceholder={t('library.categories.searchPlaceholder')}
        clientSidePagination={true}
        headerContent={<PageSkeleton type="dashboard" />}
      />
    );
  }

  const headerContent = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('library.categories.totalCategories')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiTag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('library.categories.totalBooks')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiBook className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('library.categories.avgBooksPerCategory')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.averageBooksPerCategory}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiLayers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {stats.byBookCount.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="rounded-[28px] border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('library.categories.booksPerCategory')}</h3>
            <BarChartComponent data={stats.byBookCount} dataKey="value" nameKey="name" height={250} />
          </Card>
        </div>
      )}
    </>
  );

  return (
    <ListPage
      eyebrow={t('common.library')}
      title={localizedConfig.title}
      subtitle={localizedConfig.subtitle}
      endpoint={libraryCategoriesConfig.endpoint}
      columns={localizedConfig.columns}
      createPath="/staff/library/categories/create"
      editPathForRow={(row) => `/staff/library/categories/edit/${getId(row)}`}
      viewPathForRow={(row) => `/staff/library/categories/view/${getId(row)}`}
      searchPlaceholder={t('library.categories.searchPlaceholder')}
      clientSidePagination={true}
      headerContent={headerContent}
    />
  );
};

export default StaffLibraryCategories;
