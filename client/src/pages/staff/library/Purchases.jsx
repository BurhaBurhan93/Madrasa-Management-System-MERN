import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const libraryPurchasesConfig = {
  title: 'Book Purchases',
  subtitle: 'Manage purchase records with the same reusable library management layout.',
  endpoint: '/staff/library/purchases',
  columns: [
    { key: 'supplierName', header: 'Supplier' },
    { key: 'invoiceReference', header: 'Invoice' },
    { key: 'book', header: 'Book', render: (value) => value?.title || '-' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'totalPrice', header: 'Total Price' },
    { key: 'purchaseDate', header: 'Purchase Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' }
  ],
  formFields: [
    { name: 'supplierName', label: 'Supplier Name' },
    { name: 'invoiceReference', label: 'Invoice Reference' },
    { name: 'book', label: 'Book', type: 'relation', relationEndpoint: '/staff/library/books', relationValue: (row) => row._id || row.id, relationLabel: (row) => row.title },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unitPrice', label: 'Unit Price', type: 'number' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' }
  ],
  initialForm: { supplierName: '', invoiceReference: '', book: '', quantity: 1, unitPrice: 0, purchaseDate: '' },
  mapFormToPayload: (form) => ({ ...form, quantity: Number(form.quantity || 1), unitPrice: Number(form.unitPrice || 0), totalPrice: Number(form.quantity || 1) * Number(form.unitPrice || 0) }),
  mapRowToForm: (row) => ({ supplierName: row.supplierName || '', invoiceReference: row.invoiceReference || '', book: row.book?._id || row.book?.id || row.book || '', quantity: row.quantity ?? 1, unitPrice: row.unitPrice ?? 0, purchaseDate: row.purchaseDate ? new Date(row.purchaseDate).toISOString().slice(0, 10) : '' })
};

const StaffLibraryPurchases = () => <ListPage title={libraryPurchasesConfig.title} subtitle={libraryPurchasesConfig.subtitle} endpoint={libraryPurchasesConfig.endpoint} columns={libraryPurchasesConfig.columns} createPath="/staff/library/purchases/create" editPathForRow={(row) => `/staff/library/purchases/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/library/purchases/view/${getId(row)}`} searchPlaceholder="Search purchases..." clientSidePagination={true} />;

export default StaffLibraryPurchases;
