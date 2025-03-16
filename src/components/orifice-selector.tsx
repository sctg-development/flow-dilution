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
import { type FC } from "react";
import { Select, SelectItem } from "@heroui/select";

import { siteConfig } from "@/config/site";

interface OrificeSelectorProps {
  label?: string;
  selectedOrifice: number;
  onOrificeChange: (orifice: number) => void;
  className?: string;
}
export const OrificeSelector: FC<OrificeSelectorProps> = ({
  label,
  selectedOrifice,
  onOrificeChange,
  className,
}) => {
  if (!className) {
    className = "max-w-xs";
  }

  return (
    <Select
      aria-label="Orifice Sizes"
      className={className}
      label={label}
      labelPlacement="outside-left"
      selectedKeys={new Set([selectedOrifice.toString()])}
      selectionMode="single"
      variant="flat"
      onSelectionChange={(keys) => {
        const orifice = parseFloat(keys.currentKey as string);

        if (!isNaN(orifice)) {
          onOrificeChange(orifice);
        }
      }}
    >
      {siteConfig.orifices.map((orifice) => (
        <SelectItem key={orifice.size}>{orifice.name}</SelectItem>
      ))}
    </Select>
  );
};
