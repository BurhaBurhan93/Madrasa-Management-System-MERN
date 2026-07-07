import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const getVisiblePages = () => {
    const maxVisible = 10;
    if (totalPages <= maxVisible) return range(1, totalPages);
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return range(start, end);
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
      <div className="flex gap-1.5">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Prev</button>
        {getVisiblePages().map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
        ))}
        <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
      </div>
    </div>
  );
};

export default Pagination;
