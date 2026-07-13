import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

const getUnitOptions = (t) => ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: t(`common.${unit}`, unit) }));

export const getConsumptionConfig = (t) => {
  const unitOptions = getUnitOptions(t);
  return {
    title: t('staff.kitchen.dailyPlaning.title', 'Daily Food Consumption'),
    subtitle: t('staff.kitchen.dailyPlaning.subtitle', 'Track daily meal consumption with a clean kitchen operations table.'),
    endpoint: '/kitchen/consumption',
    columns: [
      { key: 'consumptionDate', header: t('staff.kitchen.dailyPlaning.date', 'Date'), render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
      { key: 'mealType', header: t('staff.kitchen.dailyPlaning.mealType', 'Meal Type') },
      { key: 'numberOfStudents', header: t('staff.kitchen.dailyPlaning.numberOfStudents', 'Students') },
      { key: 'numberOfStaff', header: t('staff.kitchen.dailyPlaning.numberOfStaff', 'Staff') },
      { key: 'itemName', header: t('staff.kitchen.dailyPlaning.itemName', 'Item Name') },
      { key: 'quantityUsed', header: t('staff.kitchen.dailyPlaning.quantityUsed', 'Quantity Used') },
      { key: 'unit', header: t('common.unit', 'Unit') }
    ],
    formFields: [
      { name: 'consumptionDate', label: t('staff.kitchen.dailyPlaning.consumptionDate', 'Consumption Date'), type: 'date' },
      { name: 'mealType', label: t('staff.kitchen.dailyPlaning.mealType', 'Meal Type'), type: 'select', options: [
        { value: 'breakfast', label: t('common.breakfast', 'Breakfast') },
        { value: 'lunch', label: t('common.lunch', 'Lunch') },
        { value: 'dinner', label: t('common.dinner', 'Dinner') }
      ] },
      { name: 'numberOfStudents', label: t('staff.kitchen.dailyPlaning.numberOfStudents', 'Number Of Students'), type: 'number' },
      { name: 'numberOfStaff', label: t('staff.kitchen.dailyPlaning.numberOfStaff', 'Number Of Staff'), type: 'number' },
      { name: 'itemName', label: t('staff.kitchen.dailyPlaning.itemName', 'Item Name') },
      { name: 'quantityUsed', label: t('staff.kitchen.dailyPlaning.quantityUsed', 'Quantity Used'), type: 'number' },
      { name: 'unit', label: t('common.unit', 'Unit'), type: 'select', options: unitOptions },
      { name: 'preparedBy', label: t('staff.kitchen.dailyPlaning.preparedBy', 'Prepared By') },
      { name: 'supervisedBy', label: t('staff.kitchen.dailyPlaning.supervisedBy', 'Supervised By') },
      { name: 'remarks', label: t('common.remarks', 'Remarks'), type: 'textarea', rows: 4 }
    ],
    initialForm: { consumptionDate: '', mealType: 'breakfast', numberOfStudents: 0, numberOfStaff: 0, itemName: '', quantityUsed: 0, unit: 'kg', preparedBy: '', supervisedBy: '', remarks: '' },
    mapFormToPayload: (form) => ({ ...form, numberOfStudents: Number(form.numberOfStudents || 0), numberOfStaff: Number(form.numberOfStaff || 0), quantityUsed: Number(form.quantityUsed || 0) }),
    mapRowToForm: (row) => ({ consumptionDate: row.consumptionDate ? new Date(row.consumptionDate).toISOString().slice(0, 10) : '', mealType: row.mealType || 'breakfast', numberOfStudents: row.numberOfStudents ?? 0, numberOfStaff: row.numberOfStaff ?? 0, itemName: row.itemName || '', quantityUsed: row.quantityUsed ?? 0, unit: row.unit || 'kg', preparedBy: row.preparedBy || '', supervisedBy: row.supervisedBy || '', remarks: row.remarks || '' })
  };
};

const DailyPlaning = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getConsumptionConfig(t);
  return <ListPage title={config.title} subtitle={config.subtitle} endpoint={config.endpoint} columns={config.columns} createPath="/staff/kitchen/menu/create" editPathForRow={(row) => `/staff/kitchen/menu/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/menu/view/${row._id}`} searchPlaceholder={t('staff.kitchen.dailyPlaning.searchPlaceholder', 'Search daily consumption...')} clientSidePagination={true} />;
};

export default DailyPlaning;
