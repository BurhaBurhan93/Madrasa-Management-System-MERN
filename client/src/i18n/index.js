import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ps from './locales/ps/translation.json';
import prs from './locales/prs/translation.json';

const NS = ['app', 'common', 'nav', 'student', 'teacher', 'admin', 'staff', 'attendance', 'exam', 'print', 'error', 'success'];

function toResources(data) {
  const r = {};
  for (const ns of NS) {
    if (data[ns]) r[ns] = { ...data[ns], [ns]: data[ns] };
  }
  return r;
}

i18n.use(initReactI18next).init({
  resources: { en: toResources(en), ps: toResources(ps), prs: toResources(prs) },
  ns: NS,
  defaultNS: 'common',
  lng: 'prs',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
