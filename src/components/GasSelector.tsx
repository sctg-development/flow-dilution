import React from "react";
import { Select, SelectItem } from "@heroui/select";
import { availableGasMixtures, type GasMixtureExt } from "@sctg/aga8-js";

interface GasSelectorProps {
  selectedGas: GasMixtureExt;
  onGasChange: (gas: GasMixtureExt) => void;
}

export const GasSelector: React.FC<GasSelectorProps> = ({
  selectedGas,
  onGasChange,
}) => {
  return (
    <Select
      aria-label="Gas Mixtures"
      className="max-w-xs"
      selectedKeys={new Set([selectedGas.name])}
      selectionMode="single"
      variant="flat"
      onSelectionChange={(keys) => {
        const gasName = keys.currentKey;
        const gas = availableGasMixtures.find((_gas) => _gas.name === gasName);

        if (gas) {
          onGasChange(gas);
        }
      }}
    >
      {availableGasMixtures.map((gas) => (
        <SelectItem key={gas.name}>{gas.name}</SelectItem>
      ))}
    </Select>
  );
};
