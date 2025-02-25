import { type FlowData } from "@/components/GasInlet";
import { Cd, Cd_max, Cd_min } from "@/config/site";
import { type GasMixtureExt } from "@sctg/aga8-js";

export 
function logSonicNozzleFlowCalculation(
  gas: GasMixtureExt,
  temperature: number,
  pressure: number,
  outletPressure: number,
  orifice: number,
  flowData: FlowData,
  // eslint-disable-next-line no-console
  target = console.log,
) {
  const { A, molarMass, Rs, rho, p_crit, properties, rho_out, massFlow } =
    flowData;

  target(`Sonic Nozzle Flow Calculation (ISO 9300:2022) for ${gas.name}
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
\t\tCritical flow factor (Cf): ${properties.Cf.toPrecision(6)}
\t\tHeat capacity ratio (κ): ${properties.Kappa.toPrecision(6)}

\tGas properties at outlet conditions:
\t\tDensity: ${rho_out.toPrecision(4)} kg/m³

\tResults:
\t\tOutlet pressure must be : <${p_crit.toPrecision(2)} kPa ${p_crit > outletPressure ? "✅" : "❌"}
\t\tMass flow rate: ${massFlow.toPrecision(4)} kg/s
\t\tMass flow rate: ${(massFlow * 1000 * 3600).toPrecision(4)} g/h
\t\tMass flow rate: ${(massFlow * 1000 * 60).toPrecision(4)} g/min
\t\tVolume flow at outlet: ${(massFlow / rho_out).toPrecision(4)} m³/s (${((massFlow / rho_out) * 1000 * 3600).toPrecision(4)} L/h)`);
}