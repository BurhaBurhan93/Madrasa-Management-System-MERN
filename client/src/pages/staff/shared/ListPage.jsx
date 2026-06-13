import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Badge from '../../../components/UIHelper/Badge';
import DataTable from '../../../components/UIHelper/DataTable';
import StaffPageLayout from './StaffPageLayout';
import RecordActionButtons from './RecordActionButtons';
import StaffPagination from './StaffPagination';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { FiDownload, FiPlus } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { getStaffToneStyles } from './staffTheme';

const getCellValue = (row, key) => {
  const value = row?.[key];
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return value.name || value.title || value.fullName || value.accountName || value.employeeCode || value.departmentName || value.designationTitle || value.subject || value.complaintCode || JSON.stringify(value);
  }
  return String(value);
};

const formatStatusLabel = (value) => String(value).replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusVariant = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['paid', 'approved', 'verified', 'active', 'completed', 'success', 'resolved', 'available', 'in stock', 'present', 'open'].includes(normalized)) return 'success';
  if (['pending', 'processing', 'awaiting', 'scheduled', 'draft', 'partial', 'low', 'borrowed', 'in progress', 'in-progress'].includes(normalized)) return 'warning';
  if (['failed', 'rejected', 'cancelled', 'canceled', 'overdue', 'inactive', 'closed', 'unpaid', 'absent', 'out of stock', 'out'].includes(normalized)) return 'danger';
  if (['refunded', 'returned', 'on leave', 'archived'].includes(normalized)) return 'secondary';
  return 'info';
};

const renderStatusBadge = (value) => (
  <Badge variant={getStatusVariant(value)} className="px-3 py-1 text-[11px] font-semibold tracking-[0.04em]">
    {formatStatusLabel(value)}
  </Badge>
);

const ListPage = ({
  title,
  subtitle,
  endpoint,
  columns,
  createPath,
  editPathForRow,
  viewPathForRow,
  deleteEnabled = true,
  searchPlaceholder = 'Search...',
  clientSidePagination = false,
  extraActionItemsForRow,
  eyebrow = 'Reusable Staff Table',
  headerContent = null,
  extraActions = null,
  enableExport = false,
  embedded = false
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [sortKey, setSortKey] = useState(columns[0]?.key || '');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toneStyles = getStaffToneStyles(eyebrow || title || endpoint);

  const cardShellClass = isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white';
  const panelShellClass = isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40';
  const controlClass = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-500/20'
    : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-100';

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (!clientSidePagination) {
        params.set('page', String(page));
        params.set('limit', String(limit));
      }
      if (query.trim()) params.set('search', query.trim());

      const res = await apiFetch(`${endpoint}?${params.toString()}`);
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || `Request failed (status ${res.status})`);
      const records = data.data || data || [];
      setItems(Array.isArray(records) ? records : []);
      setTotal(data.total || data.count || (Array.isArray(records) ? records.length : 0));
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, limit, query, clientSidePagination]);

  const handleDelete = async (row) => {
    const ok = window.confirm('Are you sure you want to delete this record?');
    if (!ok) return;

    setDeletingId(row?._id);
    try {
      const res = await apiFetch(`${endpoint}/${row._id}`, { method: 'DELETE' });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Delete error');
    } finally {
      setDeletingId(null);
    }
  };

  const filterableColumns = useMemo(() => columns.filter((column) => column.key && !String(column.key).startsWith('__')), [columns]);

  const filteredSortedItems = useMemo(() => {
    let nextItems = [...items];
    if (filterValue.trim()) {
      const normalized = filterValue.trim().toLowerCase();
      nextItems = nextItems.filter((row) => {
        if (filterColumn === 'all') return filterableColumns.some((column) => getCellValue(row, column.key).toLowerCase().includes(normalized));
        return getCellValue(row, filterColumn).toLowerCase().includes(normalized);
      });
    }
    if (sortKey) {
      nextItems.sort((a, b) => {
        const aValue = getCellValue(a, sortKey).toLowerCase();
        const bValue = getCellValue(b, sortKey).toLowerCase();
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return nextItems;
  }, [items, filterColumn, filterValue, filterableColumns, sortDirection, sortKey]);

  const visibleItems = useMemo(() => {
    if (!clientSidePagination) return filteredSortedItems;
    const start = (page - 1) * limit;
    return filteredSortedItems.slice(start, start + limit);
  }, [clientSidePagination, filteredSortedItems, page, limit]);

  const handleSort = (key) => {
    if (key === '__index' || key === '__actions') return;
    if (sortKey === key) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const columnsWithActions = useMemo(() => {
    const enhancedColumns = columns.map((column) => {
      const isStatusColumn = String(column.key || '').toLowerCase().includes('status') || String(column.header || '').toLowerCase().includes('status');
      if (!isStatusColumn || column.render) return column;
      return { ...column, render: (value) => renderStatusBadge(value) };
    });

    return [
      {
        key: '__index',
        header: 'No.',
        sortable: false,
        render: (_value, _row, rowIndex) => <div className="min-w-[56px] text-slate-700">{(page - 1) * limit + rowIndex + 1}</div>
      },
      ...enhancedColumns,
      {
        key: '__actions',
        header: 'Actions',
        sortable: false,
        render: (_value, row) => (
          <RecordActionButtons
            extraItems={extraActionItemsForRow ? extraActionItemsForRow(row, fetchItems) : []}
            onView={viewPathForRow ? () => (window.location.href = viewPathForRow(row)) : undefined}
            onEdit={editPathForRow ? () => (window.location.href = editPathForRow(row)) : undefined}
            onDelete={deleteEnabled ? () => handleDelete(row) : undefined}
          />
        )
      }
    ];
  }, [columns, viewPathForRow, editPathForRow, deleteEnabled, page, limit, extraActionItemsForRow]);

  const totalForPagination = clientSidePagination ? filteredSortedItems.length : total;

  const handleExport = () => {
    const exportableColumns = columns.filter((column) => column.key && !String(column.key).startsWith('__'));
    const rows = filteredSortedItems.map((row) =>
      exportableColumns
        .map((column) => `"${getCellValue(row, column.key).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [
      exportableColumns.map((column) => `"${column.header}"`).join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pageActions = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {enableExport ? <Button variant="outline" icon={FiDownload} onClick={handleExport}>Export CSV</Button> : null}
      {extraActions}
      {createPath ? <Button variant="primary" icon={FiPlus} onClick={() => (window.location.href = createPath)}>Add New</Button> : null}
    </div>
  );

  const content = (
    <>
      {headerContent}
      <Card className="rounded-[28px] shadow-none">
        <div className={`rounded-[24px] border p-5 lg:p-6 ${panelShellClass}`}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneStyles.soft}`}>Search And Filter</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick controls for finding records faster.</div>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-4 lg:max-w-4xl lg:grid-cols-[minmax(300px,420px)_220px_220px]">
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Search</label>
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`} placeholder={searchPlaceholder} />
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Filter By</label>
                <select value={filterColumn} onChange={(e) => { setFilterColumn(e.target.value); setPage(1); }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`}>
                  <option value="all">All Columns</option>
                  {filterableColumns.map((column) => <option key={column.key} value={column.key}>{column.header}</option>)}
                </select>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Filter Value</label>
                <input value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(1); }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`} placeholder="Type to filter rows..." />
              </div>
            </div>
        
          </div>
        </div>
      </Card>
      {error && !loading && (
        <Card className="rounded-[28px] shadow-none">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>Unable to Load Data</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{error}</p>
                <button onClick={fetchItems} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
      <Card className="rounded-[28px] shadow-none">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Records Table</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unified filtering, sorting, pagination, and row actions.</p>
          </div>
          {deletingId && <div className="text-sm text-rose-500">Deleting selected record...</div>}
        </div>
        <div className={`overflow-x-auto rounded-[24px] border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          {loading ? <div className="p-6 text-sm text-slate-500">Loading data...</div> : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>No Records</div>
              <h3 className={`mt-4 text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nothing matches your current filters</h3>
              <p className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Try changing the search terms, switching the filter column, or create the first record for this module.</p>
            </div>
          ) : (
            <DataTable columns={columnsWithActions.map((column) => ({ ...column, sortable: column.key !== '__actions' && column.key !== '__index' && column.sortable !== false }))} data={visibleItems} rowClassName="odd:bg-white even:bg-slate-50/30 hover:bg-cyan-50/40" cellClassName="align-middle" headerClassName="bg-slate-100 text-slate-700" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
          )}
        </div>
      </Card>
      <StaffPagination page={page} limit={limit} total={totalForPagination} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
    </>
  );

  if (embedded) return content;

  return (
    <StaffPageLayout eyebrow={eyebrow} title={title} subtitle={subtitle} actions={pageActions}>
      {content}
    </StaffPageLayout>
  );
};

export default ListPage;
