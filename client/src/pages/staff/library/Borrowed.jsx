import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import { FiBookOpen, FiCheckSquare, FiClock, FiCalendar } from 'react-icons/fi';

const getId = (row) => row?._id || row?.id;

export const libraryBorrowedConfig = {
  title: 'Borrowed Books',
  subtitle: 'Track borrowed and returned books with the same unified library workflow.',
  endpoint: '/staff/library/borrowed',
  columns: [
    { key: 'borrower', header: 'Student', render: (value) => value?.name || value?.userId?.name || '-' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'borrowedAt', header: 'Borrow Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'returnDate', header: 'Return Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'borrower', label: 'Student', type: 'relation', relationEndpoint: '/staff/students', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.name || row.firstName || 'Unknown'} (${row.studentId || row.email || ''})` },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.title} (${row.stock || 0} in stock)` },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'borrowed', label: 'Borrowed' },
      { value: 'returned', label: 'Returned' }
    ] },
    { name: 'returnDate', label: 'Return Date', type: 'date' }
  ],
  initialForm: { borrower: '', book: '', status: 'borrowed', returnDate: '' },
  mapRowToForm: (row) => ({ borrower: row.borrower?._id || row.borrower?.id || row.borrower || '', book: row.book?._id || row.book?.id || row.book || '', status: row.status || 'borrowed', returnDate: row.returnDate ? new Date(row.returnDate).toISOString().slice(0, 10) : '' })
};

const StaffLibraryBorrowed = () => {
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    returned: 0,
    overdue: 0,
    byStatus: [],
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBorrowedStats();
  }, []);

  const fetchBorrowedStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/staff/library/borrowed`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const borrowed = data.data || [];
        
        const totalBorrowed = borrowed.length;
        const currentlyBorrowed = borrowed.filter(b => b.status === 'borrowed').length;
        const returned = borrowed.filter(b => b.status === 'returned').length;
        
        const now = new Date();
        const overdue = borrowed.filter(b => {
          if (b.status === 'returned' || !b.returnDate) return false;
          return new Date(b.returnDate) < now;
        }).length;
        
        // By Status
        const statusMap = {};
        borrowed.forEach(b => {
          const status = b.status || 'unknown';
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        
        // Monthly Trend (last 6 months)
        const monthMap = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        borrowed.forEach(b => {
          if (b.borrowedAt) {
            const date = new Date(b.borrowedAt);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const monthlyTrend = Object.entries(monthMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-6)
          .map(([name, value]) => ({ name, value }));
        
        setStats({
          totalBorrowed,
          currentlyBorrowed,
          returned,
          overdue,
          byStatus,
          monthlyTrend
        });
      }
    } catch (err) {
      console.error('Error fetching borrowed stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Library" title="Borrowed Books">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Library" title="Borrowed Books" subtitle="Track borrowed and returned books with the same unified library workflow.">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBorrowed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Currently Borrowed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.currentlyBorrowed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Returned</p>
              <p className="text-2xl font-bold text-slate-900">{stats.returned}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiCheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-slate-900">{stats.overdue}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Borrowing Status Distribution</h3>
          {stats.byStatus.length > 0 ? (
            <PieChartComponent data={stats.byStatus} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Borrowing Trend</h3>
          {stats.monthlyTrend.length > 0 ? (
            <BarChartComponent data={stats.monthlyTrend} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
      <ListPage
        title={libraryBorrowedConfig.title}
        subtitle={libraryBorrowedConfig.subtitle}
        endpoint={libraryBorrowedConfig.endpoint}
        columns={libraryBorrowedConfig.columns}
        createPath="/staff/library/borrowed/create"
        editPathForRow={(row) => `/staff/library/borrowed/edit/${getId(row)}`}
        viewPathForRow={(row) => `/staff/library/borrowed/view/${getId(row)}`}
        searchPlaceholder="Search borrowed records..."
        clientSidePagination={true}
        deleteEnabled={false}
        extraActionItemsForRow={(row) => row.status === 'borrowed' ? [{ label: 'Mark Returned', className: 'text-emerald-700 hover:bg-emerald-50', onClick: async () => { await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/staff/library/borrowed/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'returned', returnDate: new Date().toISOString() }) }); window.location.reload(); } }] : []}
      />
    </StaffPageLayout>
  );
};

export default StaffLibraryBorrowed;
