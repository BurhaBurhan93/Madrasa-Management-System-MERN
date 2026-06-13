import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiClock, FiAlertCircle, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

// Sample notification data (replace with API call later)
const defaultNotifications = [
  { id: 1, type: 'info',    title: 'System Update', message: 'New version available for deployment.', time: '5m ago', read: false },
  { id: 2, type: 'success', title: 'Backup Complete', message: 'Database backup finished successfully.', time: '1h ago', read: false },
  { id: 3, type: 'warning', title: 'Storage Warning', message: 'Server storage reaching 85% capacity.', time: '3h ago', read: true },
  { id: 4, type: 'error',   title: 'Login Failed', message: '3 failed login attempts detected.', time: '5h ago', read: true },
];

const iconMap = {
  info:    <FiInfo size={16} className="text-sky-500" />,
  success: <FiCheckCircle size={16} className="text-emerald-500" />,
  warning: <FiAlertCircle size={16} className="text-amber-500" />,
  error:   <FiAlertCircle size={16} className="text-rose-500" />,
};

const bgMap = {
  info:    'bg-sky-50 dark:bg-sky-900/20',
  success: 'bg-emerald-50 dark:bg-emerald-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  error:   'bg-rose-50 dark:bg-rose-900/20',
};

const NotificationDropdown = ({ t }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const removeOne = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
          isDark
            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-400'
            : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
        }`}
        title={t?.notifications || 'Notifications'}
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`notification-dropdown absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
          }`}
          style={{ minWidth: 320 }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <FiBell size={16} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {t?.notifications || 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                  {unreadCount}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className={`rounded-lg p-1 transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
              <FiX size={16} />
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <FiBell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 border-b px-4 py-3 transition ${
                    !n.read
                      ? isDark ? 'bg-slate-750/50' : 'bg-cyan-50/30'
                      : ''
                  } ${isDark ? 'border-slate-700/50 hover:bg-slate-700/50' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {iconMap[n.type] || iconMap.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[13px] font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{n.title}</p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" />}
                    </div>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <FiClock size={10} />
                      <span>{n.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="rounded p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Mark read">
                        <FiCheck size={12} />
                      </button>
                    )}
                    <button onClick={() => removeOne(n.id)} className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Remove">
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`flex items-center justify-between border-t px-4 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button onClick={markAllRead} className={`text-xs font-medium transition ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
                Mark all read
              </button>
              <button onClick={clearAll} className={`text-xs font-medium transition ${isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'}`}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
