// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector"; // Import LanguageDetector

import en from "../public/locales/en/translation.json";
import es from "../public/locales/es/translation.json";
import ca from "../public/locales/ca/translation.json";
import ch from "../public/locales/ch/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  ca: { translation: ca },
  ch: { translation: ch },
};

const LOCAL_STORAGE_KEY = "i18nextLng";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    initImmediate: false,
    react: {
      useSuspense: false,
      bindI18n: "languageChanged",
      bindI18nStore: false,
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LOCAL_STORAGE_KEY,
    },
    debug: true,
  });

export default i18n;
