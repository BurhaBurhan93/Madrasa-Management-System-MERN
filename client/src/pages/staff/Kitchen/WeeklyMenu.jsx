import React from 'react';
import ListPage from '../shared/ListPage';

export const weeklyMenuConfig = {
  title: 'Weekly Menu',
  subtitle: 'Plan weekly meal schedules with the same professional kitchen management layout.',
  endpoint: '/kitchen/menu',
  columns: [
    { key: 'weekStartDate', header: 'Week Start', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'weekEndDate', header: 'Week End', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'day', header: 'Day' },
    { key: 'mealType', header: 'Meal Type' },
    { key: 'menuItems', header: 'Menu Items', render: (value) => Array.isArray(value) ? value.join(', ') : '-' }
  ],
  formFields: [
    { name: 'weekStartDate', label: 'Week Start Date', type: 'date' },
    { name: 'weekEndDate', label: 'Week End Date', type: 'date' },
    { name: 'day', label: 'Day', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({ value: day, label: day })) },
    { name: 'mealType', label: 'Meal Type', type: 'select', options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' }
    ] },
    { name: 'menuItems', label: 'Menu Items', type: 'textarea', rows: 3 },
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 4 }
  ],
  initialForm: { weekStartDate: '', weekEndDate: '', day: 'Monday', mealType: 'breakfast', menuItems: '', notes: '' },
  mapFormToPayload: (form) => ({ ...form, menuItems: String(form.menuItems || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) }),
  mapRowToForm: (row) => ({ weekStartDate: row.weekStartDate ? new Date(row.weekStartDate).toISOString().slice(0, 10) : '', weekEndDate: row.weekEndDate ? new Date(row.weekEndDate).toISOString().slice(0, 10) : '', day: row.day || 'Monday', mealType: row.mealType || 'breakfast', menuItems: Array.isArray(row.menuItems) ? row.menuItems.join(', ') : '', notes: row.notes || '' })
};

const WeeklyMenuPage = () => <ListPage title={weeklyMenuConfig.title} subtitle={weeklyMenuConfig.subtitle} endpoint={weeklyMenuConfig.endpoint} columns={weeklyMenuConfig.columns} createPath="/staff/kitchen/weekly-menu/create" editPathForRow={(row) => `/staff/kitchen/weekly-menu/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/weekly-menu/view/${row._id}`} searchPlaceholder="Search weekly menu..." clientSidePagination={true} />;

export default WeeklyMenuPage;
