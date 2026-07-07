import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ps', label: 'Pashto', dir: 'rtl' },
  { code: 'prs', label: 'Dari', dir: 'rtl' },
];

const LanguageSwitcher = ({ onChange, dark }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = i18n.language || 'en';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (code, dir) => {
    localStorage.setItem('i18nextLng', code);
    localStorage.setItem('lang', code === 'dari' ? 'prs' : code);
    localStorage.setItem('teacherLang', code === 'dari' ? 'prs' : code);
    localStorage.setItem('adminLang', code === 'dari' ? 'prs' : code);
    i18n.changeLanguage(code);
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
    setOpen(false);
    if (onChange) onChange(code);
  };

  const currentLabel = LANGUAGES.find(l => l.code === current)?.label || 'EN';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-11 items-center gap-2 rounded-2xl border px-3 text-xs font-bold uppercase tracking-widest outline-none transition-all hover:-translate-y-0.5 ${
          dark
            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
        }`}
      >
        <FiGlobe size={14} />
        {currentLabel}
      </button>

      {open && (
        <div className={`absolute right-0 mt-1 w-40 rounded-xl border shadow-lg overflow-hidden ${
          dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
        }`}>
          {LANGUAGES.map(lang => {
            const active = lang.code === current;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => switchLanguage(lang.code, lang.dir)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  dark
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                } ${active ? (dark ? 'bg-slate-700 font-semibold' : 'bg-cyan-50 font-semibold text-cyan-700') : ''}`}
              >
                {lang.label}
                {active && <FiCheck size={16} className={dark ? 'text-slate-300' : 'text-cyan-600'} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
