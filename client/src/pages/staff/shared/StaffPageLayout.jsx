import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { getStaffShellClasses, getStaffToneStyles } from './staffTheme';

const StaffPageLayout = ({ eyebrow, title, subtitle, actions, children, tone }) => {
  const { theme } = useTheme();
  const toneStyles = getStaffToneStyles(tone || eyebrow || title);
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${getStaffShellClasses(theme)}`}>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle || actions) && (
          <section className={`rounded-[32px] border p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.25)] ${isDark ? 'border-slate-700 bg-slate-900/80 backdrop-blur-xl' : 'border-white/70 bg-white/80 backdrop-blur-xl'}`}>
            <div className={`h-1.5 w-28 rounded-full bg-gradient-to-r ${toneStyles.accent}`} />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                {eyebrow && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${toneStyles.badge}`}>
                    {eyebrow}
                  </span>
                )}
                {title && (
                  <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={`max-w-3xl text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </section>
        )}
        {children}
      </div>
    </div>
  );
};

export default StaffPageLayout;
