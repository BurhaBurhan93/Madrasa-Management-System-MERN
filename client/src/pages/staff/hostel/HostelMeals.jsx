import React from 'react';
import ListPage from '../shared/ListPage';

const HostelMeals = () => (
  <ListPage
    title="Hostel Meal Schedule"
    subtitle="Manage daily meal menus and dietary information for hostel residents"
    endpoint="/hostel/meals"
    createPath="/staff/registrar/hostel-meals/create"
    editPathForRow={(row) => `/staff/registrar/hostel-meals/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/registrar/hostel-meals/view/${row._id}`}
    columns={[
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
    ]}
    searchPlaceholder="Search by meal type or dish..."
  />
);

export default HostelMeals;
