const normalize = (value) => String(value || '').trim().toLowerCase();

export const STAFF_TONES = {
  cyan: {
    accent: 'from-cyan-500 via-sky-500 to-blue-600',
    badge: 'bg-cyan-500/10 text-cyan-700 ring-cyan-200',
    chip: 'bg-cyan-600 text-white',
    soft: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  sky: {
    accent: 'from-sky-500 via-cyan-500 to-blue-500',
    badge: 'bg-sky-500/10 text-sky-700 ring-sky-200',
    chip: 'bg-sky-600 text-white',
    soft: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  blue: {
    accent: 'from-blue-500 via-sky-500 to-cyan-600',
    badge: 'bg-blue-500/10 text-blue-700 ring-blue-200',
    chip: 'bg-blue-600 text-white',
    soft: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  emerald: {
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-200',
    chip: 'bg-emerald-600 text-white',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  violet: {
    accent: 'from-violet-500 via-fuchsia-500 to-pink-600',
    badge: 'bg-violet-500/10 text-violet-700 ring-violet-200',
    chip: 'bg-violet-600 text-white',
    soft: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  amber: {
    accent: 'from-amber-500 via-orange-500 to-rose-500',
    badge: 'bg-amber-500/10 text-amber-700 ring-amber-200',
    chip: 'bg-amber-600 text-white',
    soft: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  rose: {
    accent: 'from-rose-500 via-pink-500 to-fuchsia-600',
    badge: 'bg-rose-500/10 text-rose-700 ring-rose-200',
    chip: 'bg-rose-600 text-white',
    soft: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  orange: {
    accent: 'from-orange-500 via-amber-500 to-yellow-500',
    badge: 'bg-orange-500/10 text-orange-700 ring-orange-200',
    chip: 'bg-orange-600 text-white',
    soft: 'bg-orange-50 text-orange-700 border-orange-100',
  },
  indigo: {
    accent: 'from-indigo-500 via-blue-500 to-cyan-600',
    badge: 'bg-indigo-500/10 text-indigo-700 ring-indigo-200',
    chip: 'bg-indigo-600 text-white',
    soft: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  slate: {
    accent: 'from-slate-500 via-slate-600 to-slate-700',
    badge: 'bg-slate-500/10 text-slate-700 ring-slate-200',
    chip: 'bg-slate-600 text-white',
    soft: 'bg-slate-50 text-slate-700 border-slate-100',
  },
};

export const getStaffTone = (value) => {
  const text = normalize(value);
  if (text.includes('finance') || text.includes('payroll') || text.includes('account') || text.includes('transaction')) return 'cyan';
  if (text.includes('library') || text.includes('book')) return 'violet';
  if (text.includes('hr') || text.includes('employee') || text.includes('attendance') || text.includes('leave')) return 'emerald';
  if (text.includes('kitchen') || text.includes('meal') || text.includes('inventory') || text.includes('supplier')) return 'orange';
  if (text.includes('complaint') || text.includes('feedback')) return 'amber';
  if (text.includes('hostel') || text.includes('room') || text.includes('allocation')) return 'indigo';
  if (text.includes('registrar') || text.includes('student')) return 'sky';
  if (text.includes('academic') || text.includes('exam') || text.includes('class')) return 'blue';
  return 'cyan';
};

export const getStaffToneStyles = (value) => STAFF_TONES[getStaffTone(value)] || STAFF_TONES.cyan;

export const getStaffShellClasses = (theme) => (
  theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.98),_rgba(15,23,42,0.92)_34%,_rgba(2,6,23,1)_100%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top,_rgba(207,250,254,0.95),_rgba(224,242,254,0.9)_34%,_rgba(219,234,254,0.95)_100%)] text-slate-900'
);
