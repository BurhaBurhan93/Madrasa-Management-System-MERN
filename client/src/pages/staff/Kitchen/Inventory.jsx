import React from 'react';
import ListPage from '../shared/ListPage';

const unitOptions = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: unit }));

export const inventoryConfig = {
  title: 'Kitchen Inventory',
  subtitle: 'Track stock levels with the same refined list and form design used across staff modules.',
  endpoint: '/kitchen/inventory',
  columns: [
    { key: 'itemName', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    { key: 'minimumStock', header: 'Minimum Stock' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'itemName', label: 'Item Name' },
    { name: 'category', label: 'Category' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unit', label: 'Unit', type: 'select', options: unitOptions },
    { name: 'minimumStock', label: 'Minimum Stock', type: 'number' },
    { name: 'unitPrice', label: 'Unit Price', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'available', label: 'Available' },
      { value: 'low', label: 'Low Stock' },
      { value: 'out', label: 'Out Of Stock' }
    ] },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 4 }
  ],
  initialForm: { itemName: '', category: '', quantity: 0, unit: 'kg', minimumStock: 0, unitPrice: 0, status: 'available', remarks: '' },
  mapFormToPayload: (form) => ({ ...form, quantity: Number(form.quantity || 0), minimumStock: Number(form.minimumStock || 0), unitPrice: Number(form.unitPrice || 0) }),
  mapRowToForm: (row) => ({ itemName: row.itemName || '', category: row.category || '', quantity: row.quantity ?? 0, unit: row.unit || 'kg', minimumStock: row.minimumStock ?? 0, unitPrice: row.unitPrice ?? 0, status: row.status || 'available', remarks: row.remarks || '' })
};

const Inventory = () => <ListPage title={inventoryConfig.title} subtitle={inventoryConfig.subtitle} endpoint={inventoryConfig.endpoint} columns={inventoryConfig.columns} createPath="/staff/kitchen/inventory/create" editPathForRow={(row) => `/staff/kitchen/inventory/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/inventory/view/${row._id}`} searchPlaceholder="Search kitchen inventory..." clientSidePagination={true} />;

export default Inventory;
