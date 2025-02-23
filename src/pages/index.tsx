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
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { availableGasMixtures, type GasMixtureExt } from "@sctg/aga8-js";

import { FlowData, GasInlet } from "@/components/GasInlet";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { ScientificNotation } from "@/utilities/scientific";

export default function DilutionPage() {
  const [selectedGasInlet1, setSelectedGasInlet1] =
    React.useState<GasMixtureExt>(availableGasMixtures[0]);
  const [selectedGasInlet2, setSelectedGasInlet2] =
    React.useState<GasMixtureExt>(availableGasMixtures[0]);
  const [selectedOrificeInlet1, setSelectedOrificeInlet1] =
    React.useState<number>(0.02);
  const [selectedOrificeInlet2, setSelectedOrificeInlet2] =
    React.useState<number>(0.02);
  const [inlet1Pressure, setInlet1Pressure] = React.useState<number>(400);
  const [inlet2Pressure, setInlet2Pressure] = React.useState<number>(400);
  const [inlet1FlowData, setInlet1FlowData] = React.useState<FlowData>({
    massFlow: 0,
    p_crit: 0,
  });
  const [inlet2FlowData, setInlet2FlowData] = React.useState<FlowData>({
    massFlow: 0,
    p_crit: 0,
  });

  return (
    <DefaultLayout>
      <section className="">
        <div className="">
          <h1 className={title()}>Dilution</h1>
          <div className="mt-4 w-full flex flex-col md:flex-row gap-4">
            <GasInlet
              flowData={inlet1FlowData}
              label="Inlet 1"
              pressure={inlet1Pressure}
              selectedGas={selectedGasInlet1}
              selectedOrifice={selectedOrificeInlet1}
              onFlowDataChange={setInlet1FlowData}
              onGasChange={setSelectedGasInlet1}
              onOrificeChange={setSelectedOrificeInlet1}
              onPressureChange={setInlet1Pressure}
            />
            <GasInlet
              flowData={inlet2FlowData}
              label="Inlet 2"
              pressure={inlet2Pressure}
              selectedGas={selectedGasInlet2}
              selectedOrifice={selectedOrificeInlet2}
              onFlowDataChange={setInlet2FlowData}
              onGasChange={setSelectedGasInlet2}
              onOrificeChange={setSelectedOrificeInlet2}
              onPressureChange={setInlet2Pressure}
            />
          </div>
        </div>
        <Table removeWrapper aria-label="Flow Results" className="mt-4">
          <TableHeader>
            <TableColumn>Parameter</TableColumn>
            <TableColumn>Value</TableColumn>
            <TableColumn>Unit</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="flow1">
              <TableCell>Flow 1 Mass Flow</TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ScientificNotation.toScientificNotationHTML(
                      inlet1FlowData.massFlow,
                      5,
                    ),
                  }}
                />
              </TableCell>
              <TableCell>kg/s</TableCell>
            </TableRow>
            <TableRow key="flow2">
              <TableCell>Flow 2 Mass Flow</TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ScientificNotation.toScientificNotationHTML(
                      inlet2FlowData.massFlow,
                      5,
                    ),
                  }}
                />
              </TableCell>
              <TableCell>kg/s</TableCell>
            </TableRow>
            <TableRow key="concentration">
              <TableCell>Concentration of Gas 2 in total flow</TableCell>
              <TableCell>
                {(
                  (inlet2FlowData.massFlow /
                    (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
                  100
                ).toPrecision(5)}
              </TableCell>
              <TableCell>%</TableCell>
            </TableRow>
            <TableRow key="criticalPressure">
              <TableCell>Flow Critical Pressure</TableCell>
              <TableCell>
                {Math.min(
                  inlet1FlowData.p_crit,
                  inlet2FlowData.p_crit,
                ).toPrecision(5)}
              </TableCell>
              <TableCell>kPa</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </DefaultLayout>
  );
}
