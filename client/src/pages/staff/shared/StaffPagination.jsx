import React from 'react';

const StaffPagination = ({ page, limit, total, onPageChange, onPageSizeChange, pageSizeOptions = [5,10, 25, 50, 100] }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{from}–{to}</span> of <span className="font-semibold text-slate-800">{total}</span> records
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Rows</label>
          <select
            value={limit}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >«</button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >‹</button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-medium transition ${p === page ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'}`}
            >{p}</button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >›</button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >»</button>
        </div>
      </div>
    </div>
  );
};

export default StaffPagination;
