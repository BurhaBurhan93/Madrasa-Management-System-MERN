import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Badge from '../../../components/UIHelper/Badge';
import DataTable from '../../../components/UIHelper/DataTable';
import ErrorPage from '../../../components/UIHelper/ErrorPage';
import StaffPageLayout from './StaffPageLayout';
import RecordActionButtons from './RecordActionButtons';
import StaffPagination from './StaffPagination';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`API returned non-JSON (status ${res.status}). Response: ${preview}`);
  }
};

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

const ListPage = ({ title, subtitle, endpoint, columns, createPath, editPathForRow, viewPathForRow, deleteEnabled = true, searchPlaceholder = 'Search...', clientSidePagination = false, extraActionItemsForRow }) => {
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

      const res = await fetch(`${API_BASE}${endpoint}?${params.toString()}`);
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
      const res = await fetch(`${API_BASE}${endpoint}/${row._id}`, { method: 'DELETE' });
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

  return (
    <StaffPageLayout eyebrow="Reusable Staff Table" title={title} subtitle={subtitle} actions={createPath ? <Button variant="primary" onClick={() => (window.location.href = createPath)}>Add New</Button> : null}>
      <Card className="rounded-[28px] border border-slate-200 shadow-none">
        <div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40 p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Search And Filter</div>
            <div className="text-sm text-slate-500">Quick controls for finding records faster.</div>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-4 lg:max-w-4xl lg:grid-cols-[minmax(300px,420px)_220px_220px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" placeholder={searchPlaceholder} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Filter By</label>
                <select value={filterColumn} onChange={(e) => { setFilterColumn(e.target.value); setPage(1); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
                  <option value="all">All Columns</option>
                  {filterableColumns.map((column) => <option key={column.key} value={column.key}>{column.header}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Filter Value</label>
                <input value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(1); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" placeholder="Type to filter rows..." />
              </div>
            </div>
        
          </div>
        </div>
      </Card>
      {error && !loading && <ErrorPage type="generic" title="Unable to Load Data" message={error} onRetry={fetchItems} onHome={() => (window.location.href = '/staff/dashboard')} showBackButton={false} />}
      <Card className="rounded-[28px] border border-slate-200 shadow-none">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Records Table</h2>
            <p className="mt-1 text-sm text-slate-500">Unified filtering, sorting, pagination, and row actions.</p>
          </div>
          {deletingId && <div className="text-sm text-rose-600">Deleting selected record...</div>}
        </div>
        <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
          {loading ? <div className="p-6 text-sm text-slate-500">Loading data...</div> : (
            <DataTable columns={columnsWithActions.map((column) => ({ ...column, sortable: column.key !== '__actions' && column.key !== '__index' && column.sortable !== false }))} data={visibleItems} rowClassName="odd:bg-white even:bg-slate-50/30 hover:bg-cyan-50/40" cellClassName="align-middle" headerClassName="bg-slate-100 text-slate-700" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
          )}
        </div>
      </Card>
      <StaffPagination page={page} limit={limit} total={totalForPagination} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
    </StaffPageLayout>
  );
};

export default ListPage;
