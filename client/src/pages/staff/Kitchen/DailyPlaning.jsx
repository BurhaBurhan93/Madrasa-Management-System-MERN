import React from 'react';
import ListPage from '../shared/ListPage';

const unitOptions = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: unit }));

export const consumptionConfig = {
  title: 'Daily Food Consumption',
  subtitle: 'Track daily meal consumption with a clean kitchen operations table.',
  endpoint: '/kitchen/consumption',
  columns: [
    { key: 'consumptionDate', header: 'Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'mealType', header: 'Meal Type' },
    { key: 'numberOfStudents', header: 'Students' },
    { key: 'numberOfStaff', header: 'Staff' },
    { key: 'itemName', header: 'Item Name' },
    { key: 'quantityUsed', header: 'Quantity Used' },
    { key: 'unit', header: 'Unit' }
  ],
  formFields: [
    { name: 'consumptionDate', label: 'Consumption Date', type: 'date' },
    { name: 'mealType', label: 'Meal Type', type: 'select', options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' }
    ] },
    { name: 'numberOfStudents', label: 'Number Of Students', type: 'number' },
    { name: 'numberOfStaff', label: 'Number Of Staff', type: 'number' },
    { name: 'itemName', label: 'Item Name' },
    { name: 'quantityUsed', label: 'Quantity Used', type: 'number' },
    { name: 'unit', label: 'Unit', type: 'select', options: unitOptions },
    { name: 'preparedBy', label: 'Prepared By' },
    { name: 'supervisedBy', label: 'Supervised By' },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 4 }
  ],
  initialForm: { consumptionDate: '', mealType: 'breakfast', numberOfStudents: 0, numberOfStaff: 0, itemName: '', quantityUsed: 0, unit: 'kg', preparedBy: '', supervisedBy: '', remarks: '' },
  mapFormToPayload: (form) => ({ ...form, numberOfStudents: Number(form.numberOfStudents || 0), numberOfStaff: Number(form.numberOfStaff || 0), quantityUsed: Number(form.quantityUsed || 0) }),
  mapRowToForm: (row) => ({ consumptionDate: row.consumptionDate ? new Date(row.consumptionDate).toISOString().slice(0, 10) : '', mealType: row.mealType || 'breakfast', numberOfStudents: row.numberOfStudents ?? 0, numberOfStaff: row.numberOfStaff ?? 0, itemName: row.itemName || '', quantityUsed: row.quantityUsed ?? 0, unit: row.unit || 'kg', preparedBy: row.preparedBy || '', supervisedBy: row.supervisedBy || '', remarks: row.remarks || '' })
};

const DailyPlaning = () => <ListPage title={consumptionConfig.title} subtitle={consumptionConfig.subtitle} endpoint={consumptionConfig.endpoint} columns={consumptionConfig.columns} createPath="/staff/kitchen/menu/create" editPathForRow={(row) => `/staff/kitchen/menu/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/menu/view/${row._id}`} searchPlaceholder="Search daily consumption..." clientSidePagination={true} />;

export default DailyPlaning;
