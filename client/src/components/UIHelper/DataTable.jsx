import React from 'react';
import Table from './Table';

const DataTable = ({ 
  columns, 
  data, 
  onRowClick,
  rowClassName = '',
  cellClassName = '',
  headerClassName = '',
  sortKey,
  sortDirection = 'asc',
  onSort
}) => {
  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <Table.Header>
        {columns.map((column) => (
          <Table.Head
            key={column.key}
            className={headerClassName}
          >
            {column.sortable && onSort ? (
              <button
                type="button"
                onClick={() => onSort(column.key)}
                className="inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wider text-inherit"
              >
                <span>{column.header}</span>
                <span className={`text-[10px] ${sortKey === column.key ? 'text-cyan-600' : 'text-slate-300'}`}>
                  {sortKey === column.key ? (sortDirection === 'asc' ? '?' : '?') : '?'}
                </span>
              </button>
            ) : (
              column.header
            )}
          </Table.Head>
        ))}
      </Table.Header>

      <Table.Body>
        {data.map((row, rowIndex) => (
          <Table.Row
            key={row._id || rowIndex}
            className={rowClassName}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <Table.Cell
                key={column.key}
                className={cellClassName}
              >
                {column.render
                  ? column.render(row[column.key], row, rowIndex)
                  : row[column.key]}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default DataTable;
