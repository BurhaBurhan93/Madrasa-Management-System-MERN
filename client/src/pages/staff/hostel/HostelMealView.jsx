import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelMealsConfig } from './HostelMeals';

const mapRowToView = (row) => ({
  ...row,
  mealType: row.mealType ? row.mealType.charAt(0).toUpperCase() + row.mealType.slice(1) : '-',
  menu_mainDish: row.menu?.mainDish || '-',
  menu_sideDish: row.menu?.sideDish || '-',
  menu_dessert: row.menu?.dessert || '-',
  menu_beverage: row.menu?.beverage || '-',
  isVegetarian: row.isVegetarian ? 'Yes' : 'No',
  allergens: row.allergens && row.allergens.length > 0 ? row.allergens.join(', ') : 'None',
  date: row.date ? new Date(row.date).toLocaleDateString() : '-'
});

const HostelMealView = () => {
  const { id } = useParams();
  const fields = [
    { name: 'date', label: 'Date' },
    { name: 'mealType', label: 'Meal Type' },
    { name: 'menu_mainDish', label: 'Main Dish' },
    { name: 'menu_sideDish', label: 'Side Dish' },
    { name: 'menu_dessert', label: 'Dessert' },
    { name: 'menu_beverage', label: 'Beverage' },
    { name: 'isVegetarian', label: 'Vegetarian Only' },
    { name: 'allergens', label: 'Allergens' },
    { name: 'specialNotes', label: 'Special Notes' },
    { name: 'attendedCount', label: 'Attendance', renderView: (value, item) => `${value || 0} / ${item?.totalResidents || 0}` }
  ];

  return (
    <RecordViewPage
      title="Meal Details"
      subtitle="View hostel meal schedule information"
      endpoint={hostelMealsConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel-meals"
      editPath={`/staff/registrar/hostel-meals/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelMealsConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelMealView;
