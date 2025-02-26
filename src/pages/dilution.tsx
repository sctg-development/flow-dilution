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
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

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

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      temperature,
      gas1: {
        name: selectedGasInlet1.name,
        pressure: inlet1Pressure,
        orifice: selectedOrificeInlet1,
        massFlow: inlet1FlowData.massFlow,
      },
      gas2: {
        name: selectedGasInlet2.name,
        pressure: inlet2Pressure,
        orifice: selectedOrificeInlet2,
        massFlow: inlet2FlowData.massFlow,
      },
      results: {
        concentration: concentrationGas2,
        totalVolumeFlow: outletVolumeFlow,
        criticalPressure,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `dilution-setup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

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
            </div>
          </div>
        </div>

        <Card className="mt-4">
          <CardHeader className="text-lg font-bold -mb-3">
            Flow Ratio Visualization
          </CardHeader>
          <CardBody>
            <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden relative">
              {/* Bande rouge pour le gaz de calibration (affichée en-dessous) */}
              <div
                className="h-full bg-indigo-400 absolute top-0 left-0"
                style={{
                  width: `100%`,
                  right: 0,
                }}
              />
              {/* Bande de gradient pour le gaz de dilution (affichée au-dessus) */}
              <div
                className="h-full bg-gradient-to-r from-emerald-500 from-10% via-sky-500 via-30% to-indigo-500 to-90% absolute top-0 left-0"
                style={{
                  width: `${(inlet1FlowData.massFlow / (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-0.5">
              <span>
                Gas 1:{" "}
                {(
                  (inlet1FlowData.massFlow /
                    (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span>
                Gas 2:{" "}
                {(
                  (inlet2FlowData.massFlow /
                    (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </CardBody>
        </Card>
        <Tabs aria-label="Gas Information" className="mt-4">
          <Tab key="results" title="Results">
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
          </Tab>
          <Tab key="dilution" title="Gas 1 Details">
            {inlet1FlowData && (
              <SonicNozzleTable
                flowData={inlet1FlowData}
                gas={selectedGasInlet1}
                orifice={selectedOrificeInlet1}
                outletPressure={101.325}
                pressure={inlet1Pressure}
                temperature={temperature}
              />
            )}
          </Tab>
          <Tab key="calibration" title="Gas 2 Details">
            {inlet2FlowData && (
              <SonicNozzleTable
                flowData={inlet2FlowData}
                gas={selectedGasInlet1}
                orifice={selectedOrificeInlet2}
                outletPressure={101.325}
                pressure={inlet2Pressure}
                temperature={temperature}
              />
            )}
          </Tab>
        </Tabs>
      </section>
      <div className="mt-4 flex gap-2 justify-start">
        <Tooltip content="Save current configuration as JSON">
          <Button color="secondary" onPress={exportData}>
            Export Configuration
          </Button>
        </Tooltip>
      </div>
    </DefaultLayout>
  );
};
