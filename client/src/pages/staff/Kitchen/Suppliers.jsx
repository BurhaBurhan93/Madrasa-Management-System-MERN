import React from 'react';
import ListPage from '../shared/ListPage';

export const suppliersConfig = {
  title: 'Suppliers',
  subtitle: 'Manage supplier profiles with the same clean table and action system.',
  endpoint: '/kitchen/suppliers',
  columns: [
    { key: 'name', header: 'Supplier Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'address', header: 'Address' },
    { key: 'itemsSupplied', header: 'Items Supplied', render: (value) => Array.isArray(value) && value.length ? value.join(', ') : '-' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'name', label: 'Supplier Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'address', label: 'Address' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] },
    { name: 'itemsSupplied', label: 'Items Supplied', type: 'textarea', rows: 3 },
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 4 }
  ],
  initialForm: { name: '', phone: '', address: '', status: 'active', itemsSupplied: '', notes: '' },
  mapFormToPayload: (form) => ({ ...form, itemsSupplied: String(form.itemsSupplied || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) }),
  mapRowToForm: (row) => ({ name: row.name || '', phone: row.phone || '', address: row.address || '', status: row.status || 'active', itemsSupplied: Array.isArray(row.itemsSupplied) ? row.itemsSupplied.join(', ') : '', notes: row.notes || '' })
};

const Suppliers = () => <ListPage title={suppliersConfig.title} subtitle={suppliersConfig.subtitle} endpoint={suppliersConfig.endpoint} columns={suppliersConfig.columns} createPath="/staff/kitchen/suppliers/create" editPathForRow={(row) => `/staff/kitchen/suppliers/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/suppliers/view/${row._id}`} searchPlaceholder="Search suppliers..." clientSidePagination={true} />;

export default Suppliers;
