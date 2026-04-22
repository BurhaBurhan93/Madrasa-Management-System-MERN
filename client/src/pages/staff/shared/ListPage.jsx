import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffPageLayout from './StaffPageLayout';
import StaffPagination from './StaffPagination';
import RecordActionButtons from './RecordActionButtons';
import { getAuthHeaders, clearAuth } from '../../../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`); }
};

const getCellValue = (row, key) => {
  const v = row?.[key];
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return v.name || v.title || v.fullName || v.accountName || v.departmentName || v.designationTitle || '';
  return String(v);
};

const statusVariant = (v) => {
  const s = String(v || '').toLowerCase();
  if (['paid','approved','active','completed','resolved','available','present','verified','open'].includes(s)) return 'bg-emerald-100 text-emerald-700';
  if (['pending','processing','draft','partial','low','borrowed','in progress'].includes(s)) return 'bg-amber-100 text-amber-700';
  if (['failed','rejected','cancelled','overdue','inactive','closed','unpaid','absent','out'].includes(s)) return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

const SortIcon = ({ active, dir }) => (
  <span className="ml-1 inline-flex flex-col gap-[2px]">
    <span className={`block h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent ${active && dir === 'asc' ? 'border-b-cyan-500' : 'border-b-slate-300'}`} />
    <span className={`block h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent ${active && dir === 'desc' ? 'border-t-cyan-500' : 'border-t-slate-300'}`} />
  </span>
);

const ListPage = ({
  title, subtitle, endpoint, columns,
  createPath, editPathForRow, viewPathForRow,
  deleteEnabled = true, searchPlaceholder = 'Search...',
  clientSidePagination = false, extraActionItemsForRow,
}) => {
  const navigate = useNavigate();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [filterCol, setFilterCol]   = useState('all');
  const [filterVal, setFilterVal]   = useState('');
  const [sortKey, setSortKey]       = useState('');
  const [sortDir, setSortDir]       = useState('asc');
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (!clientSidePagination) { params.set('page', page); params.set('limit', limit); }
      if (search.trim()) params.set('search', search.trim());
      const res  = await fetch(`${API_BASE}${endpoint}?${params}`, { headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return; }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
      const records = data.data || data || [];
      setItems(Array.isArray(records) ? records : []);
      setTotal(data.total || data.count || (Array.isArray(records) ? records.length : 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, limit, search, endpoint]);

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this record?')) return;
    setDeletingId(row._id);
    try {
      const res  = await fetch(`${API_BASE}${endpoint}/${row._id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return; }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key) => {
    if (key === '__no' || key === '__actions') return;
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filterableCols = useMemo(() => columns.filter((c) => c.key && !c.key.startsWith('__')), [columns]);

  const processed = useMemo(() => {
    let list = [...items];
    if (filterVal.trim()) {
      const q = filterVal.toLowerCase();
      list = list.filter((row) =>
        filterCol === 'all'
          ? filterableCols.some((c) => getCellValue(row, c.key).toLowerCase().includes(q))
          : getCellValue(row, filterCol).toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        const av = getCellValue(a, sortKey).toLowerCase();
        const bv = getCellValue(b, sortKey).toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return list;
  }, [items, filterCol, filterVal, sortKey, sortDir, filterableCols]);

  const visible = useMemo(() => {
    if (!clientSidePagination) return processed;
    const start = (page - 1) * limit;
    return processed.slice(start, start + limit);
  }, [processed, clientSidePagination, page, limit]);

  const totalForPagination = clientSidePagination ? processed.length : total;

  const isStatusCol = (col) =>
    String(col.key || '').toLowerCase().includes('status') ||
    String(col.header || '').toLowerCase().includes('status');

  return (
    <StaffPageLayout
      title={title}
      subtitle={subtitle}
      actions={
        createPath && (
          <button
            onClick={() => navigate(createPath)}
            className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
            </svg>
            Add New
          </button>
        )
      }
    >
      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
              </svg>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Filter Column</label>
            <select
              value={filterCol}
              onChange={(e) => { setFilterCol(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Columns</option>
              {filterableCols.map((c) => <option key={c.key} value={c.key}>{c.header}</option>)}
            </select>
          </div>
          <div className="w-full lg:w-52">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Filter Value</label>
            <input
              value={filterVal}
              onChange={(e) => { setFilterVal(e.target.value); setPage(1); }}
              placeholder="Type to filter..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            />
          </div>
          {(search || filterVal) && (
            <button
              onClick={() => { setSearch(''); setFilterVal(''); setFilterCol('all'); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="8"/><line x1="9" y1="5" x2="9" y2="9.5"/><circle cx="9" cy="12.5" r=".8" fill="currentColor"/></svg>
          <span className="flex-1">{error}</span>
          <button onClick={fetchItems} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">{totalForPagination} total entries</p>
          </div>
          {deletingId && <span className="text-xs text-rose-500 font-medium">Deleting...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 w-12">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 cursor-pointer select-none whitespace-nowrap hover:text-cyan-600 transition"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" strokeOpacity=".25"/><path d="M10 2a8 8 0 0 1 8 8" strokeLinecap="round"/></svg>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-slate-400">
                    No records found
                  </td>
                </tr>
              ) : visible.map((row, idx) => (
                <tr key={row._id || idx} className="border-b border-slate-50 transition hover:bg-cyan-50/40">
                  <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * limit + idx + 1}</td>
                  {columns.map((col) => {
                    const raw = row[col.key];
                    let display;
                    if (col.render) {
                      display = col.render(raw, row, idx);
                    } else if (isStatusCol(col)) {
                      display = (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusVariant(raw)}`}>
                          {String(raw || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      );
                    } else {
                      display = getCellValue(row, col.key) || <span className="text-slate-300">—</span>;
                    }
                    return (
                      <td key={col.key} className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {display}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <RecordActionButtons
                      extraItems={extraActionItemsForRow ? extraActionItemsForRow(row, fetchItems) : []}
                      onView={viewPathForRow ? () => navigate(viewPathForRow(row)) : undefined}
                      onEdit={editPathForRow ? () => navigate(editPathForRow(row)) : undefined}
                      onDelete={deleteEnabled ? () => handleDelete(row) : undefined}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <StaffPagination
        page={page}
        limit={limit}
        total={totalForPagination}
        onPageChange={setPage}
        onPageSizeChange={(v) => { setLimit(v); setPage(1); }}
      />
    </StaffPageLayout>
  );
};

export default ListPage;
