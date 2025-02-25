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

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function CalibrationGasPage() {
  const [temperature, setTemperature] = useState<number>(293.15);

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
        </div>
      </section>
    </DefaultLayout>
  );
}
