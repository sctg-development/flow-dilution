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
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Skeleton } from "@heroui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tab, Tabs } from "@heroui/tabs";
import {
  availableGasMixtures,
  GasMixtureExt,
  PropertiesGERGResult,
} from "@sctg/aga8-js";
import { ScientificNotation } from "@sctg/scientific-notation";
import { lazy, Suspense, useMemo, useState } from "react";

import { CalibrationInlet } from "@/components/calibration-inlet";
import { CopyButton } from "@/components/copy-button";
import { GasInlet } from "@/components/gas-inlet";
import { title } from "@/components/primitives";
import { DefaultLayout } from "@/layouts/default";
import { type FlowData } from "@/utilities";

const SonicNozzleTable = lazy(() =>
  import("@/components/sonic-nozzle-table").then((module) => ({
    default: module.SonicNozzleTable,
  })),
);

export const CalibrationGasPage = () => {
  const { t } = useTranslation();
  /**
   * The temperature in Kelvin.
   */
  const [temperature, setTemperature] = useState<number>(293.15);

  /**
   * The selected gas for the dilution gas.
   */
  const [selectedGasDilution, setSelectedGasDilution] = useState<GasMixtureExt>(
    availableGasMixtures.find(
      (gas) => gas.name.toLowerCase() === "nitrogen",
    ) as GasMixtureExt,
  );

  /**
   * The pressure of the gas for the dilution.
   */
  const [inlet1Pressure, setInletDilutionPressure] = useState<number>(400);

  /**
   * The pressure of the gas for the calibration gas.
   */
  const [inlet2Pressure, setInlet2Pressure] = useState<number>(400);

  /**
   * The sonic nozzle orifice for the dilution gas.
   * The default value is 0.02.
   * The value is in mm.
   */
  const [selectedOrificeInlet1, setSelectedOrificeInletDilution] =
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
  const [inletDilutionFlowData, setInletDilutionFlowData] = useState<FlowData>({
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
  const [inletCalibrationFlowData, setInletCalibrationFlowData] =
    useState<FlowData>({
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

  /**
   * True if the dilution gas is computing.
   */
  const [inletDilutionisComputing, setDilutionisComputing] =
    useState<boolean>(false);
  const [inletCalibrationisComputing, setInletCalibrationisComputing] =
    useState<boolean>(false);

  const exportData = () => {
    const data = {
      temperature,
      dilutionGas: {
        name: selectedGasDilution.name,
        pressure: inlet1Pressure,
        orifice: selectedOrificeInlet1,
        massFlow: inletDilutionFlowData.massFlow,
      },
      calibrationGas: {
        bottleConcentration: selectedCalibrationConcentration,
        pressure: inlet2Pressure,
        orifice: selectedOrificeInlet2,
        massFlow: inletCalibrationFlowData.massFlow,
      },
      results: {
        outletConcentration: calibrationGasConcentration,
        outletVolumeFlow: outletVolumeFlow,
        criticalPressure: Math.min(
          inletDilutionFlowData.p_crit,
          inletCalibrationFlowData.p_crit,
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
        inletDilutionFlowData.massFlow,
        inletDilutionFlowData.rho_out,
        inletCalibrationFlowData.massFlow,
        inletCalibrationFlowData.rho_out,
      ),
    [
      inletDilutionFlowData.massFlow,
      inletDilutionFlowData.rho_out,
      inletCalibrationFlowData.massFlow,
      inletCalibrationFlowData.rho_out,
    ],
  );

  const calibrationGasConcentration = useMemo(
    () =>
      computeCalibrationGasConcentrationAtOutlet(
        inletDilutionFlowData.massFlow,
        inletCalibrationFlowData.massFlow,
        selectedCalibrationConcentration,
      ),
    [
      inletDilutionFlowData.massFlow,
      inletCalibrationFlowData.massFlow,
      selectedCalibrationConcentration,
    ],
  );

  return (
    <DefaultLayout>
      <section className="">
        <div>
          <h1 className={title()}>{t("dilution-of-calibration-gas-bottle")}</h1>
          <p>
            <Trans t={t}>page-presentation-calibration</Trans>
          </p>
          <p className="text-xs">
            {t(
              "note-that-the-mass-of-the-calibration-gas-ppm-values-is-ignored-in-the-calculation-1000-ppm-0-1-so-it-is-less-than-the-iso9300-2022-standard-tolerance",
            )}
          </p>
          <Input
            isRequired
            className="max-w-xs mt-4"
            defaultValue={temperature.toString()}
            label={t("temperature-in-k")}
            labelPlacement="outside-left"
            size="md"
            type="number"
            variant="flat"
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
          <div className="mt-4 w-full flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <GasInlet
                label={t("dilution-gas")}
                pressure={inlet1Pressure}
                selectedGas={selectedGasDilution}
                selectedOrifice={selectedOrificeInlet1}
                temperature={temperature}
                onComputeFlow={setDilutionisComputing}
                onFlowDataChange={setInletDilutionFlowData}
                onGasChange={setSelectedGasDilution}
                onOrificeChange={setSelectedOrificeInletDilution}
                onPressureChange={setInletDilutionPressure}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <CalibrationInlet
                label={t("calibration-bottle")}
                pressure={inlet2Pressure}
                selectedCalibrationConcentration={
                  selectedCalibrationConcentration
                }
                selectedGas={selectedGasDilution}
                selectedOrifice={selectedOrificeInlet2}
                temperature={temperature}
                onCalibrationConcentrationChange={
                  setSelectedCalibrationConcentration
                }
                onComputeFlow={setInletCalibrationisComputing}
                onFlowDataChange={setInletCalibrationFlowData}
                onOrificeChange={setSelectedOrificeInlet2}
                onPressureChange={setInlet2Pressure}
              />
            </div>
          </div>
        </div>
      </section>
      <Card className="mt-4">
        <CardHeader className="text-lg font-bold -mb-3">
          {t("flow-ratio-visualization")}
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
                width: `${(inletDilutionFlowData.massFlow / (inletDilutionFlowData.massFlow + inletCalibrationFlowData.massFlow)) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-0.5">
            <span>
              {t("dilution-gas")}:{" "}
              {(
                (inletDilutionFlowData.massFlow /
                  (inletDilutionFlowData.massFlow +
                    inletCalibrationFlowData.massFlow)) *
                100
              ).toFixed(1)}
              %
            </span>
            <span>
              {t("calibration-gas")}:{" "}
              {(
                (inletCalibrationFlowData.massFlow /
                  (inletDilutionFlowData.massFlow +
                    inletCalibrationFlowData.massFlow)) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
        </CardBody>
      </Card>
      <Tabs aria-label={t("gas-information")} className="mt-4">
        <Tab key="results" title={t("result", { count: 2 })}>
          <Table removeWrapper aria-label={t("flow-results")} className="mt-4">
            <TableHeader>
              <TableColumn>{t("parameter")}</TableColumn>
              <TableColumn>{t("value")}</TableColumn>
              <TableColumn>{t("unit")}</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key={t("dilution-mass-flow")}>
                <TableCell>{t("dilution-mass-flow")}</TableCell>
                <TableCell>
                  {inletDilutionisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            inletDilutionFlowData.massFlow,
                            5,
                          ),
                        }}
                      />
                      <CopyButton value={inletDilutionFlowData.massFlow} />
                    </>
                  )}
                </TableCell>
                <TableCell>kg/s</TableCell>
              </TableRow>
              <TableRow key={t("calibration-bottle-flow")}>
                <TableCell>{t("calibration-bottle-flow")}</TableCell>
                <TableCell>
                  {inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            inletCalibrationFlowData.massFlow,
                            5,
                          ),
                        }}
                      />
                      <CopyButton value={inletCalibrationFlowData.massFlow} />
                    </>
                  )}
                </TableCell>
                <TableCell>kg/s</TableCell>
              </TableRow>
              <TableRow key={t("calibration-gas-mass-flow")}>
                <TableCell>{t("calibration-gas-mass-flow")}</TableCell>
                <TableCell>
                  {inletDilutionisComputing || inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            inletCalibrationFlowData.massFlow *
                              selectedCalibrationConcentration,
                            5,
                          ),
                        }}
                      />
                      <CopyButton
                        value={
                          inletCalibrationFlowData.massFlow *
                          selectedCalibrationConcentration
                        }
                      />
                    </>
                  )}
                </TableCell>
                <TableCell>kg/s</TableCell>
              </TableRow>
              <TableRow key={t("outlet-volume-flow-at-kpa", { kpa: 101.325 })}>
                <TableCell>
                  {t("outlet-volume-flow-at-kpa", { kpa: 101.325 })}
                </TableCell>
                <TableCell>
                  {inletDilutionisComputing || inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            outletVolumeFlow,
                            5,
                          ),
                        }}
                      />
                      <CopyButton value={outletVolumeFlow} />
                    </>
                  )}
                </TableCell>
                <TableCell>L/s</TableCell>
              </TableRow>
              <TableRow
                key={t("outlet-volume-flow-at-kpa", { kpa: 101.325 }) + "2"}
              >
                <TableCell>&nbsp;</TableCell>
                <TableCell>
                  {inletDilutionisComputing || inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            outletVolumeFlow * 1000 * 60,
                            5,
                          ),
                        }}
                      />
                      <CopyButton value={outletVolumeFlow * 1000 * 60} />
                    </>
                  )}
                </TableCell>
                <TableCell>L/min</TableCell>
              </TableRow>
              <TableRow key={t("concentration-of-calibration-gas-at-outlet")}>
                <TableCell>
                  {t("concentration-of-calibration-gas-at-outlet")}
                </TableCell>
                <TableCell>
                  {inletDilutionisComputing || inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            calibrationGasConcentration * 1e6,
                            3,
                          ),
                        }}
                      />
                      <CopyButton value={calibrationGasConcentration * 1e6} />
                    </>
                  )}
                </TableCell>
                <TableCell>ppm</TableCell>
              </TableRow>
              <TableRow key={t("flow-critical-pressure")}>
                <TableCell>{t("flow-critical-pressure")}</TableCell>
                <TableCell>
                  {inletDilutionisComputing || inletCalibrationisComputing ? (
                    <Skeleton className="h-8">&nbsp;</Skeleton>
                  ) : (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            Math.min(
                              inletDilutionFlowData.p_crit,
                              inletCalibrationFlowData.p_crit,
                            ),
                            5,
                          ),
                        }}
                      />
                      <CopyButton
                        value={Math.min(
                          inletDilutionFlowData.p_crit,
                          inletCalibrationFlowData.p_crit,
                        )}
                      />
                    </>
                  )}
                </TableCell>
                <TableCell>kPa</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Tab>
        <Tab key="dilution" title={t("dilution-gas-details")}>
          <Skeleton isLoaded={!inletDilutionisComputing}>
            {inletDilutionFlowData && (
              <Suspense fallback={<Skeleton className="h-8">&nbsp;</Skeleton>}>
                <SonicNozzleTable
                  flowData={inletDilutionFlowData}
                  gas={selectedGasDilution}
                  orifice={selectedOrificeInlet1}
                  outletPressure={101.325}
                  pressure={inlet1Pressure}
                  temperature={temperature}
                />
              </Suspense>
            )}
          </Skeleton>
        </Tab>
        <Tab key="calibration" title={t("calibration-gas-details")}>
          <Skeleton isLoaded={!inletCalibrationisComputing}>
            {inletCalibrationFlowData && (
              <Suspense fallback={<Skeleton className="h-8">&nbsp;</Skeleton>}>
                <SonicNozzleTable
                  flowData={inletCalibrationFlowData}
                  gas={selectedGasDilution}
                  orifice={selectedOrificeInlet2}
                  outletPressure={101.325}
                  pressure={inlet2Pressure}
                  temperature={temperature}
                />
              </Suspense>
            )}
          </Skeleton>
        </Tab>
      </Tabs>
      <Button className="mt-4" color="secondary" onPress={exportData}>
        {t("export-configuration")}
      </Button>
    </DefaultLayout>
  );
};
