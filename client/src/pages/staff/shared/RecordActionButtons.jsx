import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

const RecordActionButtons = ({ onView, onEdit, onDelete, extraItems = [] }) => {
  const { t } = useTranslation(['staff', 'common']);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    ...extraItems,
    onView && {
      label: t('staff.actions.view'),
      onClick: onView,
      icon: FiEye,
      className:
        "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100",
    },
    onEdit && {
      label: t('staff.actions.edit'),
      onClick: onEdit,
      icon: FiEdit2,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
    },
    onDelete && {
      label: t('staff.actions.delete'),
      onClick: onDelete,
      icon: FiTrash2,
      className:
        "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100",
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap justify-end gap-2" ref={ref}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${item.className || "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {Icon ? <Icon size={14} /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default RecordActionButtons;
