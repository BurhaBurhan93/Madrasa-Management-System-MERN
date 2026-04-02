import React from 'react';
import ListPage from '../shared/ListPage';

const unitOptions = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: unit }));

export const wasteConfig = {
  title: 'Waste Tracking',
  subtitle: 'Monitor waste records using the same polished table, filters, and form structure.',
  endpoint: '/kitchen/waste',
  columns: [
    { key: 'itemName', header: 'Item Name' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    { key: 'wasteDate', header: 'Waste Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'reason', header: 'Reason' },
    { key: 'remarks', header: 'Remarks' }
  ],
  formFields: [
    { name: 'itemName', label: 'Item Name' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unit', label: 'Unit', type: 'select', options: unitOptions },
    { name: 'wasteDate', label: 'Waste Date', type: 'date' },
    { name: 'reason', label: 'Reason', type: 'select', options: [
      { value: 'spoiled', label: 'Spoiled' },
      { value: 'expired', label: 'Expired' },
      { value: 'overcooked', label: 'Overcooked' },
      { value: 'other', label: 'Other' }
    ] },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 4 }
  ],
  initialForm: { itemName: '', quantity: 0, unit: 'kg', wasteDate: '', reason: 'spoiled', remarks: '' },
  mapFormToPayload: (form) => ({ ...form, quantity: Number(form.quantity || 0) }),
  mapRowToForm: (row) => ({ itemName: row.itemName || '', quantity: row.quantity ?? 0, unit: row.unit || 'kg', wasteDate: row.wasteDate ? new Date(row.wasteDate).toISOString().slice(0, 10) : '', reason: row.reason || 'spoiled', remarks: row.remarks || '' })
};

const WasteTracking = () => <ListPage title={wasteConfig.title} subtitle={wasteConfig.subtitle} endpoint={wasteConfig.endpoint} columns={wasteConfig.columns} createPath="/staff/kitchen/waste/create" editPathForRow={(row) => `/staff/kitchen/waste/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/waste/view/${row._id}`} searchPlaceholder="Search waste records..." clientSidePagination={true} />;

export default WasteTracking;
