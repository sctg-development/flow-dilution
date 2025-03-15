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
import reactI18n from "../i18n";

export type SiteConfig = typeof siteConfig;

const t = reactI18n.t;

/**
 * Interface representing a sonic nozzle orifice
 * @interface Orifice
 * @property {number} size - The diameter of the orifice in millimeters
 * @property {string} name - The display name of the orifice (e.g., "1 Micron")
 */
export interface Orifice {
  size: number;
  name: string;
}

/**
 * Interface representing a calibration gas concentration
 * @interface Concentration
 * @property {number} concentration - The concentration value in ppm
 * @property {string} name - The display name of the concentration (e.g., "5 ppm")
 */
export interface Concentration {
  concentration: number;
  name: string;
}

export const siteConfig = {
  name: t("site-name"),
  description: t("comprehensive-dilution-simulator-for-aga8-gaz"),
  navItems: [
    {
      label: t("dilution"),
      href: "/",
    },
    {
      label: t("calibration-gas"),
      href: "/calibrationgas",
    },
    {
      label: t("aga8-computations"),
      href: "https://aga8.lasersmart.work/",
    },
    {
      label: t("sonic-nozzle"),
      href: "https://sonic.lasersmart.work/",
    },
  ],
  navMenuItems: [
    {
      label: t("dilution"),
      href: "/",
    },
    {
      label: t("calibration-gas"),
      href: "/calibrationgas",
    },
    {
      label: t("aga8-computations"),
      href: "https://aga8.lasersmart.work/",
    },
    {
      label: t("sonic-nozzle"),
      href: "https://sonic.lasersmart.work/",
    },
  ],
  links: {
    github: "https://github.com/sctg-development/flow-dilution",
    sponsor: "https://github.com/sponsors/sctg-development",
  },
  orifices: [
    { size: 0.001, name: t("micron", { count: 1 }) },
    { size: 0.002, name: t("micron", { count: 2 }) },
    { size: 0.003, name: t("micron", { count: 3 }) },
    { size: 0.004, name: t("micron", { count: 4 }) },
    { size: 0.005, name: t("micron", { count: 5 }) },
    { size: 0.006, name: t("micron", { count: 6 }) },
    { size: 0.007, name: t("micron", { count: 7 }) },
    { size: 0.008, name: t("micron", { count: 8 }) },
    { size: 0.009, name: t("micron", { count: 9 }) },
    { size: 0.01, name: t("micron", { count: 10 }) },
    { size: 0.012, name: t("micron", { count: 12 }) },
    { size: 0.015, name: t("micron", { count: 15 }) },
    { size: 0.017, name: t("micron", { count: 17 }) },
    { size: 0.02, name: t("micron", { count: 20 }) },
    { size: 0.023, name: t("micron", { count: 23 }) },
    { size: 0.025, name: t("micron", { count: 25 }) },
    { size: 0.03, name: t("micron", { count: 30 }) },
    { size: 0.035, name: t("micron", { count: 35 }) },
    { size: 0.04, name: t("micron", { count: 40 }) },
    { size: 0.045, name: t("micron", { count: 45 }) },
    { size: 0.05, name: t("micron", { count: 50 }) },
    { size: 0.075, name: t("micron", { count: 75 }) },
    { size: 0.1, name: t("micron", { count: 100 }) },
    { size: 0.15, name: t("micron", { count: 150 }) },
    { size: 0.2, name: t("micron", { count: 200 }) },
    { size: 0.25, name: t("micron", { count: 250 }) },
    { size: 0.3, name: t("micron", { count: 300 }) },
    { size: 0.35, name: t("micron", { count: 350 }) },
    { size: 0.4, name: t("micron", { count: 400 }) },
    { size: 0.45, name: t("micron", { count: 450 }) },
    { size: 0.5, name: t("micron", { count: 500 }) },
    { size: 0.55, name: t("micron", { count: 550 }) },
    { size: 0.6, name: t("micron", { count: 600 }) },
    { size: 0.65, name: t("micron", { count: 650 }) },
    { size: 0.7, name: t("micron", { count: 700 }) },
    { size: 0.75, name: t("micron", { count: 750 }) },
    { size: 0.8, name: t("micron", { count: 800 }) },
    { size: 0.85, name: t("micron", { count: 850 }) },
    { size: 0.9, name: t("micron", { count: 900 }) },
    { size: 0.95, name: t("micron", { count: 950 }) },
    { size: 1.0, name: t("millimeter", { count: 1 }) },
  ],
  calibrationConcentrations: [
    { concentration: 5e-6, name: "5 ppm" },
    { concentration: 10e-6, name: "10 ppm" },
    { concentration: 20e-6, name: "20 ppm" },
    { concentration: 30e-6, name: "30 ppm" },
    { concentration: 50e-6, name: "50 ppm" },
    { concentration: 100e-6, name: "100 ppm" },
    { concentration: 200e-6, name: "200 ppm" },
    { concentration: 500e-6, name: "500 ppm" },
    { concentration: 1e-3, name: "1000 ppm" },
  ],
};

// Constants for toroidal nozzle
export const Re_thoroidal_max = 3.2e7; // Maximal Reynolds number for toroidal nozzle
export const Re_thoroidal_min = 2.1e4; // Minimal Reynolds number for toroidal nozzle
export const Cd_a = 0.9959; // Constant for toroidal nozzle
export const Cd_b = 2.72; // Reynolds number factor for toroidal nozzle
export const Cd_n = 0.5; // Reynolds number exponent for toroidal nozzle
export const Cd_max = Cd_a - Cd_b * Re_thoroidal_min ** (Cd_n * -1); // Typical discharge coefficient for toroidal sonic nozzle
export const Cd_min = Cd_a - Cd_b * Re_thoroidal_max ** (Cd_n * -1); // Typical discharge coefficient for toroidal sonic nozzle
export const Cd_geometric_mean = Math.sqrt(Cd_max * Cd_min); // Geometric mean of discharge coefficients
export const Cd = Cd_geometric_mean; // Use geometric mean of discharge coefficients
