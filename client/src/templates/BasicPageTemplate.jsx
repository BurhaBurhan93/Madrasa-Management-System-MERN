import React, { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { Table, Button, Card, Input, Select, Badge, Modal, Loading } from '../components/UIHelper';

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
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(row)}
              icon={<FiEye size={14} />}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
              icon={<FiEdit size={14} />}
            >
              Edit
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
              Delete
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
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>
        {onCreate && (
          <Button
            onClick={onCreate}
            icon={<FiPlus size={18} />}
          >
            Add New
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={filters.length > 0 ? "md:col-span-2" : "md:col-span-4"}>
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          
          {filters.map((filter, index) => (
            <Select
              key={index}
              value={activeFilters[filter.key] || ''}
              onChange={(value) => setActiveFilters(prev => ({ ...prev, [filter.key]: value }))}
              options={[
                { value: '', label: `All ${filter.label}` },
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
                More Filters
              </Button>
            )}
            {exportData && (
              <Button variant="outline" icon={<FiDownload size={16} />}>
                Export
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
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{emptyMessage}</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
            {onCreate && (
              <Button
                onClick={onCreate}
                className="mt-4"
                icon={<FiPlus size={18} />}
              >
                Create First Record
              </Button>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete this record? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BasicPageTemplate;