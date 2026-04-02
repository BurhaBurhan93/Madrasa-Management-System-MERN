import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const librarySalesConfig = {
  title: 'Book Sales',
  subtitle: 'Handle book sales with the same shared library table, filters, and forms.',
  endpoint: '/staff/library/sales',
  columns: [
    { key: 'student', header: 'Student', render: (value) => value?.name || value?.userId?.name || '-' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'totalAmount', header: 'Total Amount' },
    { key: 'receiptNo', header: 'Receipt No' },
    { key: 'saleDate', header: 'Sale Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/staff/students', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.name || row.userId?.name || 'Student' },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.title },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unitPrice', label: 'Unit Price', type: 'number' },
    { name: 'saleDate', label: 'Sale Date', type: 'date' },
    { name: 'receiptNo', label: 'Receipt No' }
  ],
  initialForm: { student: '', book: '', quantity: 1, unitPrice: 0, saleDate: '', receiptNo: '' },
  mapFormToPayload: (form) => ({ ...form, student: form.student || null, quantity: Number(form.quantity || 1), unitPrice: Number(form.unitPrice || 0), totalAmount: Number(form.quantity || 1) * Number(form.unitPrice || 0) }),
  mapRowToForm: (row) => ({ student: row.student?._id || row.student?.id || row.student || '', book: row.book?._id || row.book?.id || row.book || '', quantity: row.quantity ?? 1, unitPrice: row.unitPrice ?? 0, saleDate: row.saleDate ? new Date(row.saleDate).toISOString().slice(0, 10) : '', receiptNo: row.receiptNo || '' })
};

const StaffLibrarySales = () => <ListPage title={librarySalesConfig.title} subtitle={librarySalesConfig.subtitle} endpoint={librarySalesConfig.endpoint} columns={librarySalesConfig.columns} createPath="/staff/library/sales/create" editPathForRow={(row) => `/staff/library/sales/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/library/sales/view/${getId(row)}`} searchPlaceholder="Search sales..." clientSidePagination={true} />;

export default StaffLibrarySales;
