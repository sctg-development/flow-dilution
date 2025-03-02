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
import type { FC } from "react";

import { AGA8wasm, R, type GasMixtureExt } from "@sctg/aga8-js";
import { useEffect } from "react";

import { OrificeSelector } from "./orifice-selector";
import { PressureSlider } from "./pressure-slider";
import { ConcentrationSelector } from "./concentration-selector";

import { Cd } from "@/config/site";
import { FlowData, logSonicNozzleFlowCalculation } from "@/utilities";

interface CalibrationInletProps {
  label: string;
  pressure: number;
  selectedGas: GasMixtureExt;
  selectedCalibrationConcentration: number;
  selectedOrifice: number;
  temperature: number;
  onPressureChange: (pressure: number) => void;
  onCalibrationConcentrationChange: (concentration: number) => void;
  onOrificeChange: (orifice: number) => void;
  onFlowDataChange: (flowData: FlowData) => void;
}

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
  const AGA8 = await AGA8wasm();

  AGA8.SetupGERG();

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

  // Output results
  logSonicNozzleFlowCalculation(
    gas,
    temperature,
    pressure,
    outletPressure,
    orifice,
    _flowData,
  );

  return _flowData;
}

export const CalibrationInlet: FC<CalibrationInletProps> = ({
  label,
  pressure,
  selectedGas,
  selectedCalibrationConcentration,
  selectedOrifice,
  temperature,
  onPressureChange,
  onCalibrationConcentrationChange,
  onOrificeChange,
  onFlowDataChange,
}) => {
  useEffect(() => {
    const updateFlow = async () => {
      const newFlowData = await computeGasFlowFunctionOfPressure(
        temperature,
        pressure,
        101.325,
        selectedGas,
        selectedOrifice,
      );

      onFlowDataChange(newFlowData);
    };

    updateFlow();
  }, [temperature, pressure, selectedGas, selectedOrifice, onFlowDataChange]);

  return (
    <div aria-label={`${label} Configuration`} role="group">
      <PressureSlider
        label={`${label} Pressure`}
        value={pressure}
        onChange={onPressureChange}
      />
      <div className="my-4">
        <ConcentrationSelector
          label={`${label} concentration`}
          selectedConcentration={selectedCalibrationConcentration}
          onConcentrationChange={onCalibrationConcentrationChange}
        />
      </div>
      <OrificeSelector
        label={`Orifice ${label}`}
        selectedOrifice={selectedOrifice}
        onOrificeChange={onOrificeChange}
      />
    </div>
  );
};
