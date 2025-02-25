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
import { useState } from "react";
import {
  availableGasMixtures,
  GasMixtureExt,
  PropertiesGERGResult,
} from "@sctg/aga8-js";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { FlowData, GasInlet } from "@/components/GasInlet";
import { ConcentrationSelector } from "@/components/ConcentrationSelector";
import { OrificeSelector } from "@/components/OrificeSelector";
import { PressureSlider } from "@/components/PressureSlider";

export default function CalibrationGasPage() {
  const [temperature, setTemperature] = useState<number>(293.15);
  const [selectedGasInlet1, setSelectedGasInlet1] = useState<GasMixtureExt>(
    availableGasMixtures.find(
      (gas) => gas.name.toLowerCase() === "nitrogen",
    ) as GasMixtureExt,
  );
  const [inlet1Pressure, setInlet1Pressure] = useState<number>(400);
  const [inlet2Pressure, setInlet2Pressure] = useState<number>(400);
  const [selectedOrificeInlet1, setSelectedOrificeInlet1] =
    useState<number>(0.02);
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

  return (
    <DefaultLayout>
      <section className="">
        <div>
          <h1 className={title()}>Dilution</h1>
          <p>
            This page helps you select appropriate sonic nozzles for diluting
            calibration gases to desired concentrations. For example, you can
            calculate how to dilute a 50 ppm H<sub>2</sub>S in N<sub>2</sub>{" "}
            calibration gas with pure N<sub>2</sub> to achieve a final
            concentration of 5 ppm H<sub>2</sub>S. The calculator uses ISO
            9300:2022 standards for sonic nozzle flow calculations.
          </p>
          <p className="text-xs">Note that the mass of the calibration (ppm values) is ignored in the
            calculation. 1000 ppm = 0.1% so it is less than the ISO9300:2022
            standard tolerance.</p>
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
          <div className="mt-4">
            <PressureSlider
                    label={`Calibration gas Pressure`}
                    value={inlet2Pressure}
                    onChange={setInlet2Pressure}
                  />
            </div>
          <div className="mt-4">
            <OrificeSelector
              label="Calibration orifice"
              selectedOrifice={0.020}
              onOrificeChange={function (orifice: number): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
          <div className="mt-4">
            <ConcentrationSelector
              label="Calibration bottle"
              selectedConcentration={50e-6}
              onConcentrationChange={function (concentration: number): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
