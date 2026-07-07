import React from 'react';
import ListPage from '../shared/ListPage';

export const hostelMealsConfig = {
  title: 'Hostel Meal Schedule',
  subtitle: 'Manage daily meal menus and dietary information for hostel residents',
  endpoint: '/hostel/meals',
  createPath: '/staff/registrar/hostel-meals/create',
  editPathForRow: (row) => `/staff/registrar/hostel-meals/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-meals/view/${row._id}`,
  columns: [
    { 
      key: 'date', 
      header: 'Date', 
      render: (value) => value ? new Date(value).toLocaleDateString() : '-' 
    },
    { 
      key: 'mealType', 
      header: 'Meal Type', 
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' 
    },
    { 
      key: 'menu', 
      header: 'Main Dish', 
      render: (value) => value?.mainDish || '-' 
    },
    { 
      key: 'isVegetarian', 
      header: 'Vegetarian', 
      render: (value) => value ? 'Yes' : 'No' 
    },
    { 
      key: 'attendedCount', 
      header: 'Attendance', 
      render: (value, row) => `${value || 0} / ${row.totalResidents || 0}` 
    },
    { 
      key: 'allergens', 
      header: 'Allergens', 
      render: (value) => value && value.length > 0 ? value.join(', ') : 'None' 
    }
  ],
  searchPlaceholder: 'Search by meal type or dish...',
  formFields: [
    { name: 'mealType', label: 'Meal Type', type: 'select', options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'snack', label: 'Snack' }
    ], required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'menu_mainDish', label: 'Main Dish', type: 'text' },
    { name: 'menu_sideDish', label: 'Side Dish', type: 'text' },
    { name: 'menu_dessert', label: 'Dessert', type: 'text' },
    { name: 'menu_beverage', label: 'Beverage', type: 'text' },
    { name: 'isVegetarian', label: 'Vegetarian Only', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]},
    { name: 'allergens', label: 'Allergens (comma-separated)', type: 'text' },
    { name: 'specialNotes', label: 'Special Notes', type: 'textarea' }
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
};

const HostelMeals = () => (
  <ListPage {...hostelMealsConfig} />
);

export default HostelMeals;
