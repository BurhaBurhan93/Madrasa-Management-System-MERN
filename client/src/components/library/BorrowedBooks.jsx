import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiBook, 
  FiClock, 
  FiRefreshCw, 
  FiCornerUpLeft, 
  FiAlertCircle, 
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';
import { PageSkeleton } from '../../components/UIHelper/SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/borrowed-books`, getConfig());
      setBorrowedBooks(response.data || []);
    } catch (err) {
      console.error('[BorrowedBooks] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn = async (bookId) => {
    if (!window.confirm('Confirm returning this book?')) return;
    try {
      await axios.post(`${API_BASE}/student/books/${bookId}/return`, {}, getConfig());
      await fetchBorrowedBooks();
      alert('Return request processed.');
    } catch (err) {
      alert('Failed to process return.');
    }
  };

  const handleRenew = async (bookId) => {
    try {
      await axios.post(`${API_BASE}/student/books/${bookId}/renew`, {}, getConfig());
      await fetchBorrowedBooks();
      alert('Renewal successful.');
    } catch (err) {
      alert('Renewal limit reached or failed.');
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Circulation</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Borrowed Assets</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track your active loans and return schedules</p>
        </div>
        <div className="flex gap-3">
          <div className="h-12 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
            <FiActivity className="text-cyan-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Limit: {borrowedBooks.length} / 5 Books
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Loans" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {borrowedBooks.length > 0 ? (
                borrowedBooks.map((book) => (
                  <div key={book._id} className="group p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Book Cover */}
                      <div className="w-full md:w-32 h-48 rounded-2xl bg-white shadow-lg overflow-hidden flex-shrink-0 group-hover:rotate-2 transition-transform">
                        {book.image ? (
                          <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200 text-4xl">
                            <FiBook />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-white border-none font-black text-[10px] uppercase tracking-widest mb-2">Reference #{book.isbn?.substring(0, 8) || 'GEN-LIB'}</Badge>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{book.title}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">by {book.author}</p>
                          </div>
                          <Badge variant={book.status === 'due_soon' ? 'danger' : 'warning'} className="font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">
                            {book.status?.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 bg-white/50 rounded-2xl border border-white">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                              <FiCalendar className="text-cyan-500" />
                              {new Date(book.borrowDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return Due</p>
                            <div className="flex items-center gap-2 text-sm font-black text-rose-600">
                              <FiClock />
                              {new Date(book.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            variant="primary" 
                            className="flex-1 rounded-xl py-3 font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                            onClick={() => handleRenew(book._id || book.id)}
                          >
                            <FiRefreshCw /> Renew Loan
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded-xl py-3 font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 transition-all"
                            onClick={() => handleReturn(book._id || book.id)}
                          >
                            <FiCornerUpLeft /> Return Asset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <FiBook className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No active book loans</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card title="Circulation Policy" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              {[
                { icon: <FiClock />, text: 'Standard loan period is 14 days.' },
                { icon: <FiRefreshCw />, text: 'Maximum of 2 renewals per book.' },
                { icon: <FiAlertCircle />, text: 'Late fees: $0.50 per day per item.' },
                { icon: <FiCheckCircle />, text: 'Handle all library assets with care.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-cyan-400 text-lg mt-0.5">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Need a Book?</h4>
              <p className="text-blue-100 text-sm font-medium mb-6 italic">Looking for something specific that we don't have in our catalog?</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
                Request Acquisition
              </Button>
            </div>
            <FiBook className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooks;
