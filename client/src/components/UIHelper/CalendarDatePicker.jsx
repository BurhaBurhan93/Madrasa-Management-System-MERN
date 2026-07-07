import React, { useState, useEffect, useRef } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { CALENDAR_SYSTEMS } from '../../lib/dateUtils';

const toDayValue = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && 'year' in value && 'month' in value && 'day' in value) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
};

const toIsoDate = (day) => {
  if (!day || typeof day !== 'object') return '';
  const utcDate = new Date(Date.UTC(day.year, day.month - 1, day.day));
  return utcDate.toISOString().split('T')[0];
};

const CalendarDatePicker = ({ value, onChange, placeholder = 'Select date', name, required, ...rest }) => {
  const { calSys } = useCalendar();
  const inputRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const day = toDayValue(value);
    setSelectedDay(day);
    if (day) {
      const iso = toIsoDate(day);
      setInputValue(iso);
    } else {
      setInputValue('');
    }
  }, [value]);

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (Number.isNaN(d.getTime())) return dateStr;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateStr;
    }
  };

  const handleNativeChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (typeof onChange !== 'function') return;

    if (name) {
      onChange({ target: { name, value: val } });
    } else {
      onChange(val);
    }
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="date"
        value={formatDateForDisplay(inputValue)}
        onChange={handleNativeChange}
        placeholder={placeholder}
        required={required}
        {...rest}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]"
      />
      {!inputValue && (
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CalendarDatePicker;
