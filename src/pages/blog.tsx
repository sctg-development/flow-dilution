import React from "react";
import { availableGasMixtures, type GasMixtureExt } from "@sctg/aga8-js";
import { Slider } from "@heroui/slider";
import { GasSelector } from "@/components/GasSelector";
import { OrificeSelector } from "@/components/OrificeSelector";
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

  return (
    <DefaultLayout>
      <section className="">
        <div className="">
          <h1 className={title()}>Dilution</h1>
          <div className="w-full flex flex-row flex-wrap gap-4">
            <Slider
              className="max-w-md"
              defaultValue={400}
              label="Inlet 1 Pressure"
              maxValue={1000}
              minValue={0}
              step={1}
            />
            <Slider
              className="max-w-md"
              defaultValue={400}
              label="Inlet 2 Pressure"
              maxValue={1000}
              minValue={0}
              step={1}
            />
            <GasSelector
              selectedGas={selectedGasInlet1}
              onGasChange={setSelectedGasInlet1}
            />
            <GasSelector
              selectedGas={selectedGasInlet2}
              onGasChange={setSelectedGasInlet2}
            />
            <OrificeSelector
              selectedOrifice={selectedOrificeInlet1}
              onOrificeChange={setSelectedOrificeInlet1}
            />
            <OrificeSelector
              selectedOrifice={selectedOrificeInlet2}
              onOrificeChange={setSelectedOrificeInlet2}
            />
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
