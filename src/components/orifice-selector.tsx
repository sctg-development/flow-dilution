import type React from "react";

import { Select, SelectItem } from "@heroui/select";

import { siteConfig } from "@/config/site";

interface OrificeSelectorProps {
  label?: string;
  selectedOrifice: number;
  onOrificeChange: (orifice: number) => void;
}
export const OrificeSelector: React.FC<OrificeSelectorProps> = ({
  label,
  selectedOrifice,
  onOrificeChange,
}) => {
  return (
    <Select
      aria-label="Orifice Sizes"
      className="max-w-xs"
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
