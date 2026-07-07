import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiRefreshCw, FiBook, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const LibraryReports = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalBorrowed: 0, totalPurchases: 0, totalSales: 0 });
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, booksRes, borrowedRes, purchasesRes, salesRes] = await Promise.all([
          api.get('/library/reports'),
          api.get('/library/books'),
          api.get('/library/borrowed'),
          api.get('/library/purchases'),
          api.get('/library/sales'),
        ]);
        const extract = r => r.data?.data || r.data || [];
        setStats(statsRes.data?.data || { totalBooks: 0, totalBorrowed: 0, totalPurchases: 0, totalSales: 0 });
        setBooks(extract(booksRes));
        setBorrowed(extract(borrowedRes));
        setPurchases(extract(purchasesRes));
        setSales(extract(salesRes));
      } catch { } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    books.forEach(b => {
      const cat = b.category?.name || 'Uncategorized';
      if (!map[cat]) map[cat] = { count: 0, stock: 0 };
      map[cat].count++;
      map[cat].stock += b.stock || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [books]);

  const recentBorrowed = useMemo(() => borrowed.slice(0, 5), [borrowed]);
  const recentPurchases = useMemo(() => purchases.slice(0, 5), [purchases]);
  const recentSales = useMemo(() => sales.slice(0, 5), [sales]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <FiRefreshCw className="animate-spin h-6 w-6" />
        <span className="text-lg">{t('common.loading')}</span>
      </div>
    </div>
  );

  const statCards = [
    { label: t('library.totalBooks'), value: stats.totalBooks, gradient: 'from-blue-500 to-blue-600', icon: FiBook },
    { label: t('library.borrowed'), value: stats.totalBorrowed, gradient: 'from-emerald-500 to-teal-600', icon: FiUsers },
    { label: t('library.bookPurchases'), value: stats.totalPurchases, gradient: 'from-amber-500 to-orange-600', icon: FiShoppingCart },
    { label: t('library.bookSales'), value: stats.totalSales, gradient: 'from-cyan-500 to-blue-600', icon: FiDollarSign },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('library.libraryReports')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('library.libraryAnalytics')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-lg`}>
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </div>
            <s.icon className="absolute right-3 top-3 h-12 w-12 text-white/10" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">{t('library.booksByCategory')}</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noRecords')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100"><th className="pb-2 font-semibold text-slate-600">{t('library.category')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.totalBooks')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.totalCopies')}</th></tr></thead>
              <tbody>
                {categoryBreakdown.map(([cat, data]) => (
                  <tr key={cat} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 text-slate-700">{cat}</td>
                    <td className="py-2.5 text-slate-600">{data.count}</td>
                    <td className="py-2.5 text-slate-600">{data.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">{t('library.borrowedBooks')}</h3>
          {recentBorrowed.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noRecords')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100"><th className="pb-2 font-semibold text-slate-600">{t('library.book')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.borrowerName')}</th><th className="pb-2 font-semibold text-slate-600">{t('common.status')}</th></tr></thead>
              <tbody>
                {recentBorrowed.map(item => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 text-slate-700">{item.book?.title || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.borrower ? `${item.borrower.firstName || ''} ${item.borrower.lastName || ''}`.trim() || '-' : '-'}</td>
                    <td className="py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : item.status === 'borrowed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{item.status || '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800"><FiShoppingCart className="inline mr-2" size={18} />{t('library.bookPurchases')}</h3>
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noRecords')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100"><th className="pb-2 font-semibold text-slate-600">{t('library.book')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.supplier')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.qty')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.price')}</th></tr></thead>
              <tbody>
                {recentPurchases.map(item => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 text-slate-700">{item.book?.title || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.supplierName || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.quantity || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.totalPrice ? `Rs. ${item.totalPrice}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800"><FiTrendingUp className="inline mr-2" size={18} />{t('library.bookSales')}</h3>
          {recentSales.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noRecords')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100"><th className="pb-2 font-semibold text-slate-600">{t('library.book')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.buyer')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.qty')}</th><th className="pb-2 font-semibold text-slate-600">{t('library.price')}</th></tr></thead>
              <tbody>
                {recentSales.map(item => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 text-slate-700">{item.book?.title || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.student?.firstName ? `${item.student.firstName} ${item.student.lastName || ''}` : item.buyerName || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.quantity || '-'}</td>
                    <td className="py-2.5 text-slate-600">{item.totalAmount ? `Rs. ${item.totalAmount}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryReports;
