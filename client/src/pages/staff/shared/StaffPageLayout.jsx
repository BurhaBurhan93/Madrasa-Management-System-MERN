import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { getStaffShellClasses, getStaffToneStyles } from './staffTheme';
import { localizeAdminText } from '../../../lib/adminLocalization';

const StaffPageLayout = ({ eyebrow, title, subtitle, actions, children, tone }) => {
  const { theme } = useTheme();
  const toneStyles = getStaffToneStyles(tone || eyebrow || title);
  const isDark = theme === 'dark';
  const adminLang = localStorage.getItem('adminLang') || 'en';

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${getStaffShellClasses(theme)}`}>
      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle || actions) && (
          <section className={`relative overflow-hidden rounded-[32px] border p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.25)] ${isDark ? 'border-slate-700 bg-slate-900/80 backdrop-blur-xl' : 'border-cyan-100/70 bg-cyan-50/75 backdrop-blur-xl'}`}>
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${toneStyles.accent}`} />
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                {eyebrow && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${toneStyles.badge}`}>
                    {localizeAdminText(eyebrow, adminLang)}
                  </span>
                )}
                {title && (
                  <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {localizeAdminText(title, adminLang)}
                  </h1>
                )}
                {subtitle && (
                  <p className={`max-w-3xl text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {localizeAdminText(subtitle, adminLang)}
                  </p>
                )}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </section>
        )}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default StaffPageLayout;
