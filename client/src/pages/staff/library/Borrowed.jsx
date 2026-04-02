import React from 'react';
import ListPage from '../shared/ListPage';

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
    { name: 'borrower', label: 'Student', type: 'relation', relationEndpoint: '/staff/students', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.name || row.userId?.name} (${row.email || row.userId?.email || 'No Email'})` },
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

const StaffLibraryBorrowed = () => (
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
);

export default StaffLibraryBorrowed;
