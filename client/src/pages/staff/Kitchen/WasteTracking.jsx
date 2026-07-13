import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

const getUnitOptions = (t) => ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: t(`common.${unit}`, unit) }));

export const getWasteConfig = (t) => {
  const unitOptions = getUnitOptions(t);
  return {
    title: t('staff.kitchen.wasteTracking.title', 'Waste Tracking'),
    subtitle: t('staff.kitchen.wasteTracking.subtitle', 'Monitor waste records using the same polished table, filters, and form structure.'),
    endpoint: '/kitchen/waste',
    columns: [
      { key: 'itemName', header: t('staff.kitchen.wasteTracking.itemName', 'Item Name') },
      { key: 'quantity', header: t('common.quantity', 'Quantity') },
      { key: 'unit', header: t('common.unit', 'Unit') },
      { key: 'wasteDate', header: t('staff.kitchen.wasteTracking.wasteDate', 'Waste Date'), render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
      { key: 'reason', header: t('staff.kitchen.wasteTracking.reason', 'Reason') },
      { key: 'remarks', header: t('common.remarks', 'Remarks') }
    ],
    formFields: [
      { name: 'itemName', label: t('staff.kitchen.wasteTracking.itemName', 'Item Name') },
      { name: 'quantity', label: t('common.quantity', 'Quantity'), type: 'number' },
      { name: 'unit', label: t('common.unit', 'Unit'), type: 'select', options: unitOptions },
      { name: 'wasteDate', label: t('staff.kitchen.wasteTracking.wasteDate', 'Waste Date'), type: 'date' },
      { name: 'reason', label: t('staff.kitchen.wasteTracking.reason', 'Reason'), type: 'select', options: [
        { value: 'spoiled', label: t('staff.kitchen.wasteTracking.spoiled', 'Spoiled') },
        { value: 'expired', label: t('staff.kitchen.wasteTracking.expired', 'Expired') },
        { value: 'overcooked', label: t('staff.kitchen.wasteTracking.overcooked', 'Overcooked') },
        { value: 'other', label: t('staff.kitchen.wasteTracking.other', 'Other') }
      ] },
      { name: 'remarks', label: t('common.remarks', 'Remarks'), type: 'textarea', rows: 4 }
    ],
    initialForm: { itemName: '', quantity: 0, unit: 'kg', wasteDate: '', reason: 'spoiled', remarks: '' },
    mapFormToPayload: (form) => ({ ...form, quantity: Number(form.quantity || 0) }),
    mapRowToForm: (row) => ({ itemName: row.itemName || '', quantity: row.quantity ?? 0, unit: row.unit || 'kg', wasteDate: row.wasteDate ? new Date(row.wasteDate).toISOString().slice(0, 10) : '', reason: row.reason || 'spoiled', remarks: row.remarks || '' })
  };
};

const WasteTracking = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getWasteConfig(t);
  return <ListPage title={config.title} subtitle={config.subtitle} endpoint={config.endpoint} columns={config.columns} createPath="/staff/kitchen/waste/create" editPathForRow={(row) => `/staff/kitchen/waste/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/waste/view/${row._id}`} searchPlaceholder={t('staff.kitchen.wasteTracking.searchPlaceholder', 'Search waste records...')} clientSidePagination={true} />;
};

export default WasteTracking;
