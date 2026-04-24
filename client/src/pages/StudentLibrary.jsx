import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiBook,
  FiSearch,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiDownload,
  FiArrowRight
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import Library from '../components/library/Library';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentLibrary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [libraryStats, setLibraryStats] = useState({
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    overdueBooks: 0,
    totalBooksRead: 0,
    dueSoon: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchLibraryStats();
  }, []);

  const fetchLibraryStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch borrowed books
      const borrowedRes = await axios.get(`${API_BASE}/student/borrowed-books`, config);
      const borrowedBooks = borrowedRes.data || [];

      const now = new Date();
      const overdueBooks = borrowedBooks.filter(book => new Date(book.dueDate) < now);
      const dueSoon = borrowedBooks.filter(book => {
        const dueDate = new Date(book.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && daysUntilDue > 0;
      });

      setLibraryStats({
        totalBorrowed: borrowedBooks.length,
        currentlyBorrowed: borrowedBooks.filter(b => b.status === 'borrowed').length,
        overdueBooks: overdueBooks.length,
        totalBooksRead: borrowedBooks.filter(b => b.status === 'returned').length,
        dueSoon: dueSoon.length
      });

      // Create recent activity from borrowed books
      const activity = borrowedBooks.slice(0, 5).map(book => ({
        id: book._id,
        type: book.status === 'borrowed' ? 'borrowed' : 'returned',
        title: book.title,
        date: book.borrowDate || book.returnDate,
        dueDate: book.dueDate
      }));
      setRecentActivity(activity);

    } catch (err) {
      console.error('Error fetching library stats:', err);
      setRecentActivity([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Library</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Library Resources</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Explore our collection of academic and spiritual literature</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate('/student/library/history')}
          >
            <FiBook className="w-4 h-4" />
            Borrowing History
          </Button>
          <div className="h-12 px-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3 text-blue-600">
            <FiBookOpen className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Digital Access</span>
          </div>
        </div>
      </div>

      {/* Library Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FiBook className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Currently Borrowed</span>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {libraryStats.currentlyBorrowed}
            </p>
            <p className="text-sm text-slate-500 mt-1">Active loans</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Due Soon</span>
            </div>
            <p className="text-3xl font-black text-amber-600">
              {libraryStats.dueSoon}
            </p>
            <p className="text-sm text-slate-500 mt-1">Due within 3 days</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overdue</span>
            </div>
            <p className="text-3xl font-black text-red-600">
              {libraryStats.overdueBooks}
            </p>
            <p className="text-sm text-slate-500 mt-1">Please return soon</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Read</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">
              {libraryStats.totalBooksRead}
            </p>
            <p className="text-sm text-slate-500 mt-1">Books returned</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {libraryStats.currentlyBorrowed > 0 || libraryStats.totalBooksRead > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Book Status Distribution" className="rounded-[32px] p-8">
            <PieChartComponent
              data={[
                { name: 'Borrowed', value: libraryStats.currentlyBorrowed },
                { name: 'Returned', value: libraryStats.totalBooksRead },
                { name: 'Overdue', value: libraryStats.overdueBooks },
                { name: 'Due Soon', value: libraryStats.dueSoon }
              ].filter(item => item.value > 0)}
              height={300}
            />
          </Card>

          <Card title="Library Activity" className="rounded-[32px] p-8">
            <BarChartComponent
              data={[
                { name: 'Currently Borrowed', value: libraryStats.currentlyBorrowed },
                { name: 'Total Read', value: libraryStats.totalBooksRead },
                { name: 'Overdue', value: libraryStats.overdueBooks }
              ]}
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-[32px] border border-slate-200">
          <FiBook className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No library activity yet</p>
          <p className="text-sm text-slate-400 mt-1">Borrow books to see your activity here</p>
        </div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Library Activity</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/student/library/history')}>
              View All <FiArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activity.type === 'borrowed' ? 'bg-cyan-100 text-cyan-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <FiBook className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{activity.title}</p>
                      <p className="text-sm text-slate-500">
                        {activity.type === 'borrowed' ? 'Borrowed' : 'Returned'} on {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.dueDate && activity.type === 'borrowed' && (
                      <Badge
                        variant={new Date(activity.dueDate) < new Date() ? 'danger' : 'warning'}
                        className="font-black uppercase tracking-widest text-[10px]"
                      >
                        Due {new Date(activity.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FiBook className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent library activity</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-4 w-full"
              onClick={() => navigate('/student/library/catalog')}
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <FiSearch className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Browse Catalog</p>
                <p className="text-sm text-slate-500">Search available books</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-4 w-full"
              onClick={() => navigate('/student/library/borrowed')}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FiBookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">My Borrowed Books</p>
                <p className="text-sm text-slate-500">View and manage loans</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-4 w-full"
              onClick={() => navigate('/student/library/history')}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Download History</p>
                <p className="text-sm text-slate-500">Get borrowing records</p>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Library Component */}
      <Library />
    </div>
  );
};

export default StudentLibrary;
