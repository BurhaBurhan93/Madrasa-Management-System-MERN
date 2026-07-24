import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const getSuppliersConfig = (t) => ({
  title: t('kitchen.suppliers.title', 'Suppliers'),
  subtitle: t('kitchen.suppliers.subtitle', 'Manage supplier profiles with the same clean table and action system.'),
  endpoint: '/kitchen/suppliers',
  columns: [
    { key: 'name', header: t('kitchen.suppliers.supplierName', 'Supplier Name') },
    { key: 'phone', header: t('common.phone', 'Phone') },
    { key: 'address', header: t('common.address', 'Address') },
    { key: 'itemsSupplied', header: t('kitchen.suppliers.itemsSupplied', 'Items Supplied'), render: (value) => Array.isArray(value) && value.length ? value.join(', ') : '-' },
    { key: 'status', header: t('common.status', 'Status') }
  ],
  formFields: [
    { name: 'name', label: t('kitchen.suppliers.supplierName', 'Supplier Name') },
    { name: 'phone', label: t('common.phone', 'Phone') },
    { name: 'address', label: t('common.address', 'Address') },
    { name: 'status', label: t('common.status', 'Status'), type: 'select', options: [
      { value: 'active', label: t('common.active', 'Active') },
      { value: 'inactive', label: t('common.inactive', 'Inactive') }
    ] },
    { name: 'itemsSupplied', label: t('kitchen.suppliers.itemsSupplied', 'Items Supplied'), type: 'textarea', rows: 3 },
    { name: 'notes', label: t('common.notes', 'Notes'), type: 'textarea', rows: 4 }
  ],
  initialForm: { name: '', phone: '', address: '', status: 'active', itemsSupplied: '', notes: '' },
  mapFormToPayload: (form) => ({ ...form, itemsSupplied: String(form.itemsSupplied || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) }),
  mapRowToForm: (row) => ({ name: row.name || '', phone: row.phone || '', address: row.address || '', status: row.status || 'active', itemsSupplied: Array.isArray(row.itemsSupplied) ? row.itemsSupplied.join(', ') : '', notes: row.notes || '' })
});

const Suppliers = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getSuppliersConfig(t);
  return <ListPage title={config.title} subtitle={config.subtitle} endpoint={config.endpoint} columns={config.columns} createPath="/staff/kitchen/suppliers/create" editPathForRow={(row) => `/staff/kitchen/suppliers/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/suppliers/view/${row._id}`} searchPlaceholder={t('kitchen.suppliers.searchPlaceholder', 'Search suppliers...')} clientSidePagination={true} />;
};

export default Suppliers;
