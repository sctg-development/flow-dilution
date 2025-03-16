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
import type React from "react";

import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";

import { siteConfig } from "@/config/site";

interface ConcentrationSelectorProps {
  label?: string;
  selectedConcentration: number;
  onConcentrationChange: (concentration: number) => void;
}

export const ConcentrationSelector: React.FC<ConcentrationSelectorProps> = ({
  label,
  selectedConcentration,
  onConcentrationChange,
}) => {
  const { t } = useTranslation();

  return (
    <Select
      aria-label={t("concentration-values")}
      className="max-w-[448px] flex flex-row justify-items-stretch"
      label={label}
      labelPlacement="outside-left"
      selectedKeys={new Set([selectedConcentration.toString()])}
      selectionMode="single"
      variant="flat"
      onSelectionChange={(keys) => {
        const concentration = parseFloat(keys.currentKey as string);

        if (!isNaN(concentration)) {
          onConcentrationChange(concentration);
        }
      }}
    >
      {siteConfig.calibrationConcentrations.map((item) => (
        <SelectItem key={item.concentration}>{item.name}</SelectItem>
      ))}
    </Select>
  );
};
