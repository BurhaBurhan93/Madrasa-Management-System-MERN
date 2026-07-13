import React, { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  emptyMessage,
}) => {
  const { t } = useTranslation('admin');
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

  const confirmDelete = async () => {
    if (onDelete && selectedItem) {
      await onDelete(selectedItem);
    }
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const exportCSV = () => {
    if (!exportData || exportData.length === 0) return;
    const keys = Object.keys(exportData[0]);
    const csvContent = [
      keys.join(','),
      ...exportData.map(row => keys.map(k => JSON.stringify(String(row[k] ?? '')).replace(/^"|"$/g, '')).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const enhancedColumns = showActions ? [
    ...columns,
    {
      key: 'actions',
      label: t('users.actions'),
      render: (_, row) => (
        <div className="flex gap-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(row)}
              icon={<FiEye size={14} />}
            >
              {t('common.viewDetails')}
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
              icon={<FiEdit size={14} />}
            >
              {t('users.edit')}
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
              {t('users.delete')}
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
            {t('common.addNew')}
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={filters.length > 0 ? "md:col-span-2" : "md:col-span-4"}>
            <Input
              placeholder={t('common.search')}
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
                { value: '', label: t('users.allFilter', { filter: filter.label }) },
                ...filter.options
              ]}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            {t('users.showingRecords', { count: filteredData.length, total: data.length })}
          </div>
          <div className="flex gap-2">
            {filters.length > 0 && (
              <Button variant="outline" onClick={() => setActiveFilters({})} icon={<FiFilter size={16} />}>
                {Object.keys(activeFilters).some(k => activeFilters[k]) ? t('users.clearFilters') : t('users.filterBy')}
              </Button>
            )}
            {exportData && (
              <Button variant="outline" onClick={exportCSV} icon={<FiDownload size={16} />}>
                {t('common.export')}
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
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{emptyMessage || t('common.noData')}</h3>
            <p className="text-slate-500">{t('users.filterSuggestion')}</p>
            {onCreate && (
              <Button
                onClick={onCreate}
                className="mt-4"
                icon={<FiPlus size={18} />}
              >
                {t('common.createRecord')}
              </Button>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('users.confirmDelete')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            {t('users.cannotUndo')}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t('users.cancel')}
            </Button>
            <Button color="red" onClick={confirmDelete}>
              {t('users.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BasicPageTemplate;
