import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const ThemeToggle = ({ compact = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isDark
          ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-500 hover:bg-slate-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50'
      } ${className}`}
    >
      {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
};

export default ThemeToggle;
