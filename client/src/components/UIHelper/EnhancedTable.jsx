import React, { useState, useMemo } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const EnhancedTable = ({
  columns,
  data,
  pagination = false,
  pageSize = 10,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  sortable = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <FiChevronUp className="ml-1" size={14} />
    ) : (
      <FiChevronDown className="ml-1" size={14} />
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{emptyMessage}</h3>
        <p className="text-slate-500">No records to display</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-slate-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${selectedRows.has(rowIndex) ? 'bg-cyan-50' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    checked={selectedRows.has(rowIndex)}
                    onChange={() => handleSelectRow(rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 whitespace-nowrap text-sm text-slate-700"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft size={20} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight size={20} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-700">
              {selectedRows.size} item{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                Bulk Action
              </button>
              <button 
                onClick={() => setSelectedRows(new Set())}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTable;