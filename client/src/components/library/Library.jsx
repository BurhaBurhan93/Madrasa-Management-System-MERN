import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../UIHelper/Card';
import Badge from '../UIHelper/Badge';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';
import ErrorPage from '../UIHelper/ErrorPage';
import { PageSkeleton } from '../UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const POLL_INTERVAL = 10000;

const Library = () => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('catalog');

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchLibraryData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const [booksResponse, borrowedResponse] = await Promise.all([
        axios.get(`${API_BASE}/student/books`, getConfig()),
        axios.get(`${API_BASE}/student/borrowed-books`, getConfig())
      ]);
      setBooks(booksResponse.data || []);
      setBorrowedBooks(borrowedResponse.data || []);
    } catch (err) {
      setError('Failed to fetch library data. Please try again.');
      if (!silent) {
        setBooks([]);
        setBorrowedBooks([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLibraryData();
    const intervalId = window.setInterval(() => fetchLibraryData({ silent: true }), POLL_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, []);

  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category).filter(Boolean))],
    [books]
  );

  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          book.title?.toLowerCase().includes(search) ||
          book.author?.toLowerCase().includes(search) ||
          book.isbn?.toLowerCase().includes(search);
        const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
        return matchesSearch && matchesCategory;
      }),
    [books, searchTerm, filterCategory]
  );

  const handleBorrow = async (bookId) => {
    try {
      await axios.post(`${API_BASE}/student/books/${bookId}/borrow`, {}, getConfig());
      await fetchLibraryData({ silent: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to borrow book.');
    }
  };

  const handleReturn = async (bookId) => {
    try {
      await axios.post(`${API_BASE}/student/books/${bookId}/return`, {}, getConfig());
      await fetchLibraryData({ silent: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book.');
    }
  };

  const handleRenew = async (bookId) => {
    try {
      await axios.post(`${API_BASE}/student/books/${bookId}/renew`, {}, getConfig());
      await fetchLibraryData({ silent: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew book.');
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Services</h1>
        <p className="text-gray-600">Browse books and manage your borrowed items with live updates</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="generic"
          title="Library Service Unavailable"
          message={error}
          onRetry={fetchLibraryData}
          onHome={() => { window.location.href = '/student/dashboard'; }}
          showBackButton={false}
        />
      )}

      {loading && books.length === 0 ? (
        <PageSkeleton variant="table" />
      ) : (
        <div>
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab('catalog')} className={`py-2 px-1 border-b-2 text-sm ${activeTab === 'catalog' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Book Catalog</button>
              <button onClick={() => setActiveTab('borrowed')} className={`py-2 px-1 border-b-2 text-sm ${activeTab === 'borrowed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>My Borrowed Books</button>
            </nav>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Input label="Search Books" placeholder="Search by title, author, or ISBN" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book._id}>
                  <div className="flex gap-4">
                    <img src={book.image} alt={book.title} className="w-24 h-32 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                      <p className="text-xs text-gray-500 mb-2">ISBN: {book.isbn || 'N/A'}</p>
                      <Badge variant={book.stock > 0 ? 'success' : 'warning'}>{book.stock > 0 ? 'available' : 'out of stock'}</Badge>
                      <p className="text-xs text-gray-500 mt-2">{book.category}</p>
                      <p className="text-xs text-gray-500 mt-1">Available copies: {book.stock}</p>
                      <div className="mt-3">
                        <Button size="sm" variant="primary" disabled={book.stock <= 0} onClick={() => handleBorrow(book._id)}>
                          Borrow
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div className="space-y-6">
              {borrowedBooks.map((book) => (
                <Card key={book._id}>
                  <div className="flex gap-4">
                    <img src={book.image} alt={book.title} className="w-24 h-32 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                      <p className="text-sm text-gray-600">Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRenew(book.id)}>Renew</Button>
                        <Button size="sm" variant="danger" onClick={() => handleReturn(book.id)}>Return</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {borrowedBooks.length === 0 && (
                <Card className="text-center py-8">
                  <p className="text-gray-600">No borrowed books at the moment.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
