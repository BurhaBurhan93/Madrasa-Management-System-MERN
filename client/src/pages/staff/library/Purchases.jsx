import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
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
    { key: 'invoiceReference', header: 'Invoice Ref' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'totalPrice', header: 'Total Price' },
    { key: 'paymentMethod', header: 'Payment' }
  ],
  formFields: [
    { name: 'purchaseCode', label: 'Purchase Code', required: true },
    { name: 'supplierName', label: 'Supplier Name' },
    { name: 'invoiceReference', label: 'Invoice Reference' },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.title, renderView: (value) => value?.title || '-' },
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
  const { t } = useTranslation(['staff', 'common']);
  const localizedConfig = useMemo(() => ({
    ...libraryPurchasesConfig,
    title: t('staff.library.purchases.title'),
    subtitle: t('staff.library.purchases.subtitle'),
    columns: libraryPurchasesConfig.columns.map(col => ({ ...col, header: t(`staff.library.purchases.column${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`) })),
    formFields: libraryPurchasesConfig.formFields.map(f => ({
      ...f,
      label: t(`staff.library.purchases.field${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`),
      options: f.options ? f.options.map(o => ({ ...o, label: t(`staff.library.purchases.option${o.value.charAt(0).toUpperCase() + o.value.slice(1)}`) })) : f.options
    }))
  }), [t]);
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
          const supplier = p.supplierName || t('common.unknown');
          supplierMap[supplier] = (supplierMap[supplier] || 0) + 1;
        });
        const bySupplier = Object.entries(supplierMap)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 8);
        
        // Monthly Trend
        const monthMap = {};
        const monthNames = [t('common.jan'), t('common.feb'), t('common.mar'), t('common.apr'), t('common.may'), t('common.jun'), t('common.jul'), t('common.aug'), t('common.sep'), t('common.oct'), t('common.nov'), t('common.dec')];
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
      console.error(t('staff.library.purchases.errorFetching'), err);
    } finally {
      setLoading(false);
    }
  };

  const headerContent = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.purchases.totalPurchases')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalPurchases}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.purchases.totalQuantity')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalQuantity}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.purchases.totalSpent')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('staff.library.purchases.thisMonth')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.recentPurchases}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.library.purchases.bySupplier')}</h3>
          {stats.bySupplier.length > 0 ? (
            <BarChartComponent data={stats.bySupplier} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{t('common.noDataAvailable')}</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">{t('staff.library.purchases.monthlyTrend')}</h3>
          {stats.monthlyPurchases.length > 0 ? (
            <BarChartComponent data={stats.monthlyPurchases} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{t('common.noDataAvailable')}</p>
          )}
        </Card>
      </div>
    </>
  );

  if (loading) {
    return (
      <ListPage
        eyebrow={t('common.library')} title={localizedConfig.title} subtitle={localizedConfig.subtitle}
        endpoint={libraryPurchasesConfig.endpoint} columns={localizedConfig.columns}
        createPath="/staff/library/purchases/create"
        editPathForRow={(row) => `/staff/library/purchases/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/purchases/view/${getId(row)}`}
        searchPlaceholder={t('staff.library.purchases.searchPlaceholder')} clientSidePagination={true}
        headerContent={<PageSkeleton type="dashboard" />}
      />
    );
  }

  return (
    <ListPage
      eyebrow={t('common.library')} title={localizedConfig.title} subtitle={localizedConfig.subtitle}
      endpoint={libraryPurchasesConfig.endpoint} columns={localizedConfig.columns}
      createPath="/staff/library/purchases/create"
      editPathForRow={(row) => `/staff/library/purchases/edit/${getId(row)}`}
      viewPathForRow={(row) => `/staff/library/purchases/view/${getId(row)}`}
      searchPlaceholder={t('staff.library.purchases.searchPlaceholder')} clientSidePagination={true}
      headerContent={headerContent}
    />
  );
};

export default StaffLibraryPurchases;
