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
import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import {
  availableGasMixtures,
  PropertiesGERGResult,
  type GasMixtureExt,
} from "@sctg/aga8-js";
import { ScientificNotation } from "@sctg/scientific-notation";

import { GasInlet } from "@/components/GasInlet";
import { title } from "@/components/primitives";
import { SonicNozzleTable } from "@/components/SonicNozzleTable";
import { DefaultLayout } from "@/layouts/default";
import { FlowData } from "@/utilities";
import { CopyButton } from "@/components/copy-button";

export const DilutionPage = () => {
  const [selectedGasInlet1, setSelectedGasInlet1] = useState<GasMixtureExt>(
    availableGasMixtures[0],
  );
  const [selectedGasInlet2, setSelectedGasInlet2] = useState<GasMixtureExt>(
    availableGasMixtures[0],
  );
  const [selectedOrificeInlet1, setSelectedOrificeInlet1] =
    useState<number>(0.02);
  const [selectedOrificeInlet2, setSelectedOrificeInlet2] =
    useState<number>(0.02);
  const [inlet1Pressure, setInlet1Pressure] = useState<number>(400);
  const [inlet2Pressure, setInlet2Pressure] = useState<number>(400);
  const [inlet1FlowData, setInlet1FlowData] = useState<FlowData>({
    massFlow: 0,
    p_crit: 0,
    A: 0,
    properties: {} as PropertiesGERGResult,
    molarMass: 0,
    Rs: 0,
    rho: 0,
    rho_out: 0,
  });
  const [inlet2FlowData, setInlet2FlowData] = useState<FlowData>({
    massFlow: 0,
    p_crit: 0,
    A: 0,
    properties: {} as PropertiesGERGResult,
    molarMass: 0,
    Rs: 0,
    rho: 0,
    rho_out: 0,
  });
  const [temperature, setTemperature] = useState<number>(293.15);
  const [gas1DetailsVisible, setGas1DetailsVisible] = useState<boolean>(false);
  const [gas2DetailsVisible, setGas2DetailsVisible] = useState<boolean>(false);

  const criticalPressure = useMemo(
    () => Math.min(inlet1FlowData.p_crit, inlet2FlowData.p_crit),
    [inlet1FlowData.p_crit, inlet2FlowData.p_crit],
  );

  const concentrationGas2 = useMemo(
    () =>
      (inlet2FlowData.massFlow /
        (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
      100,
    [inlet1FlowData.massFlow, inlet2FlowData.massFlow],
  );

  const outletVolumeFlow = useMemo(
    () =>
      (inlet1FlowData.massFlow / inlet1FlowData.rho_out +
        inlet2FlowData.massFlow / inlet2FlowData.rho_out) *
      1000,
    [
      inlet1FlowData.massFlow,
      inlet1FlowData.rho_out,
      inlet2FlowData.massFlow,
      inlet2FlowData.rho_out,
    ],
  );

  return (
    <DefaultLayout>
      <section className="">
        <div>
          <h1 className={title()}>Dilution</h1>
          <p>
            This page allows you to compute the mass flow of two gas mixtures in
            a dilution system using two sonic nozzles.
          </p>
          <Input
            isRequired
            className="max-w-xs mt-4"
            defaultValue={temperature.toString()}
            label="Temperature in K"
            labelPlacement="outside-left"
            size="md"
            type="number"
            variant="flat"
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
          <div className="mt-4 w-full flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <GasInlet
                label="Inlet 1"
                pressure={inlet1Pressure}
                selectedGas={selectedGasInlet1}
                selectedOrifice={selectedOrificeInlet1}
                temperature={temperature}
                onFlowDataChange={setInlet1FlowData}
                onGasChange={setSelectedGasInlet1}
                onOrificeChange={setSelectedOrificeInlet1}
                onPressureChange={setInlet1Pressure}
              />
              <Button
                className="mt-4 max-w-xs w-fit"
                color={!gas1DetailsVisible ? "primary" : "secondary"}
                onPress={() => setGas1DetailsVisible(!gas1DetailsVisible)}
              >
                {gas1DetailsVisible ? "Hide" : "Show"} gas 1 properties
              </Button>
            </div>
            <div className="w-w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <GasInlet
                label="Inlet 2"
                pressure={inlet2Pressure}
                selectedGas={selectedGasInlet2}
                selectedOrifice={selectedOrificeInlet2}
                temperature={temperature}
                onFlowDataChange={setInlet2FlowData}
                onGasChange={setSelectedGasInlet2}
                onOrificeChange={setSelectedOrificeInlet2}
                onPressureChange={setInlet2Pressure}
              />
              <Button
                className="mt-4 max-w-xs w-fit"
                color={!gas2DetailsVisible ? "primary" : "secondary"}
                onPress={() => setGas2DetailsVisible(!gas2DetailsVisible)}
              >
                {gas2DetailsVisible ? "Hide" : "Show"} gas 2 properties
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {inlet1FlowData && gas1DetailsVisible && (
            <SonicNozzleTable
              flowData={inlet1FlowData}
              gas={selectedGasInlet1}
              orifice={selectedOrificeInlet1}
              outletPressure={101.325}
              pressure={inlet1Pressure}
              temperature={temperature}
            />
          )}
        </div>
        <div className="mt-4">
          {inlet2FlowData && gas2DetailsVisible && (
            <SonicNozzleTable
              flowData={inlet2FlowData}
              gas={selectedGasInlet2}
              orifice={selectedOrificeInlet2}
              outletPressure={101.325}
              pressure={inlet2Pressure}
              temperature={temperature}
            />
          )}
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
                <CopyButton value={inlet1FlowData.massFlow} />
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
                <CopyButton value={inlet2FlowData.massFlow} />
              </TableCell>
              <TableCell>kg/s</TableCell>
            </TableRow>
            <TableRow key="concentration">
              <TableCell>Concentration of Gas 2 in total flow</TableCell>
              <TableCell>
                {concentrationGas2.toPrecision(5)}
                <CopyButton value={concentrationGas2} />
              </TableCell>
              <TableCell>%</TableCell>
            </TableRow>
            <TableRow key="volumeflow">
              <TableCell>Outlet Volume Flow at 101.325 kPa</TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ScientificNotation.toScientificNotationHTML(
                      outletVolumeFlow,
                      5,
                    ),
                  }}
                />
                <CopyButton value={outletVolumeFlow} />
              </TableCell>
              <TableCell>L/s</TableCell>
            </TableRow>
            <TableRow key="criticalPressure">
              <TableCell>Flow Critical Pressure</TableCell>
              <TableCell>
                {criticalPressure.toPrecision(5)}
                <CopyButton value={criticalPressure} />
              </TableCell>
              <TableCell>kPa</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </DefaultLayout>
  );
};
