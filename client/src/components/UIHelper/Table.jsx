import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Table = ({
  children,
  className = '',
  columns,
  data = [],
  onRowClick,
  emptyMessage = 'No records found',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tableShell = isDark
    ? 'divide-slate-700 text-slate-100'
    : 'divide-slate-200 text-slate-900';

  if (columns) {
    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${tableShell} ${className}`}>
          <thead className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-slate-800 bg-slate-950' : 'divide-slate-200 bg-white'}>
            {data.length > 0 ? data.map((row, rowIndex) => (
              <tr
                key={row.id || row._id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? (isDark ? 'cursor-pointer hover:bg-slate-900' : 'cursor-pointer hover:bg-slate-50') : (isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50')}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      onClick={(event) => column.key === 'actions' && event.stopPropagation()}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
      <table className={`min-w-full divide-y ${tableShell} ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <thead className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
      <tr>{children}</tr>
    </thead>
  );
};

const TableBody = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return <tbody className={isDark ? 'divide-slate-800 bg-slate-950' : 'divide-slate-200 bg-white'}>{children}</tbody>;
};

const TableRow = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return <tr className={`${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50'} ${className}`}>{children}</tr>;
};

const TableCell = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return <td className={`px-4 py-2.5 whitespace-nowrap text-sm ${isDark ? 'text-slate-300' : 'text-slate-500'} ${className}`}>{children}</td>;
};

const TableHead = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} ${className}`}
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
