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
import { useState, useMemo, lazy, Suspense } from "react";
import { Input } from "@heroui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Skeleton } from "@heroui/skeleton";
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
import { Trans, useTranslation } from "react-i18next";

import { GasInlet } from "@/components/gas-inlet";
import { title } from "@/components/primitives";
import { DefaultLayout } from "@/layouts/default";
import { FlowData } from "@/utilities";
import { CopyButton } from "@/components/copy-button";

const SonicNozzleTable = lazy(() =>
  import("@/components/sonic-nozzle-table").then((module) => ({
    default: module.SonicNozzleTable,
  })),
);

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
  const [inlet1isComputing, setInlet1isComputing] = useState<boolean>(false);
  const [inlet2isComputing, setInlet2isComputing] = useState<boolean>(false);
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
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="">
        <div>
          <h1 className={title()}>{t("dilution")}</h1>
          <p>
            <Trans i18nKey="page-presentation-dilution" />
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
                label={t("inlet", { nb: 1 })}
                pressure={inlet1Pressure}
                selectedGas={selectedGasInlet1}
                selectedOrifice={selectedOrificeInlet1}
                temperature={temperature}
                onComputeFlow={setInlet1isComputing}
                onFlowDataChange={setInlet1FlowData}
                onGasChange={setSelectedGasInlet1}
                onOrificeChange={setSelectedOrificeInlet1}
                onPressureChange={setInlet1Pressure}
              />
            </div>
            <div className="w-w-full md:w-1/2 flex flex-col flex-wrap gap-4">
              <GasInlet
                label={t("inlet", { nb: 2 })}
                pressure={inlet2Pressure}
                selectedGas={selectedGasInlet2}
                selectedOrifice={selectedOrificeInlet2}
                temperature={temperature}
                onComputeFlow={setInlet2isComputing}
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
                  width: `${(inlet1FlowData.massFlow / (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-0.5">
              <span>
                {t("gas")} 1:{" "}
                {(
                  (inlet1FlowData.massFlow /
                    (inlet1FlowData.massFlow + inlet2FlowData.massFlow)) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span>
                {t("gas")} 2:{" "}
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
        <Tabs aria-label={t("gas-information")} className="mt-4">
          <Tab key="results" title={t("result", { count: 2 })}>
            <Table
              removeWrapper
              aria-label={t("flow-results")}
              className="mt-4"
            >
              <TableHeader>
                <TableColumn>Parameter</TableColumn>
                <TableColumn>Value</TableColumn>
                <TableColumn>Unit</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key="flow1">
                  <TableCell>{t("flow-n-mass-flow", { nb: 1 })}</TableCell>
                  <TableCell>
                    {inlet1isComputing ? (
                      <Skeleton className="h-8">&nbsp;</Skeleton>
                    ) : (
                      <>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: ScientificNotation.toScientificNotationHTML(
                              inlet1FlowData.massFlow,
                              5,
                            ),
                          }}
                        />
                        <CopyButton value={inlet1FlowData.massFlow} />
                      </>
                    )}
                  </TableCell>
                  <TableCell>kg/s</TableCell>
                </TableRow>
                <TableRow key="flow2">
                  <TableCell>{t("flow-n-mass-flow", { nb: 2 })}</TableCell>
                  <TableCell>
                    {inlet2isComputing ? (
                      <Skeleton className="h-8">&nbsp;</Skeleton>
                    ) : (
                      <>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: ScientificNotation.toScientificNotationHTML(
                              inlet2FlowData.massFlow,
                              5,
                            ),
                          }}
                        />
                        <CopyButton value={inlet2FlowData.massFlow} />
                      </>
                    )}
                  </TableCell>
                  <TableCell>kg/s</TableCell>
                </TableRow>
                <TableRow key="concentration">
                  <TableCell>
                    {t("concentration-of-gas-n-in-total-flow", { n: 2 })}
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      isLoaded={!inlet1isComputing && !inlet2isComputing}
                    >
                      {concentrationGas2.toPrecision(5)}
                      <CopyButton value={concentrationGas2} />
                    </Skeleton>
                  </TableCell>
                  <TableCell>%</TableCell>
                </TableRow>
                <TableRow key="volumeflow">
                  <TableCell>
                    {t("outlet-volume-flow-at-kpa", { kpa: 101.325 })}
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      isLoaded={!inlet1isComputing && !inlet2isComputing}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ScientificNotation.toScientificNotationHTML(
                            outletVolumeFlow,
                            5,
                          ),
                        }}
                      />
                      <CopyButton value={outletVolumeFlow} />
                    </Skeleton>
                  </TableCell>
                  <TableCell>L/s</TableCell>
                </TableRow>
                <TableRow key="criticalPressure">
                  <TableCell>{t("flow-critical-pressure")}</TableCell>
                  <TableCell>
                    <Skeleton
                      isLoaded={!inlet1isComputing && !inlet2isComputing}
                    >
                      {criticalPressure.toPrecision(5)}
                      <CopyButton value={criticalPressure} />
                    </Skeleton>
                  </TableCell>
                  <TableCell>kPa</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Tab>
          <Tab key="dilution" title={t("gas-n-details", { n: 1 })}>
            <Skeleton isLoaded={!inlet1isComputing}>
              {inlet1FlowData && (
                <Suspense
                  fallback={<Skeleton className="h-8">&nbsp;</Skeleton>}
                >
                  <SonicNozzleTable
                    flowData={inlet1FlowData}
                    gas={selectedGasInlet1}
                    orifice={selectedOrificeInlet1}
                    outletPressure={101.325}
                    pressure={inlet1Pressure}
                    temperature={temperature}
                  />
                </Suspense>
              )}
            </Skeleton>
          </Tab>
          <Tab key="calibration" title={t("gas-n-details", { n: 2 })}>
            <Skeleton isLoaded={!inlet2isComputing}>
              {inlet2FlowData && (
                <Suspense
                  fallback={<Skeleton className="h-8">&nbsp;</Skeleton>}
                >
                  <SonicNozzleTable
                    flowData={inlet2FlowData}
                    gas={selectedGasInlet1}
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
      </section>
      <div className="mt-4 flex gap-2 justify-start">
        <Tooltip content={t("save-current-configuration-as-json")}>
          <Button color="secondary" onPress={exportData}>
            {t("export-configuration")}
          </Button>
        </Tooltip>
      </div>
    </DefaultLayout>
  );
};
