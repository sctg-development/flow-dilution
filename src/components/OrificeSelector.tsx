import React from "react";
import { Select, SelectItem } from "@heroui/select";

interface OrificeSelectorProps {
  selectedOrifice: number;
  onOrificeChange: (orifice: number) => void;
}
export const OrificeSelector: React.FC<OrificeSelectorProps> = ({
  selectedOrifice,
  onOrificeChange,
}) => {
  return (
    <Select
      aria-label="Orifice Sizes"
      className="max-w-xs"
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
      <SelectItem key={0.001}>1 Micron</SelectItem>
      <SelectItem key={0.002}>2 Micron</SelectItem>
      <SelectItem key={0.003}>3 Micron</SelectItem>
      <SelectItem key={0.004}>4 Micron</SelectItem>
      <SelectItem key={0.005}>5 Micron</SelectItem>
      <SelectItem key={0.006}>6 Micron</SelectItem>
      <SelectItem key={0.007}>7 Micron</SelectItem>
      <SelectItem key={0.008}>8 Micron</SelectItem>
      <SelectItem key={0.009}>9 Micron</SelectItem>
      <SelectItem key={0.01}>10 Micron</SelectItem>
      <SelectItem key={0.012}>12 Micron</SelectItem>
      <SelectItem key={0.015}>15 Micron</SelectItem>
      <SelectItem key={0.017}>17 Micron</SelectItem>
      <SelectItem key={0.02}>20 Micron</SelectItem>
      <SelectItem key={0.023}>23 Micron</SelectItem>
      <SelectItem key={0.025}>25 Micron</SelectItem>
      <SelectItem key={0.03}>30 Micron</SelectItem>
      <SelectItem key={0.035}>35 Micron</SelectItem>
      <SelectItem key={0.04}>40 Micron</SelectItem>
      <SelectItem key={0.045}>45 Micron</SelectItem>
      <SelectItem key={0.05}>50 Micron</SelectItem>
      <SelectItem key={0.075}>75 Micron</SelectItem>
      <SelectItem key={0.1}>100 Micron</SelectItem>
      <SelectItem key={0.15}>150 Micron</SelectItem>
      <SelectItem key={0.2}>200 Micron</SelectItem>
      <SelectItem key={0.25}>250 Micron</SelectItem>
      <SelectItem key={0.3}>300 Micron</SelectItem>
      <SelectItem key={0.35}>350 Micron</SelectItem>
      <SelectItem key={0.4}>400 Micron</SelectItem>
      <SelectItem key={0.45}>450 Micron</SelectItem>
      <SelectItem key={0.5}>500 Micron</SelectItem>
      <SelectItem key={0.55}>550 Micron</SelectItem>
      <SelectItem key={0.6}>600 Micron</SelectItem>
      <SelectItem key={0.65}>650 Micron</SelectItem>
      <SelectItem key={0.7}>700 Micron</SelectItem>
      <SelectItem key={0.75}>750 Micron</SelectItem>
      <SelectItem key={0.8}>800 Micron</SelectItem>
      <SelectItem key={0.85}>850 Micron</SelectItem>
      <SelectItem key={0.9}>900 Micron</SelectItem>
      <SelectItem key={0.95}>950 Micron</SelectItem>
      <SelectItem key={1.0}>1000 Micron</SelectItem>
    </Select>
  );
};
