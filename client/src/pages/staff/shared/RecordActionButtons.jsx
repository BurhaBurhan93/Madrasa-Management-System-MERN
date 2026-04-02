import React, { useEffect, useRef, useState } from 'react';

const RecordActionButtons = ({ onView, onEdit, onDelete, extraItems = [] }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actionItems = [
    ...extraItems,
    { label: 'View', onClick: onView, className: 'text-sky-700 hover:bg-sky-50' },
    { label: 'Update', onClick: onEdit, className: 'text-blue-700 hover:bg-blue-50' },
    { label: 'Delete', onClick: onDelete, className: 'text-rose-700 hover:bg-rose-50' }
  ].filter((item) => item.onClick);

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold leading-none text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
        aria-label="Open row actions"
      >
        ...
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-20 min-w-[150px] overflow-hidden rounded-2xl border border-slate-200 bg-white py-1">
          {actionItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium transition ${item.className || 'text-slate-700 hover:bg-slate-50'}`}
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
