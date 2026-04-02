import React from 'react';
import Button from '../../../components/UIHelper/Button';

const StaffPagination = ({ page, limit, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100] }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">Showing {from}-{to} of {total}</p>
        <p className="mt-1 text-sm text-slate-500">Page {page} of {totalPages}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Rows</label>
          <select value={limit} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
            {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default StaffPagination;
