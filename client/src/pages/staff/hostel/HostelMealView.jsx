import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelMealsConfig } from './HostelMeals';

const HostelMealView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();

  const mapRowToView = (row) => ({
    ...row,
    mealType: row.mealType ? row.mealType.charAt(0).toUpperCase() + row.mealType.slice(1) : '-',
    menu_mainDish: row.menu?.mainDish || '-',
    menu_sideDish: row.menu?.sideDish || '-',
    menu_dessert: row.menu?.dessert || '-',
    menu_beverage: row.menu?.beverage || '-',
    isVegetarian: row.isVegetarian ? t('common.yes') : t('common.no'),
    allergens: row.allergens && row.allergens.length > 0 ? row.allergens.join(', ') : t('common.none'),
    date: row.date ? new Date(row.date).toLocaleDateString() : '-'
  });

  const fields = [
    { name: 'date', label: t('common.date') },
    { name: 'mealType', label: t('staff.hostel.meals.columns.mealType') },
    { name: 'menu_mainDish', label: t('staff.hostel.meals.form.mainDish') },
    { name: 'menu_sideDish', label: t('staff.hostel.meals.form.sideDish') },
    { name: 'menu_dessert', label: t('staff.hostel.meals.form.dessert') },
    { name: 'menu_beverage', label: t('staff.hostel.meals.form.beverage') },
    { name: 'isVegetarian', label: t('staff.hostel.meals.form.vegetarianOnly') },
    { name: 'allergens', label: t('staff.hostel.meals.columns.allergens') },
    { name: 'specialNotes', label: t('staff.hostel.meals.form.specialNotes') },
    { name: 'attendedCount', label: t('staff.hostel.meals.columns.attendance'), renderView: (value, item) => `${value || 0} / ${item?.totalResidents || 0}` }
  ];

  return (
    <RecordViewPage
      title={t('staff.hostel.meals.view.title')}
      subtitle={t('staff.hostel.meals.view.subtitle')}
      endpoint={hostelMealsConfig(t).endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel-meals"
      editPath={`/staff/registrar/hostel-meals/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelMealsConfig(t).endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelMealView;
