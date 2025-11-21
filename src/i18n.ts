import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from './i18n-resources';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      supportedLngs: ['en', 'fr'],
      resources: i18nResources,
      fallbackLng: 'en',
      debug: false,

      detection: {
        order: ['navigator'],
      },

      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    },
    () => {
      document.documentElement.lang = i18n.resolvedLanguage || 'en';
      i18n.on('languageChanged', (lng) => {
        document.documentElement.lang = i18n.resolvedLanguage || 'en';
        console.log(lng);
      });
    }
  )
  .catch((error: unknown) => {
    console.error('i18n initialization error:', error);
  });
export default i18n;
