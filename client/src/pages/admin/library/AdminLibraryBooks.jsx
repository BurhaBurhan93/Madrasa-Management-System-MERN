import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import { FiBook, FiUser, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

const AdminLibraryBooks = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newBook, setNewBook] = useState({
    title: '', category: '', pages: '', publisher: '', publisherYear: '', stock: '', purchasePrice: '', salePrice: ''
  });

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: booksRes } = await api.get('/library/books');
      setBooks(Array.isArray(booksRes) ? booksRes : booksRes.data || []);
    } catch { setBooks([]); }
    try {
      const { data: catsRes } = await api.get('/library/categories');
      setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
    } catch { setCategories([]); }
    try {
      const { data: borrowedRes } = await api.get('/library/borrowed');
      const borrowed = Array.isArray(borrowedRes) ? borrowedRes : borrowedRes.data || [];
      setBorrowedCount(borrowed.filter(b => b.status === 'borrowed').length);
    } catch { setBorrowedCount(0); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, selectedCategory, pageSize]);

  const categoryNames = ['All', ...categories.map(c => c.name).filter(Boolean)];

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = (book.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const catName = book.category?.name || 'Uncategorized';
      const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const paginatedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, book) => sum + (book.stock || 0), 0);

  const handleSubmit = async () => {
    if (!newBook.title) return;
    try {
      const payload = {
        title: newBook.title,
        category: newBook.category || undefined,
        pages: Number(newBook.pages) || undefined,
        publisher: newBook.publisher || undefined,
        publisherYear: Number(newBook.publisherYear) || undefined,
        stock: Number(newBook.stock) || 0,
        purchasePrice: Number(newBook.purchasePrice) || 0,
        salePrice: Number(newBook.salePrice) || 0,
      };
      if (editingId) await api.put(`/library/books/${editingId}`, payload);
      else await api.post('/library/books', payload);
      setShowAddModal(false); setEditingId(null);
      setNewBook({ title: '', category: '', pages: '', publisher: '', publisherYear: '', stock: '', purchasePrice: '', salePrice: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (book) => {
    setNewBook({
      title: book.title || '',
      category: book.category?._id || '',
      pages: book.pages || '',
      publisher: book.publisher || '',
      publisherYear: book.publisherYear || '',
      stock: book.stock || '',
      purchasePrice: book.purchasePrice || '',
      salePrice: book.salePrice || ''
    });
    setEditingId(book._id);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('library.deleteBookConfirm'))) return;
    try { await api.delete(`/library/books/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <FiRefreshCw className="animate-spin h-6 w-6" />
        <span className="text-lg">{t('common.loading')}</span>
      </div>
    </div>
  );

  const BookCard = ({ book }) => {
    const stockPct = book.stock > 0 ? 100 : 0;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600">{book.publisher ? `${t('library.by')} ${book.publisher}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(book)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={18} /></button>
            <button onClick={() => handleDelete(book._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={18} /></button>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('library.category')}:</span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{book.category?.name || '-'}</span>
          </div>
          {book.publisherYear && <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('library.publicationYear')}:</span>
            <span className="font-medium text-gray-900">{book.publisherYear}</span>
          </div>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('library.totalCopies')}:</span>
            <span className="font-medium text-gray-900">{book.stock || 0}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">{t('library.sortByAvailability')}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${stockPct}%` }} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleEdit(book)} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm"><FiEdit2 size={14} className="inline mr-1" />{t('common.edit')}</button>
          <button onClick={() => navigate('/admin/library/borrowed')} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"><FiExternalLink size={14} className="inline mr-1" />{t('library.borrowHistory')}</button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('library.libraryBooks')}</h1>
          <p className="text-gray-600 mt-1">{t('library.manageLibraryBooks')}</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setEditingId(null); setNewBook({ title: '', category: '', pages: '', publisher: '', publisherYear: '', stock: '', purchasePrice: '', salePrice: '' }); }} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"><FiPlus size={18} /> {t('library.addNewBook')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('library.totalBooks')}</p><p className="text-2xl font-bold">{totalBooks}</p></div><div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"><FiBook size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('library.totalCopies')}</p><p className="text-2xl font-bold">{totalStock}</p></div><div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"><FiBook size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('library.availableCopies')}</p><p className="text-2xl font-bold">{totalStock}</p></div><div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"><FiBook size={24} /></div></div></Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">{t('library.borrowedCopies')}</p><p className="text-2xl font-bold">{borrowedCount}</p></div><div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"><FiUser size={24} /></div></div></Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder={t('library.searchBooks')} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categoryNames.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {paginatedBooks.length === 0 && !loading ? (
        <div className="text-center py-20 text-slate-400">{t('common.noRecords')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBooks.map(book => (<BookCard key={book._id} book={book} />))}
        </div>
      )}

      {filteredBooks.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-blue-400">
              <option value={10}>10 / {t('common.page')}</option>
              <option value={20}>20 / {t('common.page')}</option>
              <option value={50}>50 / {t('common.page')}</option>
            </select>
          </div>
          <div className="flex gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Prev</button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 5, totalPages - 9));
              const p = start + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>;
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
          </div>
        </div>
      )}

      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('library.booksByCategory')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('library.category')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('library.totalBooks')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('library.totalCopies')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(books.reduce((acc, b) => {
                const cat = b.category?.name || 'Uncategorized';
                if (!acc[cat]) acc[cat] = { count: 0, stock: 0 };
                acc[cat].count++; acc[cat].stock += (b.stock || 0);
                return acc;
              }, {})).map(([cat, data]) => (
                <tr key={cat}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? t('common.edit') : t('library.addNewBook')}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.bookTitle')} *</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} placeholder={t('library.bookTitlePlaceholder')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.category')}</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})}>
                  <option value="">{t('common.select')}</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.publicationYear')}</label><input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.publisherYear} onChange={(e) => setNewBook({...newBook, publisherYear: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.publisher')}</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.publisher} onChange={(e) => setNewBook({...newBook, publisher: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.numberOfCopies')}</label><input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.stock} onChange={(e) => setNewBook({...newBook, stock: e.target.value})} min="0" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('library.pages')}</label><input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.pages} onChange={(e) => setNewBook({...newBook, pages: e.target.value})} min="0" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label><input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.purchasePrice} onChange={(e) => setNewBook({...newBook, purchasePrice: e.target.value})} min="0" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label><input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" value={newBook.salePrice} onChange={(e) => setNewBook({...newBook, salePrice: e.target.value})} min="0" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold">{editingId ? t('common.update') : t('library.addNewBook')}</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLibraryBooks;
