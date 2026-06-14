import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className={`w-full max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'} ${sizeClasses[size]}`}>
        {(title || onClose) && (
          <div className={`sticky top-0 z-10 flex items-center justify-between border-b p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            {title && <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>}
            {onClose && (
              <button
                onClick={onClose}
                className={`focus:outline-none ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-500'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
