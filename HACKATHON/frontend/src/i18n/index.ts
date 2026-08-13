import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import te from './locales/te.json';
import ta from './locales/ta.json';

export const LANGUAGE_STORAGE_KEY = 'ekishan-language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिंदी' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'ta', nativeName: 'தமிழ்' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
const initialLanguage: LanguageCode = SUPPORTED_LANGUAGES.some((l) => l.code === storedLanguage)
  ? (storedLanguage as LanguageCode)
  : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    pa: { translation: pa },
    te: { translation: te },
    ta: { translation: ta },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
