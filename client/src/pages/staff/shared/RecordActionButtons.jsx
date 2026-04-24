import React, { useEffect, useRef, useState } from 'react';

const RecordActionButtons = ({ onView, onEdit, onDelete, extraItems = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    ...extraItems,
    onView   && { label: 'View',   onClick: onView,   color: 'text-sky-700 hover:bg-sky-50' },
    onEdit   && { label: 'Edit',   onClick: onEdit,   color: 'text-amber-700 hover:bg-amber-50' },
    onDelete && { label: 'Delete', onClick: onDelete, color: 'text-rose-700 hover:bg-rose-50' },
  ].filter(Boolean);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        aria-label="Row actions"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 min-w-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition ${item.color || 'text-slate-700 hover:bg-slate-50'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordActionButtons;
