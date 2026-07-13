import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const hostelMealsConfig = (t) => ({
  title: t('staff.hostel.meals.title'),
  subtitle: t('staff.hostel.meals.subtitle'),
  endpoint: '/hostel/meals',
  createPath: '/staff/registrar/hostel-meals/create',
  editPathForRow: (row) => `/staff/registrar/hostel-meals/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-meals/view/${row._id}`,
  columns: [
    { 
      key: 'date', 
      header: t('common.date'), 
      render: (value) => value ? new Date(value).toLocaleDateString() : '-' 
    },
    { 
      key: 'mealType', 
      header: t('staff.hostel.meals.columns.mealType'), 
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' 
    },
    { 
      key: 'menu', 
      header: t('staff.hostel.meals.columns.mainDish'), 
      render: (value) => value?.mainDish || '-' 
    },
    { 
      key: 'isVegetarian', 
      header: t('staff.hostel.meals.columns.vegetarian'), 
      render: (value) => value ? t('common.yes') : t('common.no') 
    },
    { 
      key: 'attendedCount', 
      header: t('staff.hostel.meals.columns.attendance'), 
      render: (value, row) => `${value || 0} / ${row.totalResidents || 0}` 
    },
    { 
      key: 'allergens', 
      header: t('staff.hostel.meals.columns.allergens'), 
      render: (value) => value && value.length > 0 ? value.join(', ') : t('common.none') 
    }
  ],
  searchPlaceholder: t('staff.hostel.meals.searchPlaceholder'),
  formFields: [
    { name: 'mealType', label: t('staff.hostel.meals.form.mealType'), type: 'select', options: [
      { value: 'breakfast', label: t('staff.hostel.meals.mealType.breakfast') },
      { value: 'lunch', label: t('staff.hostel.meals.mealType.lunch') },
      { value: 'dinner', label: t('staff.hostel.meals.mealType.dinner') },
      { value: 'snack', label: t('staff.hostel.meals.mealType.snack') }
    ], required: true },
    { name: 'date', label: t('common.date'), type: 'date', required: true },
    { name: 'menu_mainDish', label: t('staff.hostel.meals.form.mainDish'), type: 'text' },
    { name: 'menu_sideDish', label: t('staff.hostel.meals.form.sideDish'), type: 'text' },
    { name: 'menu_dessert', label: t('staff.hostel.meals.form.dessert'), type: 'text' },
    { name: 'menu_beverage', label: t('staff.hostel.meals.form.beverage'), type: 'text' },
    { name: 'isVegetarian', label: t('staff.hostel.meals.form.vegetarianOnly'), type: 'select', options: [
      { value: 'true', label: t('common.yes') },
      { value: 'false', label: t('common.no') }
    ]},
    { name: 'allergens', label: t('staff.hostel.meals.form.allergens'), type: 'text' },
    { name: 'specialNotes', label: t('staff.hostel.meals.form.specialNotes'), type: 'textarea' }
  ],
  initialForm: {
    mealType: 'breakfast',
    date: '',
    menu_mainDish: '',
    menu_sideDish: '',
    menu_dessert: '',
    menu_beverage: '',
    isVegetarian: 'false',
    allergens: '',
    specialNotes: ''
  },
  mapRowToForm: (row) => ({
    mealType: row.mealType || 'breakfast',
    date: row.date ? row.date.split('T')[0] : '',
    menu_mainDish: row.menu?.mainDish || '',
    menu_sideDish: row.menu?.sideDish || '',
    menu_dessert: row.menu?.dessert || '',
    menu_beverage: row.menu?.beverage || '',
    isVegetarian: row.isVegetarian?.toString() || 'false',
    allergens: row.allergens ? row.allergens.join(', ') : '',
    specialNotes: row.specialNotes || ''
  }),
  mapFormToPayload: (form) => {
    const allergens = form.allergens
      ? form.allergens.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    return {
      mealType: form.mealType,
      date: form.date,
      menu: {
        mainDish: form.menu_mainDish || '',
        sideDish: form.menu_sideDish || '',
        dessert: form.menu_dessert || '',
        beverage: form.menu_beverage || ''
      },
      isVegetarian: form.isVegetarian === 'true',
      allergens,
      specialNotes: form.specialNotes || ''
    };
  }
});

const HostelMeals = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <ListPage {...hostelMealsConfig(t)} />;
};

export default HostelMeals;
