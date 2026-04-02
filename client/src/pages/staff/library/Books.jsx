import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const libraryBooksConfig = {
  title: 'Library Books',
  subtitle: 'Manage books with the same polished list, filter, and form experience.',
  endpoint: '/staff/library/books',
  columns: [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    { key: 'category', header: 'Category' },
    { key: 'isbn', header: 'ISBN' },
    { key: 'stock', header: 'Stock' },
    { key: 'available', header: 'Available' }
  ],
  formFields: [
    { name: 'title', label: 'Title' },
    { name: 'author', label: 'Author' },
    { name: 'isbn', label: 'ISBN' },
    { name: 'category', label: 'Category', type: 'relation', relationEndpoint: '/staff/library/categories', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.name },
    { name: 'stock', label: 'Stock', type: 'number' },
    { name: 'available', label: 'Available', type: 'number' }
  ],
  initialForm: { title: '', author: '', isbn: '', category: '', stock: 0, available: 0 },
  mapFormToPayload: (form) => ({ ...form, stock: Number(form.stock || 0), available: Number(form.available || form.stock || 0) }),
  mapRowToForm: (row) => ({ title: row.title || '', author: row.author || '', isbn: row.isbn || '', category: row.category?._id || row.category || '', stock: row.stock ?? 0, available: row.available ?? row.stock ?? 0 })
};

const StaffLibraryBooks = () => (
  <ListPage
    title={libraryBooksConfig.title}
    subtitle={libraryBooksConfig.subtitle}
    endpoint={libraryBooksConfig.endpoint}
    columns={libraryBooksConfig.columns}
    createPath="/staff/library/books/create"
    editPathForRow={(row) => `/staff/library/books/edit/${getId(row)}`}
    viewPathForRow={(row) => `/staff/library/books/view/${getId(row)}`}
    searchPlaceholder="Search books..."
    clientSidePagination={true}
  />
);

export default StaffLibraryBooks;
