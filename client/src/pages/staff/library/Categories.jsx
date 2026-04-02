import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const libraryCategoriesConfig = {
  title: 'Library Categories',
  subtitle: 'Manage category records with the unified library table and form design.',
  endpoint: '/staff/library/categories',
  columns: [
    { key: 'name', header: 'Category Name' },
    { key: 'description', header: 'Description' }
  ],
  formFields: [
    { name: 'name', label: 'Category Name' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ],
  initialForm: { name: '', description: '' },
  mapRowToForm: (row) => ({ name: row.name || '', description: row.description || '' })
};

const StaffLibraryCategories = () => (
  <ListPage
    title={libraryCategoriesConfig.title}
    subtitle={libraryCategoriesConfig.subtitle}
    endpoint={libraryCategoriesConfig.endpoint}
    columns={libraryCategoriesConfig.columns}
    createPath="/staff/library/categories/create"
    editPathForRow={(row) => `/staff/library/categories/edit/${getId(row)}`}
    viewPathForRow={(row) => `/staff/library/categories/view/${getId(row)}`}
    searchPlaceholder="Search categories..."
    clientSidePagination={true}
  />
);

export default StaffLibraryCategories;
