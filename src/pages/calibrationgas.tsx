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

import { Input } from "@heroui/input";
import { useMemo, useState } from "react";
import {
  availableGasMixtures,
  GasMixtureExt,
  PropertiesGERGResult,
} from "@sctg/aga8-js";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { ScientificNotation } from "@sctg/scientific-notation";
import { Button } from "@heroui/button";

import { title } from "@/components/primitives";
import { DefaultLayout } from "@/layouts/default";
import { GasInlet } from "@/components/gas-inlet";
import { CalibrationInlet } from "@/components/calibration-inlet";
import { SonicNozzleTable } from "@/components/sonic-nozzle-table";
import { type FlowData } from "@/utilities";
import { CopyButton } from "@/components/copy-button";

export const CalibrationGasPage = () => {
  /**
   * The temperature in Kelvin.
   */
  const [temperature, setTemperature] = useState<number>(293.15);

  /**
   * The selected gas for the dilution gas.
   */
  const [selectedGasInlet1, setSelectedGasInlet1] = useState<GasMixtureExt>(
    availableGasMixtures.find(
      (gas) => gas.name.toLowerCase() === "nitrogen",
    ) as GasMixtureExt,
  );

  /**
   * The pressure of the gas for the dilution.
   */
  const [inlet1Pressure, setInlet1Pressure] = useState<number>(400);

  /**
   * The pressure of the gas for the calibration gas.
   */
  const [inlet2Pressure, setInlet2Pressure] = useState<number>(400);

  /**
   * The sonic nozzle orifice for the dilution gas.
   * The default value is 0.02.
   * The value is in mm.
   */
  const [selectedOrificeInlet1, setSelectedOrificeInlet1] =
    useState<number>(0.02);

  /**
   * The sonic nozzle orifice for the calibration gas.
   * The default value is 0.02.
   * The value is in mm.
   */
  const [selectedOrificeInlet2, setSelectedOrificeInlet2] =
    useState<number>(0.02);

  /**
   * The flow data for the dilution gas.
   * Contains the mass flow, critical pressure, area, properties, molar mass, Rs, rho, and rho_out…
   * @see https://sctg-development.github.io/aga8-js/
   */
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

  /**
   * The flow data for the calibration gas.
   * Contains the mass flow, critical pressure, area, properties, molar mass, Rs, rho, and rho_out…
   * @see https://sctg-development.github.io/aga8-js/
   */
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

  /**
   * The selected calibration bottle concentration.
   * The default value is 50e-6.
   */
  const [
    selectedCalibrationConcentration,
    setSelectedCalibrationConcentration,
  ] = useState<number>(50e-6);

  const exportData = () => {
    const data = {
      temperature,
      dilutionGas: {
        name: selectedGasInlet1.name,
        pressure: inlet1Pressure,
        orifice: selectedOrificeInlet1,
        massFlow: inlet1FlowData.massFlow,
      },
      calibrationGas: {
        bottleConcentration: selectedCalibrationConcentration,
        pressure: inlet2Pressure,
        orifice: selectedOrificeInlet2,
        massFlow: inlet2FlowData.massFlow,
      },
      results: {
        outletConcentration: calibrationGasConcentration,
        outletVolumeFlow: outletVolumeFlow,
        criticalPressure: Math.min(
          inlet1FlowData.p_crit,
          inlet2FlowData.p_crit,
        ),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "calibration-setup.json";
    a.click();
  };

  /**s
   * Compute the outlet volume flow at 101.325 kPa.
   * @param massFlow1 - The mass flow of the dilution gas.
   * @param rho_out1 - The output density of the dilution gas.
   * @param massFlow2 - The mass flow of the calibration gas.
   * @param rho_out2 - The output density of the calibration gas.
   * @returns The outlet volume flow at 101.325 kPa.
   */
  function computeOutletVolumeFlowAt101325kPa(
    massFlow1: number,
    rho_out1: number,
    massFlow2: number,
    rho_out2: number,
  ): number {
    return massFlow1 / rho_out1 + massFlow2 / rho_out2;
  }

  /**
   * Compute the concentration of the calibration gas at the outlet.
   * @param massFlow1 - The mass flow of the dilution gas in kg/s.
   * @param massFlow2 - The mass flow of the calibration gas in kg/s.
   * @param concentration - The concentration of the calibration gas dimensionless.
   * @returns The concentration of the calibration gas at the outlet.
   */
  function computeCalibrationGasConcentrationAtOutlet(
    massFlow1: number,
    massFlow2: number,
    concentration: number,
  ): number {
    return concentration * (massFlow2 / (massFlow1 + massFlow2));
  }

  // Memoize complex calculations
  const outletVolumeFlow = useMemo(
    () =>
      computeOutletVolumeFlowAt101325kPa(
        inlet1FlowData.massFlow,
        inlet1FlowData.rho_out,
        inlet2FlowData.massFlow,
        inlet2FlowData.rho_out,
      ),
    [
      inlet1FlowData.massFlow,
      inlet1FlowData.rho_out,
      inlet2FlowData.massFlow,
      inlet2FlowData.rho_out,
    ],
  );

  const calibrationGasConcentration = useMemo(
    () =>
      computeCalibrationGasConcentrationAtOutlet(
        inlet1FlowData.massFlow,
        inlet2FlowData.massFlow,
        selectedCalibrationConcentration,
      ),
    [
      inlet1FlowData.massFlow,
      inlet2FlowData.massFlow,
      selectedCalibrationConcentration,
    ],
  );

  return (
    <DefaultLayout>
      <section className="">
        <div>
          <h1 className={title()}>Dilution of calibration gas bottle</h1>
          <p>
            This page helps you select appropriate sonic nozzles for diluting
            calibration gases to desired concentrations. For example, you can
            calculate how to dilute a 50 ppm H<sub>2</sub>S in N<sub>2</sub>{" "}
            calibration gas with pure N<sub>2</sub> to achieve a final
            concentration of 5 ppm H<sub>2</sub>S. The calculator uses ISO
            9300:2022 standards for sonic nozzle flow calculations.
          </p>
          <p className="text-xs">
            Note that the mass of the calibration gas (ppm values) is ignored in
            the calculation. 1000 ppm = 0.1% so it is less than the ISO9300:2022
            standard tolerance.
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
                label="Dilution gas"
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
            <div className="w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <CalibrationInlet
                label={"Calibration bottle"}
                pressure={inlet2Pressure}
                selectedCalibrationConcentration={
                  selectedCalibrationConcentration
                }
                selectedGas={selectedGasInlet1}
                selectedOrifice={selectedOrificeInlet2}
                temperature={temperature}
                onCalibrationConcentrationChange={
                  setSelectedCalibrationConcentration
                }
                onFlowDataChange={setInlet2FlowData}
                onOrificeChange={setSelectedOrificeInlet2}
                onPressureChange={setInlet2Pressure}
              />
            </div>
          </div>
        </div>
      </section>
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
              Dilution Gas:{" "}
              {(
                (inlet1FlowData.massFlow /
                  (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
                100
              ).toFixed(1)}
              %
            </span>
            <span>
              Calibration Gas:{" "}
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
              <TableRow key="Dilution Mass Flow">
                <TableCell>Dilution Mass Flow</TableCell>
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
              <TableRow key="Calibration bottle Flow">
                <TableCell>Calibration bottle Flow</TableCell>
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
              <TableRow key="Calibration gas Mass Flow">
                <TableCell>Calibration gas Mass Flow</TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ScientificNotation.toScientificNotationHTML(
                        inlet2FlowData.massFlow *
                          selectedCalibrationConcentration,
                        5,
                      ),
                    }}
                  />
                  <CopyButton
                    value={
                      inlet2FlowData.massFlow * selectedCalibrationConcentration
                    }
                  />
                </TableCell>
                <TableCell>kg/s</TableCell>
              </TableRow>
              <TableRow key="Outlet Volume Flow at 101.325 kPa">
                <TableCell>Outlet Volume Flow at 101.325 kPa</TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ScientificNotation.toScientificNotationHTML(
                        outletVolumeFlow * 1000,
                        5,
                      ),
                    }}
                  />
                  <CopyButton value={outletVolumeFlow * 1000} />
                </TableCell>
                <TableCell>L/s</TableCell>
              </TableRow>
              <TableRow key="Outlet Volume Flow at 101.325 kPa 2">
                <TableCell>&nbsp;</TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ScientificNotation.toScientificNotationHTML(
                        outletVolumeFlow * 1000 * 60,
                        5,
                      ),
                    }}
                  />
                  <CopyButton value={outletVolumeFlow * 1000 * 60} />
                </TableCell>
                <TableCell>L/min</TableCell>
              </TableRow>
              <TableRow key="Concentration of calibration gas at outlet">
                <TableCell>
                  Concentration of calibration gas at outlet
                </TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ScientificNotation.toScientificNotationHTML(
                        calibrationGasConcentration * 1e6,
                        3,
                      ),
                    }}
                  />
                  <CopyButton
                    value={
                      computeCalibrationGasConcentrationAtOutlet(
                        inlet1FlowData.massFlow,
                        inlet2FlowData.massFlow,
                        selectedCalibrationConcentration,
                      ) * 1e6
                    }
                  />
                </TableCell>
                <TableCell>ppm</TableCell>
              </TableRow>
              <TableRow key="Flow Critical Pressure">
                <TableCell>Flow Critical Pressure</TableCell>
                <TableCell>
                  {Math.min(
                    inlet1FlowData.p_crit,
                    inlet2FlowData.p_crit,
                  ).toPrecision(5)}
                  <CopyButton
                    value={Math.min(
                      inlet1FlowData.p_crit,
                      inlet2FlowData.p_crit,
                    )}
                  />
                </TableCell>
                <TableCell>kPa</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Tab>
        <Tab key="dilution" title="Dilution Gas Details">
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
        <Tab key="calibration" title="Calibration Gas Details">
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
      <Button className="mt-4" color="secondary" onPress={exportData}>
        Export Configuration
      </Button>
    </DefaultLayout>
  );
};
