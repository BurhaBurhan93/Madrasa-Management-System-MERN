import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import dariTranslations from './locales/dari.json';
import psTranslations from './locales/ps.json';

const savedLang = localStorage.getItem('teacherLang') || localStorage.getItem('adminLang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      dari: { translation: dariTranslations },
      ps: { translation: psTranslations },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
