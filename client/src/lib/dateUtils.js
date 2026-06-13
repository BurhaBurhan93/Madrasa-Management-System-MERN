/**
 * Multi-Calendar Date Utility
 * Supports: Gregorian, Hijri (Islamic), Jalali (Persian/Shamsi)
 * 
 * Dates are stored as UTC/Gregorian in MongoDB.
 * Conversion happens only at display time.
 */

import moment from 'moment';
import momentHijri from 'moment-hijri';
import momentJalaali from 'moment-jalaali';

// Calendar system names
export const CALENDAR_SYSTEMS = {
  GREGORIAN: 'gregorian',
  HIJRI: 'hijri',
  JALALI: 'jalali',
};

// Calendar labels per language
export const calendarLabels = {
  en: {
    gregorian: 'Gregorian',
    hijri: 'Hijri (Islamic)',
    jalali: 'Jalali (Persian)',
  },
  dari: {
    gregorian: 'میلادی',
    hijri: 'هجری قمری',
    jalali: 'هجری شمسی',
  },
  ps: {
    gregorian: 'میلادي',
    hijri: 'هجري قمري',
    jalali: 'هجري شمسي',
  },
};

/**
 * Format a date based on the selected calendar system
 * @param {Date|string} date - The date to format (stored as Gregorian)
 * @param {string} calendar - 'gregorian' | 'hijri' | 'jalali'
 * @param {string} format - Output format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, calendar = CALENDAR_SYSTEMS.GREGORIAN, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  try {
    switch (calendar) {
      case CALENDAR_SYSTEMS.HIJRI:
        return momentHijri(date).format('iYYYY/iMM/iDD');
      
      case CALENDAR_SYSTEMS.JALALI:
        return momentJalaali(date).format('jYYYY/jMM/jDD');
      
      case CALENDAR_SYSTEMS.GREGORIAN:
      default:
        return moment(date).format(format);
    }
  } catch (e) {
    console.error('Date formatting error:', e);
    return moment(date).format(format);
  }
};

/**
 * Format a date with full display (includes day name and calendar label)
 * @param {Date|string} date 
 * @param {string} calendar 
 * @param {string} lang - 'en' | 'dari' | 'ps'
 * @returns {string} e.g., "Monday, 1403/09/15 (Jalali)"
 */
export const formatDateFull = (date, calendar = CALENDAR_SYSTEMS.GREGORIAN, lang = 'en') => {
  if (!date) return '';
  
  const labels = calendarLabels[lang] || calendarLabels.en;
  
  try {
    switch (calendar) {
      case CALENDAR_SYSTEMS.HIJRI: {
        const m = momentHijri(date);
        const dayName = m.format('dddd');
        const hijriDate = m.format('iYYYY/iMM/iDD');
        return `${dayName} ${hijriDate} (${labels.hijri})`;
      }
      
      case CALENDAR_SYSTEMS.JALALI: {
        const m = momentJalaali(date);
        const dayName = m.format('dddd');
        const jalaliDate = m.format('jYYYY/jMM/jDD');
        return `${dayName} ${jalaliDate} (${labels.jalali})`;
      }
      
      case CALENDAR_SYSTEMS.GREGORIAN:
      default: {
        const m = moment(date);
        const dayName = m.format('dddd');
        const gregDate = m.format('YYYY/MM/DD');
        return `${dayName} ${gregDate} (${labels.gregorian})`;
      }
    }
  } catch (e) {
    return moment(date).format('dddd YYYY/MM/DD');
  }
};

/**
 * Format date with time
 * @param {Date|string} date 
 * @param {string} calendar 
 * @returns {string}
 */
export const formatDateTime = (date, calendar = CALENDAR_SYSTEMS.GREGORIAN) => {
  if (!date) return '';
  
  try {
    switch (calendar) {
      case CALENDAR_SYSTEMS.HIJRI:
        return momentHijri(date).format('iYYYY/iMM/iDD HH:mm');
      case CALENDAR_SYSTEMS.JALALI:
        return momentJalaali(date).format('jYYYY/jMM/jDD HH:mm');
      default:
        return moment(date).format('YYYY-MM-DD HH:mm');
    }
  } catch (e) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
};

/**
 * Convert a Hijri date string to Gregorian Date
 * @param {string} hijriStr - e.g., "1446/06/15"
 * @returns {Date} Gregorian date
 */
export const hijriToGregorian = (hijriStr) => {
  try {
    const m = momentHijri(hijriStr, 'iYYYY/iMM/iDD');
    return m.toDate();
  } catch (e) {
    console.error('Hijri conversion error:', e);
    return new Date();
  }
};

/**
 * Convert a Jalali date string to Gregorian Date
 * @param {string} jalaliStr - e.g., "1403/09/15"
 * @returns {Date} Gregorian date
 */
export const jalaliToGregorian = (jalaliStr) => {
  try {
    const m = momentJalaali(jalaliStr, 'jYYYY/jMM/jDD');
    return m.toDate();
  } catch (e) {
    console.error('Jalali conversion error:', e);
    return new Date();
  }
};

/**
 * Convert any calendar date to Gregorian (for saving to MongoDB)
 * @param {string} dateStr - Date string
 * @param {string} sourceCalendar - Source calendar system
 * @returns {Date} Gregorian Date object
 */
export const toGregorian = (dateStr, sourceCalendar = CALENDAR_SYSTEMS.GREGORIAN) => {
  if (!dateStr) return null;
  
  switch (sourceCalendar) {
    case CALENDAR_SYSTEMS.HIJRI:
      return hijriToGregorian(dateStr);
    case CALENDAR_SYSTEMS.JALALI:
      return jalaliToGregorian(dateStr);
    default:
      return new Date(dateStr);
  }
};

/**
 * Get relative time (e.g., "3 hours ago")
 * @param {Date|string} date 
 * @returns {string}
 */
export const timeAgo = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Check if date is today
 * @param {Date|string} date 
 * @returns {boolean}
 */
export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Get calendar system from localStorage
 * @param {string} panelPrefix - 'admin', 'staff', 'teacher', 'student'
 * @returns {string} Calendar system
 */
export const getCalendarSystem = (panelPrefix = 'admin') => {
  const saved = localStorage.getItem(`${panelPrefix}Calendar`);
  if (saved && Object.values(CALENDAR_SYSTEMS).includes(saved)) return saved;
  return CALENDAR_SYSTEMS.GREGORIAN;
};

/**
 * Save calendar system to localStorage
 * @param {string} panelPrefix 
 * @param {string} calendar 
 */
export const setCalendarSystem = (panelPrefix, calendar) => {
  localStorage.setItem(`${panelPrefix}Calendar`, calendar);
};

export default {
  CALENDAR_SYSTEMS,
  calendarLabels,
  formatDate,
  formatDateFull,
  formatDateTime,
  hijriToGregorian,
  jalaliToGregorian,
  toGregorian,
  timeAgo,
  isToday,
  getCalendarSystem,
  setCalendarSystem,
};
