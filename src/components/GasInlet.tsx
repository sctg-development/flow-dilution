import React from "react";
import { AGA8wasm, type GasMixtureExt } from "@sctg/aga8-js";

import { GasSelector } from "./GasSelector";
import { OrificeSelector } from "./OrificeSelector";
import { PressureSlider } from "./PressureSlider";

interface GasInletProps {
  label: string;
  pressure: number;
  selectedGas: GasMixtureExt;
  selectedOrifice: number;
  onPressureChange: (pressure: number) => void;
  onGasChange: (gas: GasMixtureExt) => void;
  onOrificeChange: (orifice: number) => void;
}

async function computeGasFlowFunctionOfPressure(
  pressure: number,
  outletPressure: number,
  gas: GasMixtureExt,
  orifice: number,
): Promise<number> {
  // Initialize GERG-2008 module
  const AGA8 = await AGA8wasm();

  AGA8.SetupGERG();

  const temperature = 273.15 + 20; // 20°C in Kelvin
  const A = Math.PI * Math.pow(orifice / 2000, 2); // A - Area of the orifice

  // Constants for toroidal nozzle
  const Re_thoroidal_max = 3.2e7; // Maximal Reynolds number for toroidal nozzle
  const Re_thoroidal_min = 2.1e4; // Minimal Reynolds number for toroidal nozzle
  const Cd_a = 0.9959; // Constant for toroidal nozzle
  const Cd_b = 2.72; // Reynolds number factor for toroidal nozzle
  const Cd_n = 0.5; // Reynolds number exponent for toroidal nozzle
  const Cd_max = Cd_a - Cd_b * Re_thoroidal_min ** (Cd_n * -1); // Typical discharge coefficient for toroidal sonic nozzle
  const Cd_min = Cd_a - Cd_b * Re_thoroidal_max ** (Cd_n * -1); // Typical discharge coefficient for toroidal sonic nozzle
  const Cd_geometric_mean = Math.sqrt(Cd_max * Cd_min); // Geometric mean of discharge coefficients
  const Cd = Cd_geometric_mean; // Use geometric mean of discharge coefficients
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
  const R = 8.31446261815324; // Universal gas constant in J/(mol·K)
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

  // Output results
  window.console
    .log(`Sonic Nozzle Flow Calculation (ISO 9300:2022) for ${gas.name}
\tInput conditions:
\t\tTemperature: ${(temperature - 273.15).toPrecision(2)}°C
\t\tInlet pressure: ${pressure.toPrecision(3)} kPa (${(pressure / 100).toPrecision(3)} bar)
\t\tOutlet pressure: ${outletPressure.toPrecision(3)} kPa (${(outletPressure / 100).toPrecision(3)} bar)
\t\tThroat diameter: ${orifice.toPrecision(4)} mm
\t\tThroat area: ${(A * 1e6).toPrecision(4)}mm² (${A.toPrecision(4)} m²)
\t\tMaximal discharge coefficient: ${Cd_max.toPrecision(4)}
\t\tMinimal discharge coefficient: ${Cd_min.toPrecision(4)}
\t\tUsed discharge coefficients: ${Cd.toPrecision(4)}

\tGas properties at inlet conditions:
\t\tMolar mass: ${molarMass.toPrecision(4)} g/mol
\t\tSpecific gas constant: ${Rs.toPrecision(4)} J/(kg·K)
\t\tDensity: ${rho.toPrecision(4)} kg/m³
\t\tCritical flow factor (Cf): ${Cf.toPrecision(6)}
\t\tHeat capacity ratio (κ): ${properties.Kappa.toPrecision(6)}

\tGas properties at outlet conditions:
\t\tDensity: ${rho_out.toPrecision(4)} kg/m³

\tResults:
\t\tOutlet pressure must be : <${p_crit.toPrecision(2)} kPa ${p_crit > outletPressure ? "✅" : "❌"}
\t\tMass flow rate: ${massFlow.toPrecision(4)} kg/s
\t\tMass flow rate: ${(massFlow * 1000 * 3600).toPrecision(4)} g/h
\t\tMass flow rate: ${(massFlow * 1000 * 60).toPrecision(4)} g/min
\t\tVolume flow at outlet: ${(massFlow / rho_out).toPrecision(4)} m³/s (${((massFlow / rho_out) * 1000 * 3600).toPrecision(4)} L/h)`);

  return 0;
}

export const GasInlet: React.FC<GasInletProps> = ({
  label,
  pressure,
  selectedGas,
  selectedOrifice,
  onPressureChange,
  onGasChange,
  onOrificeChange,
}) => {
  function localOrificeChange(orifice: number) {
    onOrificeChange(orifice);
    computeGasFlowFunctionOfPressure(pressure, 101.325, selectedGas, orifice);
  }

  function localPressureChange(pressure: number) {
    onPressureChange(pressure);
    computeGasFlowFunctionOfPressure(
      pressure,
      101.325,
      selectedGas,
      selectedOrifice,
    );
  }

  function localGasChange(gas: GasMixtureExt) {
    onGasChange(gas);
    computeGasFlowFunctionOfPressure(pressure, 101.325, gas, selectedOrifice);
  }

  React.useEffect(() => {
    computeGasFlowFunctionOfPressure(
      pressure,
      101.325,
      selectedGas,
      selectedOrifice,
    );
  }, []);

  return (
    <div className="w-full md:w-1/2 flex flex-col flex-wrap gap-4">
      <PressureSlider
        label={`${label} Pressure`}
        value={pressure}
        onChange={localPressureChange}
      />
      <GasSelector
        label={`Gas ${label}`}
        selectedGas={selectedGas}
        onGasChange={localGasChange}
      />
      <OrificeSelector
        label={`Orifice ${label}`}
        selectedOrifice={selectedOrifice}
        onOrificeChange={localOrificeChange}
      />
    </div>
  );
};
