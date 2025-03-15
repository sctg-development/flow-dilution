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
