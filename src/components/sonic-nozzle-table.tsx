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
import { useTranslation } from "react-i18next";
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

export const SonicNozzleTable: FC<SonicNozzleTableProps> = ({
  gas,
  temperature,
  pressure,
  outletPressure,
  orifice,
  flowData,
}) => {
  const { t } = useTranslation();
  const { A, molarMass, Rs, rho, p_crit, properties, rho_out, massFlow } =
    flowData;

  const data: {
    section: string;
    rows: [string, number, string][];
  }[] = [
    {
      section: t("input-conditions"),
      rows: [
        [t("temperature"), temperature - 273.15, "°C"],
        [t("inlet-pressure"), pressure, "kPa"],
        [t("outlet-pressure"), outletPressure, "kPa"],
        [t("throat-diameter"), orifice, "mm"],
        [t("throat-area"), A * 1e6, "mm²"],
      ],
    },
    {
      section: t("gas-properties-at-inlet"),
      rows: [
        [t("molar-mass"), molarMass, "g/mol"],
        [t("specific-gas-constant"), Rs, "J/(kg·K)"],
        [t("density"), rho, "kg/m³"],
        [t("critical-flow-factor-cf"), properties.Cf, "-"],
        [t("heat-capacity-ratio-k"), properties.Kappa, "-"],
      ],
    },
    {
      section: t("gas-properties-at-outlet"),
      rows: [[t("density"), rho_out, "kg/m³"]],
    },
    {
      section: t("result", { count: 2 }),
      rows: [
        [t("critical-outlet-pressure"), p_crit, "kPa"],
        [t("mass-flow-rate"), massFlow, "kg/s"],
        [t("mass-flow-rate"), massFlow * 1000 * 3600, "g/h"],
        [t("mass-flow-rate"), massFlow * 1000 * 60, "g/min"],
        [t("volume-flow-at-outlet"), massFlow / rho_out, "m³/s"],
        [t("volume-flow-at-outlet"), (massFlow / rho_out) * 1000, "L/s"],
        [t("volume-flow-at-outlet"), (massFlow / rho_out) * 1000 * 3600, "L/h"],
      ],
    },
  ];

  return (
    <Table
      isStriped
      removeWrapper
      aria-label={t("sonic-nozzle-results-gas-name", {
        gasName: gas.name,
      })}
      className="max-w-full"
    >
      <TableHeader>
        <TableColumn>{t('section')}</TableColumn>
        <TableColumn>{t('parameter')}</TableColumn>
        <TableColumn>{t('value')}</TableColumn>
        <TableColumn>{t('unit')}</TableColumn>
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
