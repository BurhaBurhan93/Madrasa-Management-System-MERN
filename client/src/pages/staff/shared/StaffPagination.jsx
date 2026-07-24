import React from 'react';
import { useTranslation } from 'react-i18next';

const StaffPagination = ({ page, limit, total, onPageChange, onPageSizeChange, pageSizeOptions = [5,10, 25, 50, 100] }) => {
  const { t } = useTranslation(['staff', 'common']);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-transparent p-3 sm:p-4 lg:p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {t('pagination.showing')} <span className="font-semibold text-slate-800">{from}–{to}</span> {t('pagination.of')} <span className="font-semibold text-slate-800">{total}</span> {t('pagination.records')}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">{t('pagination.rows')}</label>
          <select
            value={limit}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); }}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-slate-200 bg-transparent text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >«</button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-slate-200 bg-transparent text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >‹</button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border text-xs font-medium transition ${p === page ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm' : 'border-slate-200 bg-transparent text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'}`}
            >{p}</button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-slate-200 bg-transparent text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >›</button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-slate-200 bg-transparent text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
          >»</button>
        </div>
      </div>
    </div>
  );
};

export default StaffPagination;
