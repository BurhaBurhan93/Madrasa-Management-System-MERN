import React from 'react';
import Table from './Table';

const DataTable = ({ 
  columns, 
  data, 
  title,
  onRowClick,
  rowClassName = '',
  cellClassName = '',
  headerClassName = ''
}) => {
  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <Table.Thead>
        <tr>
          {columns.map((column) => (
            <Table.Th 
              key={column.key} 
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${headerClassName}`}
            >
              {column.header}
            </Table.Th>
          ))}
        </tr>
      </Table.Thead>
      <Table.Tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr 
            key={rowIndex} 
            className={`hover:bg-gray-50 cursor-pointer ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <Table.Td 
                key={column.key} 
                className={`whitespace-nowrap px-6 py-4 text-sm text-gray-500 ${cellClassName}`}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </Table.Td>
            ))}
          </tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default DataTable;