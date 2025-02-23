import React from "react";
import { availableGasMixtures, type GasMixtureExt } from "@sctg/aga8-js";

import { GasInlet } from "@/components/GasInlet";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DilutionPage() {
  const [selectedGasInlet1, setSelectedGasInlet1] =
    React.useState<GasMixtureExt>(availableGasMixtures[0]);
  const [selectedGasInlet2, setSelectedGasInlet2] =
    React.useState<GasMixtureExt>(availableGasMixtures[0]);
  const [selectedOrificeInlet1, setSelectedOrificeInlet1] =
    React.useState<number>(0.02);
  const [selectedOrificeInlet2, setSelectedOrificeInlet2] =
    React.useState<number>(0.02);
  const [inlet1Pressure, setInlet1Pressure] = React.useState<number>(400);
  const [inlet2Pressure, setInlet2Pressure] = React.useState<number>(400);

  return (
    <DefaultLayout>
      <section className="">
        <div className="">
          <h1 className={title()}>Dilution</h1>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <GasInlet
              label="Inlet 1"
              pressure={inlet1Pressure}
              selectedGas={selectedGasInlet1}
              selectedOrifice={selectedOrificeInlet1}
              onGasChange={setSelectedGasInlet1}
              onOrificeChange={setSelectedOrificeInlet1}
              onPressureChange={setInlet1Pressure}
            />
            <GasInlet
              label="Inlet 2"
              pressure={inlet2Pressure}
              selectedGas={selectedGasInlet2}
              selectedOrifice={selectedOrificeInlet2}
              onGasChange={setSelectedGasInlet2}
              onOrificeChange={setSelectedOrificeInlet2}
              onPressureChange={setInlet2Pressure}
            />
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
