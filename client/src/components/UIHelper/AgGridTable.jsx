/**
 * AG Grid Table Component - Enterprise Data Grid
 * Professional table with sorting, filtering, pagination
 */

import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { theme } from '../../theme';

// Default column definitions
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
  flex: 1,
};

// AG Grid custom theme configuration
const agGridTheme = {
  // Override AG Grid Alpine theme colors
  '--ag-background-color': '#ffffff',
  '--ag-foreground-color': theme.colors.secondary[800],
  '--ag-header-background-color': theme.colors.secondary[50],
  '--ag-header-foreground-color': theme.colors.secondary[700],
  '--ag-border-color': theme.colors.secondary[200],
  '--ag-row-hover-color': theme.colors.primary[50],
  '--ag-selected-row-background-color': theme.colors.primary[100],
  '--ag-range-selection-border-color': theme.colors.primary[500],
  '--ag-font-family': theme.typography.fontFamily.sans.join(', '),
  '--ag-font-size': '14px',
  '--ag-row-height': '48px',
  '--ag-header-height': '48px',
  '--ag-cell-horizontal-padding': '16px',
};

/**
 * AG Grid Data Table Component
 */
export const AgGridTable = ({
  data = [],
  columns = [],
  loading = false,
  height = '500px',
  pagination = true,
  paginationPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  enableSorting = true,
  enableFiltering = true,
  enableRowSelection = false,
  enableExport = false,
  onRowClick,
  onSelectionChange,
  onRowDoubleClick,
  className = '',
  emptyText = 'No data available',
  title,
}) => {
  // Build column definitions
  const columnDefs = useMemo(() => {
    return columns.map(col => ({
      field: col.field,
      headerName: col.headerName || col.header || col.field,
      sortable: col.sortable !== false && enableSorting,
      filter: col.filter !== false && enableFiltering,
      width: col.width,
      minWidth: col.minWidth || 100,
      maxWidth: col.maxWidth,
      flex: col.flex,
      cellRenderer: col.cellRenderer,
      cellClass: col.cellClass,
      headerClass: col.headerClass,
      valueFormatter: col.formatter,
      cellStyle: col.cellStyle,
      comparator: col.comparator,
      ...col.agGridOptions,
    }));
  }, [columns, enableSorting, enableFiltering]);

  // Row selection configuration
  const rowSelection = useMemo(() => {
    if (!enableRowSelection) return undefined;
    return {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
    };
  }, [enableRowSelection]);

  // Handle row click
  const onRowClicked = useCallback((event) => {
    if (onRowClick) {
      onRowClick(event.data, event.rowIndex);
    }
  }, [onRowClick]);

  // Handle row double click
  const onRowDoubleClicked = useCallback((event) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(event.data, event.rowIndex);
    }
  }, [onRowDoubleClick]);

  // Handle selection change
  const onSelectionChanged = useCallback((event) => {
    if (onSelectionChange) {
      const selectedRows = event.api.getSelectedRows();
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange]);

  // Loading overlay
  const loadingOverlayComponent = useMemo(() => {
    return () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }, []);

  // No rows overlay
  const noRowsOverlayComponent = useMemo(() => {
    return () => (
      <div className="flex items-center justify-center h-full text-gray-400">
        {emptyText}
      </div>
    );
  }, [emptyText]);

  // Export to CSV
  const onExportClick = useCallback((api) => {
    api.exportDataAsCsv({
      fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
    });
  }, []);

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {enableExport && (
            <button
              onClick={() => onExportClick(gridRef.current?.api)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>
      )}
      <div
        className="ag-theme-alpine"
        style={{
          height,
          width: '100%',
          ...agGridTheme,
        }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={pageSizeOptions}
          rowSelection={rowSelection}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onSelectionChanged={onSelectionChanged}
          loadingOverlayComponent={loadingOverlayComponent}
          noRowsOverlayComponent={noRowsOverlayComponent}
          overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Loading...</span>'}
          overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">No data</span>'}
          animateRows={true}
          suppressCellFocus={false}
          enableCellTextSelection={true}
          suppressRowClickSelection={!enableRowSelection}
        />
      </div>
    </div>
  );
};

// Export the component
export default AgGridTable;
