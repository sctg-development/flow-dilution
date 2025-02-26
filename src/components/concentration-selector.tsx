import type React from "react";

import { Select, SelectItem } from "@heroui/select";

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
  return (
    <Select
      aria-label="Concentration Values"
      className="max-w-xs"
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
