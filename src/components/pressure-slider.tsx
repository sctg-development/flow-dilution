import { Slider } from "@heroui/slider";
import { type FC } from "react";

interface PressureSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

export const PressureSlider: FC<PressureSliderProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <Slider
      className="max-w-md"
      defaultValue={400}
      getValue={(pressure) => `${pressure} kPa`}
      label={label}
      maxValue={1000}
      minValue={0}
      step={1}
      value={value}
      onChange={(newValue) =>
        onChange(Array.isArray(newValue) ? newValue[0] : newValue)
      }
    />
  );
};
