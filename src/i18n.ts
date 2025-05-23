/**
 * @copyright Copyright (c) 2024-2025 Ronan LE MEILLAT
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * @description
 * This file configures the i18n instance with the following settings:
 *  * The default language is English (en-US)
 *  * The available languages are defined in the availableLanguages array
 *  * The i18n instance is initialized with the i18next-http-backend plugin
 *  * The i18n instance is exported as the default export
 * How to add a new language ?
 *  * Add a new object to the availableLanguages array with the following properties:
 *    * code: The ISO 639-1 language code (e.g., "en-US")
 *    * nativeName: The native name of the language (e.g., "English")
 *    * isRTL: Whether the language is right-to-left (e.g., false)
 *  * Create a new JSON file in the locales/{namespace} directory with the language code (e.g., "en-US.json")
 *  * Manually add a switch case to the loadPath function in the i18n configuration to load the new JSON file
 *  * The new language should now be available for selection in the LanguageSwitch component
 * @see src/components/language-switch.tsx
 * @see src/locales/base/en-US.json
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import i18nextHttpBackend, { HttpBackendOptions } from "i18next-http-backend";

export interface AvailableLanguage {
  code: string; // ISO 639-1 language code
  nativeName: string; // Native name of the language
  isRTL: boolean; // Right-to-left language
  isDefault?: boolean; // Default language
}

export const availableLanguages: AvailableLanguage[] = [
  { code: "en-US", nativeName: "English", isRTL: false, isDefault: true },
  { code: "fr-FR", nativeName: "Français", isRTL: false },
  { code: "es-ES", nativeName: "Español", isRTL: false },
];

const fallbackLng = "en-US";

i18n
  .use(i18nextHttpBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init<HttpBackendOptions>({
    //resources,
    lng:
      localStorage.getItem("preferredLanguage") ||
      availableLanguages.find((lang) => lang.isDefault)?.code ||
      fallbackLng,
    fallbackLng: fallbackLng,
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
