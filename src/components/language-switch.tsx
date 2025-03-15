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
 */
import { type FC, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const LanguageSwitch: FC = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(i18n.language);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <div className="flex gap-1">
      <button
        className={`${language === "en" ? "text-primary" : "text-default-600"}`}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
      <button
        className={`${language === "fr" ? "text-primary" : "text-default-600"}`}
        onClick={() => changeLanguage("fr")}
      >
        FR
      </button>
      <button
        className={`${language === "es" ? "text-primary" : "text-default-600"}`}
        onClick={() => changeLanguage("es")}
      >
        ES
      </button>
    </div>
  );
};
