import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import i18nextHttpBackend, { HttpBackendOptions } from "i18next-http-backend";

i18n
  .use(i18nextHttpBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init<HttpBackendOptions>({
    //resources,
    lng: "en-US",
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "sub", "sup"],
    },
    backend: {
      loadPath: (lng) => {
        const reqlng = lng[0];
        let url: URL;

        // Vite does not know how to resolve
        // new URL(`./locales/${reqlng.toLowerCase()}.json`, import.meta.url)
        switch (reqlng) {
          case "en-US":
            url = new URL("./locales/en-us.json", import.meta.url);
            break;
          case "fr-FR":
            url = new URL("./locales/fr-fr.json", import.meta.url);
            break;
          case "es-ES":
            url = new URL("./locales/es-es.json", import.meta.url);
            break;
          default:
            url = new URL("./locales/en-us.json", import.meta.url);
        }

        return url.toString();
      },
    },
  });

export default i18n;
