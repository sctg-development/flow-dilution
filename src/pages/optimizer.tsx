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
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { Progress } from "@heroui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { availableGasMixtures, GasMixtureExt } from "@sctg/aga8-js";
import { useMemo, useState, useRef } from "react";
import { R } from "@sctg/aga8-js";
import { ScientificNotation } from "@sctg/scientific-notation";

import { CopyButton } from "@/components/copy-button";
import { GasSelector } from "@/components/gas-selector";
import { title, subtitle } from "@/components/primitives";
import { DefaultLayout } from "@/layouts/default";
import { type FlowData } from "@/utilities";
import { siteConfig } from "@/config/site";
import { getAGA8Instance } from "@/utilities";
import { Cd } from "@/config/site";
interface OptimizationResult {
  dilutionOrifice: number;
  dilutionPressure: number;
  calibrationOrifice: number;
  calibrationPressure: number;
  outletVolumeFlow: number;
  outletConcentration: number;
  criticalPressure: number;
  dilutionFlowData: FlowData;
  calibrationFlowData: FlowData;
  score: number;
  flowScore: number;
  concentrationScore: number;
}

export const OptimizerPage = () => {
  const TARGET_SCORE = 0.2; // Target score for optimization
  const { t } = useTranslation();
  const [temperature, setTemperature] = useState<number>(293.15);
  const [selectedGasDilution, setSelectedGasDilution] = useState<GasMixtureExt>(
    availableGasMixtures.find(
      (gas) => gas.name.toLowerCase() === "nitrogen",
    ) as GasMixtureExt,
  );

  const [targetFlowRate, setTargetFlowRate] = useState<number>(1.0); // L/min
  const [targetConcentration, setTargetConcentration] = useState<number>(10); // ppm
  const [
    selectedCalibrationConcentration,
    setSelectedCalibrationConcentration,
  ] = useState<number>(50e-6); // 50 ppm

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [optimizationResults, setOptimizationResults] = useState<
    OptimizationResult[]
  >([]);

  const [minCriticalPressure, setMinCriticalPressure] = useState<number>(150); // kPa
  const [maxCalibrationPressure, setMaxCalibrationPressure] =
    useState<number>(300); // kPa
  const [maxDilutionPressure, setMaxDilutionPressure] = useState<number>(400); // kPa

  const [progress, setProgress] = useState<number>(0);
  // const [totalIterations, setTotalIterations] = useState<number>(0);

  const availableOrifices = useMemo(() => {
    return siteConfig().orifices.map((orifice) => orifice.size);
  }, []);

  // Add this ref for tracking internal progress
  const progressRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);

  /**
   * Compute the gas flow function of pressure
   * @param temperature - Temperature in K
   * @param pressure - Inlet pressure in kPa
   * @param outletPressure - Outlet pressure in kPa
   * @param gas - Gas mixture
   * @param orifice - Orifice diameter in mm
   * @returns the mass flow rate in kg/s and the critical pressure in kPa
   */
  async function computeGasFlowFunctionOfPressure(
    temperature: number,
    pressure: number,
    outletPressure: number,
    gas: GasMixtureExt,
    orifice: number,
  ): Promise<FlowData> {
    // Initialize GERG-2008 module
    const AGA8 = await getAGA8Instance();

    const A = Math.PI * Math.pow(orifice / 2000, 2); // A - Area of the orifice

    // Calculate gas properties
    const molarMass = AGA8.MolarMassGERG(gas.gasMixture); // g/mol
    const { D } = AGA8.DensityGERG(0, temperature, pressure, gas.gasMixture); // mol/L
    const { D: D_out } = AGA8.DensityGERG(
      0,
      temperature,
      outletPressure,
      gas.gasMixture,
    ); // mol/L
    const properties = AGA8.PropertiesGERG(temperature, D, gas.gasMixture);
    const molarMassSI = molarMass / 1000; // kg/mol (SI units)
    const densitySI = D * 1000; // mol/m³ (SI units)
    // Extract critical flow factor (Cf)
    const Cf = properties.Cf;
    /** Specific gas constant */
    const Rs = R / molarMassSI; // J/(kg·K)

    // Maximal outlet pressure (critical flow)
    const p_crit = pressure * Cf; // kPa
    // Calculate mass flow rate
    // Q = Cd * Cf * A * P / sqrt(Rs * T)
    const massFlow =
      (Cd * Cf * A * (pressure * 1000)) / Math.sqrt(Rs * temperature); // kg/s

    const rho = densitySI * molarMassSI; // kg/m³
    const rho_out = D_out * 1000 * molarMassSI; // kg/m³

    const _flowData = {
      massFlow: massFlow,
      p_crit: p_crit,
      A: A,
      properties: properties,
      molarMass: molarMass,
      Rs: Rs,
      rho: rho,
      rho_out: rho_out,
    };

    return _flowData;
  }

  /**
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
    return (massFlow1 / rho_out1 + massFlow2 / rho_out2) * 1000;
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

  const findOptimalConfigurations = async () => {
    setIsCalculating(true);
    setOptimizationResults([]);
    setProgress(0);
    progressRef.current = 0;
    lastProgressUpdateRef.current = 0;

    const results: OptimizationResult[] = [];
    const targetFlowRateLperSec = targetFlowRate / 60; // Convert from L/min to L/s
    const targetConcentrationDimless = targetConcentration / 1e6; // Convert from ppm to dimensionless

    // Set up initial pressure ranges with reasonable step sizes
    const dilutionPressureRange = Array.from(
      { length: 15 },
      (_, i) => 100 + i * 20,
    ); // 100 to 380 kPa
    const calibrationPressureRange = Array.from(
      { length: 11 },
      (_, i) => 100 + i * 20,
    ); // 100 to 300 kPa

    // Use smaller orifices for first pass to reduce computation time
    const smallerOrifices = availableOrifices.filter((o) => o <= 0.1);

    // Calculate total number of iterations for progress tracking
    const filteredDilutionPressures = dilutionPressureRange.filter(
      (p) => p <= maxDilutionPressure,
    );
    const filteredCalibrationPressures = calibrationPressureRange.filter(
      (p) => p <= maxCalibrationPressure,
    );

    const totalCalcs =
      smallerOrifices.length *
      smallerOrifices.length *
      filteredDilutionPressures.length *
      filteredCalibrationPressures.length;

    // setTotalIterations(totalCalcs);

    let completedIterations = 0;

    try {
      // First pass with coarse search
      for (const dilutionOrifice of smallerOrifices) {
        for (const calibrationOrifice of smallerOrifices) {
          for (const dilutionPressure of dilutionPressureRange) {
            if (dilutionPressure > maxDilutionPressure) continue;

            for (const calibrationPressure of calibrationPressureRange) {
              if (calibrationPressure > maxCalibrationPressure) continue;

              // Calculate flows
              const dilutionFlowData = await computeGasFlowFunctionOfPressure(
                temperature,
                dilutionPressure,
                101.325,
                selectedGasDilution,
                dilutionOrifice,
              );

              const calibrationFlowData =
                await computeGasFlowFunctionOfPressure(
                  temperature,
                  calibrationPressure,
                  101.325,
                  selectedGasDilution,
                  calibrationOrifice,
                );

              // Calculate critical pressure
              const criticalPressure = Math.min(
                dilutionFlowData.p_crit,
                calibrationFlowData.p_crit,
              );

              // Check if critical pressure constraint is met
              if (criticalPressure < minCriticalPressure) {
                // Update progress even for skipped configurations
                completedIterations++;
                progressRef.current = Math.floor(
                  (completedIterations / totalCalcs) * 100,
                );

                // Only update the actual progress state periodically to allow UI updates
                const now = Date.now();

                if (
                  progressRef.current > lastProgressUpdateRef.current ||
                  now - lastProgressUpdateRef.current > 500
                ) {
                  // Update at least every 500ms
                  lastProgressUpdateRef.current = now;

                  // Use a promise and setTimeout to ensure the UI can update
                  await new Promise((resolve) => {
                    setTimeout(() => {
                      setProgress(progressRef.current);
                      resolve(null);
                    }, 0);
                  });
                }
                continue;
              }

              // Calculate output flow and concentration
              const outletVolumeFlow = computeOutletVolumeFlowAt101325kPa(
                dilutionFlowData.massFlow,
                dilutionFlowData.rho_out,
                calibrationFlowData.massFlow,
                calibrationFlowData.rho_out,
              );

              const outletConcentration =
                computeCalibrationGasConcentrationAtOutlet(
                  dilutionFlowData.massFlow,
                  calibrationFlowData.massFlow,
                  selectedCalibrationConcentration,
                );

              // Calculate score based on how close we are to targets
              const flowScore =
                Math.abs(outletVolumeFlow - targetFlowRateLperSec) /
                targetFlowRateLperSec;
              const concentrationScore =
                Math.abs(outletConcentration - targetConcentrationDimless) /
                targetConcentrationDimless;
              const score = flowScore + concentrationScore;

              // If score is reasonable, add to results
              if (score < TARGET_SCORE) {
                results.push({
                  dilutionOrifice,
                  dilutionPressure,
                  calibrationOrifice,
                  calibrationPressure,
                  outletVolumeFlow,
                  outletConcentration,
                  criticalPressure,
                  dilutionFlowData,
                  calibrationFlowData,
                  flowScore,
                  concentrationScore,
                  score,
                });
              }

              // Update progress
              completedIterations++;
              progressRef.current = Math.floor(
                (completedIterations / totalCalcs) * 100,
              );

              // Only update the actual progress state periodically to allow UI updates
              const now = Date.now();

              if (
                progressRef.current > lastProgressUpdateRef.current ||
                now - lastProgressUpdateRef.current > 250
              ) {
                // Update at least every 250ms
                lastProgressUpdateRef.current = now;

                // Use a promise and setTimeout to ensure the UI can update
                await new Promise((resolve) => {
                  setTimeout(() => {
                    setProgress(progressRef.current);
                    resolve(null);
                  }, 0);
                });
              }
            }
          }
        }
      }

      // Sort results by score
      results.sort((a, b) => a.score - b.score);

      // Take top 10 results
      setOptimizationResults(results.slice(0, 10));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Optimization error:", error);
    } finally {
      setIsCalculating(false);
      setProgress(100); // Ensure progress is complete even if there was an error
    }
  };

  // Export selected configuration to calibration gas page
  const exportToCalibrationGas = (result: OptimizationResult) => {
    const data = {
      temperature,
      dilutionGas: {
        name: selectedGasDilution.name,
        pressure: result.dilutionPressure,
        orifice: result.dilutionOrifice,
        massFlow: result.dilutionFlowData.massFlow,
      },
      calibrationGas: {
        bottleConcentration: selectedCalibrationConcentration,
        pressure: result.calibrationPressure,
        orifice: result.calibrationOrifice,
        massFlow: result.calibrationFlowData.massFlow,
      },
      results: {
        outletConcentration: result.outletConcentration,
        outletVolumeFlow: result.outletVolumeFlow,
        criticalPressure: result.criticalPressure,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "optimized-calibration-setup.json";
    a.click();
  };

  return (
    <DefaultLayout>
      <section>
        <div>
          <h1 className={title()}>{t("optimizer-title")}</h1>
          <p className={subtitle()}>{t("optimizer-description")}</p>

          <div className="mt-8 flex flex-col gap-4">
            <Card>
              <CardHeader className="text-lg font-bold">
                {t("target-parameters") || "Target Parameters"}
              </CardHeader>
              <CardBody className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-4 md:w-1/2">
                  <Input
                    isRequired
                    className="max-w-xs"
                    defaultValue={temperature.toString()}
                    label={t("temperature-in-k") || "Temperature (K)"}
                    type="number"
                    variant="flat"
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  />

                  <div className="flex flex-col gap-2">
                    <Input
                      isRequired
                      className="max-w-xs"
                      defaultValue={targetFlowRate.toString()}
                      label={t("target-flow-rate")}
                      type="number"
                      variant="flat"
                      onChange={(e) =>
                        setTargetFlowRate(parseFloat(e.target.value))
                      }
                    />

                    <Input
                      isRequired
                      className="max-w-xs"
                      defaultValue={targetConcentration.toString()}
                      label={t("target-concentration")}
                      type="number"
                      variant="flat"
                      onChange={(e) =>
                        setTargetConcentration(parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:w-1/2">
                  <div className="flex flex-col gap-2">
                    <GasSelector
                      label={t("dilution-gas") || "Dilution Gas"}
                      selectedGas={selectedGasDilution}
                      onGasChange={setSelectedGasDilution}
                    />

                    {/* Use concentration selector component if you want to implement it later */}
                    <Input
                      isRequired
                      className="max-w-xs"
                      defaultValue={(
                        selectedCalibrationConcentration * 1e6
                      ).toString()}
                      label={
                        t("calibration-bottle-concentration") ||
                        "Calibration Bottle Concentration (ppm)"
                      }
                      type="number"
                      variant="flat"
                      onChange={(e) =>
                        setSelectedCalibrationConcentration(
                          parseFloat(e.target.value) / 1e6,
                        )
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="text-lg font-bold">
                {t("constraints") || "Constraints"}
              </CardHeader>
              <CardBody className="flex flex-col md:flex-row gap-6">
                <Input
                  isRequired
                  className="max-w-xs"
                  defaultValue={minCriticalPressure.toString()}
                  label={
                    t("min-critical-pressure") || "Min Critical Pressure (kPa)"
                  }
                  type="number"
                  variant="flat"
                  onChange={(e) =>
                    setMinCriticalPressure(parseFloat(e.target.value))
                  }
                />

                <Input
                  isRequired
                  className="max-w-xs"
                  defaultValue={maxCalibrationPressure.toString()}
                  label={
                    t("max-calibration-pressure") ||
                    "Max Calibration Pressure (kPa)"
                  }
                  type="number"
                  variant="flat"
                  onChange={(e) =>
                    setMaxCalibrationPressure(parseFloat(e.target.value))
                  }
                />

                <Input
                  isRequired
                  className="max-w-xs"
                  defaultValue={maxDilutionPressure.toString()}
                  label={
                    t("max-dilution-pressure") || "Max Dilution Pressure (kPa)"
                  }
                  type="number"
                  variant="flat"
                  onChange={(e) =>
                    setMaxDilutionPressure(parseFloat(e.target.value))
                  }
                />
              </CardBody>
            </Card>

            <Button
              className="mt-4 w-fit"
              color="primary"
              isLoading={isCalculating}
              size="lg"
              onPress={findOptimalConfigurations}
            >
              {t("find-optimal-configurations") ||
                "Find Optimal Configurations"}
            </Button>

            {isCalculating && (
              <div className="mt-4 w-full">
                <div className="flex flex-row items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {t("optimizing-configurations") ||
                      "Optimizing configurations..."}
                  </span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress
                  aria-label="Optimization progress"
                  className="w-full"
                  color="primary"
                  showValueLabel={false}
                  value={progress}
                />
              </div>
            )}
          </div>

          {optimizationResults.length > 0 && (
            <div className="mt-8">
              <h2 className={title({ size: "sm" })}>
                {t("optimization-results") || "Optimization Results"}
              </h2>

              {/* Best Result Card - Prominently display the optimal configuration */}
              <Card className="my-6 border-2 border-primary">
                <CardHeader className="bg-primary-50 flex flex-row items-center gap-2">
                  <div className="text-xl font-bold">
                    {t("best-configuration") || "Best Configuration"}
                  </div>
                  <div className="ml-auto">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() =>
                        exportToCalibrationGas(optimizationResults[0])
                      }
                    >
                      {t("export-best-result") || "Export Configuration"}
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t("sonic-nozzles") || "Sonic Nozzles"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("dilution-nozzle") || "Dilution Nozzle"}
                            </div>
                            <div className="text-lg font-medium">
                              {optimizationResults[0].dilutionOrifice} mm
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("calibration-nozzle") || "Calibration Nozzle"}
                            </div>
                            <div className="text-lg font-medium">
                              {optimizationResults[0].calibrationOrifice} mm
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t("inlet-pressures") || "Inlet Pressures"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("dilution-pressure") || "Dilution Pressure"}
                            </div>
                            <div className="text-lg font-medium">
                              {optimizationResults[0].dilutionPressure.toFixed(
                                1,
                              )}{" "}
                              kPa
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("calibration-pressure") ||
                                "Calibration Pressure"}
                            </div>
                            <div className="text-lg font-medium">
                              {optimizationResults[0].calibrationPressure.toFixed(
                                1,
                              )}{" "}
                              kPa
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t("output-parameters") || "Output Parameters"}
                        </h3>
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          <div className="flex flex-row items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {t("flow-rate") || "Flow Rate"}
                            </div>
                            <div className="text-lg font-medium">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html:
                                    ScientificNotation.toScientificNotationHTML(
                                      optimizationResults[0].outletVolumeFlow *
                                        60 *
                                        1,
                                      4,
                                    ),
                                }}
                              />
                              L/min
                              <CopyButton
                                value={
                                  optimizationResults[0].outletVolumeFlow *
                                  60 *
                                  1
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {t("concentration") || "Concentration"}
                            </div>
                            <div className="text-lg font-medium">
                              {(
                                optimizationResults[0].outletConcentration * 1e6
                              ).toFixed(3)}{" "}
                              ppm
                              <CopyButton
                                value={
                                  optimizationResults[0].outletConcentration *
                                  1e6
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {t("critical-pressure") || "Critical Pressure"}
                            </div>
                            <div className="text-lg font-medium">
                              {optimizationResults[0].criticalPressure.toFixed(
                                1,
                              )}{" "}
                              kPa
                              <CopyButton
                                value={optimizationResults[0].criticalPressure}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t("target-match") || "Target Match"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("flow-rate-accuracy") || "Flow Rate Accuracy"}
                            </div>
                            <div className="text-lg font-medium">
                              {(
                                100 -
                                Math.abs(
                                  1 -
                                    (optimizationResults[0].outletVolumeFlow *
                                      60) /
                                      targetFlowRate,
                                ) *
                                  100
                              ).toFixed(2)}
                              %
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              {t("concentration-accuracy") ||
                                "Concentration Accuracy"}
                            </div>
                            <div className="text-lg font-medium">
                              {(
                                100 -
                                Math.abs(
                                  1 -
                                    (optimizationResults[0]
                                      .outletConcentration *
                                      1e6) /
                                      targetConcentration,
                                ) *
                                  100
                              ).toFixed(2)}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <p className="mb-4">
                {t("all-suitable-configurations") ||
                  "All suitable configurations sorted by accuracy:"}
              </p>

              {/* Keep the existing table for all results */}
              <Table
                aria-label={t("optimization-results") || "Optimization Results"}
              >
                <TableHeader>
                  <TableColumn>{t("rank") || "Rank"}</TableColumn>
                  <TableColumn>
                    {t("dilution-orifice") || "Dilution Orifice (mm)"}
                  </TableColumn>
                  <TableColumn>
                    {t("dilution-pressure") || "Dilution Pressure (kPa)"}
                  </TableColumn>
                  <TableColumn>
                    {t("calibration-orifice") || "Calibration Orifice (mm)"}
                  </TableColumn>
                  <TableColumn>
                    {t("calibration-pressure") || "Calibration Pressure (kPa)"}
                  </TableColumn>
                  <TableColumn>
                    {t("flow-rate") || "Flow Rate (L/min)"}
                  </TableColumn>
                  <TableColumn>
                    {t("concentration") || "Concentration (ppm)"}
                  </TableColumn>
                  <TableColumn>
                    {t("critical-pressure") || "Critical Pressure (kPa)"}
                  </TableColumn>
                  <TableColumn>{t("actions") || "Actions"}</TableColumn>
                </TableHeader>
                <TableBody>
                  {optimizationResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{result.dilutionOrifice}</TableCell>
                      <TableCell>
                        {result.dilutionPressure.toFixed(1)}
                      </TableCell>
                      <TableCell>{result.calibrationOrifice}</TableCell>
                      <TableCell>
                        {result.calibrationPressure.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        {(result.outletVolumeFlow * 60).toFixed(2)}
                        <CopyButton value={result.outletVolumeFlow * 60} />
                      </TableCell>
                      <TableCell>
                        {(result.outletConcentration * 1e6).toFixed(2)}
                        <CopyButton value={result.outletConcentration * 1e6} />
                      </TableCell>
                      <TableCell>
                        {result.criticalPressure.toFixed(1)}
                        <CopyButton value={result.criticalPressure} />
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          content={
                            t("export-to-calibration-gas") ||
                            "Export to Calibration Gas"
                          }
                        >
                          <Button
                            size="sm"
                            onPress={() => exportToCalibrationGas(result)}
                          >
                            {t("export") || "Export"}
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
};
