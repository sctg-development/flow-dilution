import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr-fr.json" assert { type: "json" };
import en from "./locales/en-us.json" assert { type: "json" };
import es from "./locales/es-es.json" assert { type: "json" };

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;