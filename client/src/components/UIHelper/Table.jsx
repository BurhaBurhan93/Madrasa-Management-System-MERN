import React from 'react';

const Table = ({
  children,
  className = '',
  columns,
  data = [],
  onRowClick,
  emptyMessage = 'No records found',
}) => {
  if (columns) {
    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? data.map((row, rowIndex) => (
              <tr
                key={row.id || row._id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-600"
                      onClick={(event) => column.key === 'actions' && event.stopPropagation()}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

const TableBody = ({ children }) => {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
};

const TableRow = ({ children, className = '' }) => {
  return <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;
};

const TableCell = ({ children, className = '' }) => {
  return <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-gray-500 ${className}`}>{children}</td>;
};

const TableHead = ({ children, className = '' }) => {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Head = TableHead;

export default Table;
