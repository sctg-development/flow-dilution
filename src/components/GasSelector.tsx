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
import { pureGasMixtures, type GasMixtureExt } from "@sctg/aga8-js";

const usedGasMixtures = [...pureGasMixtures];

interface GasSelectorProps {
  label?: string;
  selectedGas: GasMixtureExt;
  onGasChange: (gas: GasMixtureExt) => void;
}

export const GasSelector: React.FC<GasSelectorProps> = ({
  label,
  selectedGas,
  onGasChange,
}) => {
  return (
    <Select
      aria-label="Gas Mixtures"
      className="max-w-xs"
      label={label}
      labelPlacement="outside-left"
      selectedKeys={new Set([selectedGas.name])}
      selectionMode="single"
      variant="flat"
      onSelectionChange={(keys) => {
        const gasName = keys.currentKey;
        const gas = usedGasMixtures.find((_gas) => _gas.name === gasName);

        if (gas) {
          onGasChange(gas);
        }
      }}
    >
      {usedGasMixtures.map((gas) => (
        <SelectItem key={gas.name}>{gas.name}</SelectItem>
      ))}
    </Select>
  );
};
