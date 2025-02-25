import type React from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { type GasMixtureExt } from "@sctg/aga8-js";
import { ScientificNotation } from "@sctg/scientific-notation";
import { type FlowData } from "@/utilities";

interface SonicNozzleTableProps {
  gas: GasMixtureExt;
  temperature: number;
  pressure: number;
  outletPressure: number;
  orifice: number;
  flowData: FlowData;
}

export const SonicNozzleTable: React.FC<SonicNozzleTableProps> = ({
  gas,
  temperature,
  pressure,
  outletPressure,
  orifice,
  flowData,
}) => {
  const { A, molarMass, Rs, rho, p_crit, properties, rho_out, massFlow } =
    flowData;

  const data: {
    section: string;
    rows: [string, number, string][];
  }[] = [
    {
      section: "Input Conditions",
      rows: [
        ["Temperature", temperature - 273.15, "°C"],
        ["Inlet pressure", pressure, "kPa"],
        ["Outlet pressure", outletPressure, "kPa"],
        ["Throat diameter", orifice, "mm"],
        ["Throat area", A * 1e6, "mm²"],
      ],
    },
    {
      section: "Gas Properties at Inlet",
      rows: [
        ["Molar mass", molarMass, "g/mol"],
        ["Specific gas constant", Rs, "J/(kg·K)"],
        ["Density", rho, "kg/m³"],
        ["Critical flow factor (Cf)", properties.Cf, "-"],
        ["Heat capacity ratio (κ)", properties.Kappa, "-"],
      ],
    },
    {
      section: "Gas Properties at Outlet",
      rows: [["Density", rho_out, "kg/m³"]],
    },
    {
      section: "Results",
      rows: [
        ["Critical outlet pressure", p_crit, "kPa"],
        ["Mass flow rate", massFlow, "kg/s"],
        ["Mass flow rate", massFlow * 1000 * 3600, "g/h"],
        ["Mass flow rate", massFlow * 1000 * 60, "g/min"],
        ["Volume flow at outlet", massFlow / rho_out, "m³/s"],
        ["Volume flow at outlet", (massFlow / rho_out) * 1000, "L/s"],
        ["Volume flow at outlet", (massFlow / rho_out) * 1000 * 3600, "L/h"],
      ],
    },
  ];

  return (
    <Table
      isStriped
      removeWrapper
      aria-label={`Sonic Nozzle Results - ${gas.name}`}
      className="max-w-full"
    >
      <TableHeader>
        <TableColumn>Section</TableColumn>
        <TableColumn>Parameter</TableColumn>
        <TableColumn>Value</TableColumn>
        <TableColumn>Unit</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map(
          (section) =>
            section.rows.map(([param, value, unit], rowIndex) => (
              <TableRow key={`${section.section}-${param}-${unit}`}>
                {rowIndex === 0 ? (
                  <TableCell rowSpan={section.rows.length}>
                    {section.section}
                  </TableCell>
                ) : (
                  <TableCell hidden>&nbsp;</TableCell>
                )}
                <TableCell>{param}</TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ScientificNotation.toScientificNotationHTML(
                        value,
                        4,
                      ),
                    }}
                  />
                </TableCell>
                <TableCell>{unit}</TableCell>
              </TableRow>
            )) as any,
        )}
      </TableBody>
    </Table>
  );
};
