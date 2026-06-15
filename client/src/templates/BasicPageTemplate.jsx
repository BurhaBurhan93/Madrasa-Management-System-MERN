import React, { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { Table, Button, Card, Input, Select, Badge, Modal, Loading } from '../components/UIHelper';
import { localizeAdminText } from '../lib/adminLocalization';

const BasicPageTemplate = ({
  title,
  description,
  columns,
  data,
  loading,
  onView,
  onEdit,
  onDelete,
  onCreate,
  searchFields = ['name'],
  filters = [],
  exportData,
  pageSize = 10,
  showActions = true,
  onRowClick,
  emptyMessage = 'No records found',
}) => {
  const adminLang = localStorage.getItem('adminLang') || 'en';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = data.filter(item => {
    const matchesSearch = searchFields.some(field => 
      String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true;
      return item[key] === value;
    });
    
    return matchesSearch && matchesFilters;
  });

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete && selectedItem) {
      onDelete(selectedItem);
    }
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const enhancedColumns = showActions ? [
    ...columns,
    {
      key: 'actions',
      label: localizeAdminText('Actions', adminLang),
      render: (_, row) => (
        <div className="flex gap-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(row)}
              icon={<FiEye size={14} />}
            >
              {localizeAdminText('View Details', adminLang)}
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
              icon={<FiEdit size={14} />}
            >
              {localizeAdminText('Edit', adminLang)}
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              color="red"
              onClick={() => handleDelete(row)}
              icon={<FiTrash2 size={14} />}
            >
              {localizeAdminText('Delete', adminLang)}
            </Button>
          )}
        </div>
      )
    }
  ] : columns;

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{localizeAdminText(title, adminLang)}</h1>
          <p className="text-slate-600">{localizeAdminText(description, adminLang)}</p>
        </div>
        {onCreate && (
          <Button
            onClick={onCreate}
            icon={<FiPlus size={18} />}
          >
            {localizeAdminText('Add New', adminLang)}
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={filters.length > 0 ? "md:col-span-2" : "md:col-span-4"}>
            <Input
              placeholder={localizeAdminText(`Search ${String(title).toLowerCase()}...`, adminLang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          
          {filters.map((filter, index) => (
            <Select
              key={index}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
              options={[
                { value: '', label: localizeAdminText(`All ${filter.label}`, adminLang) },
                ...filter.options
              ]}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            Showing {filteredData.length} of {data.length} records
          </div>
          <div className="flex gap-2">
            {filters.length > 0 && (
              <Button variant="outline" icon={<FiFilter size={16} />}>
                {localizeAdminText('Filter By', adminLang)}
              </Button>
            )}
            {exportData && (
              <Button variant="outline" icon={<FiDownload size={16} />}>
                {localizeAdminText('Export', adminLang)}
              </Button>
            )}
          </div>
        </div>

        {filteredData.length > 0 ? (
          <Table
            columns={enhancedColumns}
            data={filteredData}
            pagination
            pageSize={pageSize}
            onRowClick={onRowClick}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{localizeAdminText(emptyMessage, adminLang)}</h3>
            <p className="text-slate-500">{localizeAdminText('Try changing the search terms, switching the filter column, or create the first record for this module.', adminLang)}</p>
            {onCreate && (
              <Button
                onClick={onCreate}
                className="mt-4"
                icon={<FiPlus size={18} />}
              >
                {localizeAdminText('Create Record', adminLang)}
              </Button>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={localizeAdminText('Confirm Delete', adminLang)}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            {localizeAdminText('Are you sure you want to delete this record?', adminLang)} This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {localizeAdminText('Cancel', adminLang)}
            </Button>
            <Button color="red" onClick={confirmDelete}>
              {localizeAdminText('Delete', adminLang)}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BasicPageTemplate;
