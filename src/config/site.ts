export type SiteConfig = typeof siteConfig;

/**
 * Interface representing a sonic nozzle orifice
 * @interface Orifice
 * @property {number} size - The diameter of the orifice in millimeters
 * @property {string} name - The display name of the orifice (e.g., "1 Micron")
 */
export interface Orifice {
  size: number;
  name: string;
};

export const siteConfig = {
  name: "Flow Dilution",
  description: "Comprehensive dilution simulator for AGA8 gaz",
  navItems: [
    {
      label: "Dilution",
      href: "/",
    },
    {
      label: "Calibration Gas",
      href: "/calibrationgas",
    },
  ],
  navMenuItems: [
    {
      label: "Dilution",
      href: "/",
    },
    {
      label: "Calibration Gas",
      href: "/calibrationgas",
    },
  ],
  links: {
    github: "https://github.com/sctg-development/flow-dilution",
    sponsor: "https://github.com/sponsors/sctg-development",
  },
  orifices: [
    { size: 0.001, name: "1 Micron" },
    { size: 0.002, name: "2 Micron" },
    { size: 0.003, name: "3 Micron" },
    { size: 0.004, name: "4 Micron" },
    { size: 0.005, name: "5 Micron" },
    { size: 0.006, name: "6 Micron" },
    { size: 0.007, name: "7 Micron" },
    { size: 0.008, name: "8 Micron" },
    { size: 0.009, name: "9 Micron" },
    { size: 0.01, name: "10 Micron" },
    { size: 0.012, name: "12 Micron" },
    { size: 0.015, name: "15 Micron" },
    { size: 0.017, name: "17 Micron" },
    { size: 0.02, name: "20 Micron" },
    { size: 0.023, name: "23 Micron" },
    { size: 0.025, name: "25 Micron" },
    { size: 0.03, name: "30 Micron" },
    { size: 0.035, name: "35 Micron" },
    { size: 0.04, name: "40 Micron" },
    { size: 0.045, name: "45 Micron" },
    { size: 0.05, name: "50 Micron" },
    { size: 0.075, name: "75 Micron" },
    { size: 0.1, name: "100 Micron" },
    { size: 0.15, name: "150 Micron" },
    { size: 0.2, name: "200 Micron" },
    { size: 0.25, name: "250 Micron" },
    { size: 0.3, name: "300 Micron" },
    { size: 0.35, name: "350 Micron" },
    { size: 0.4, name: "400 Micron" },
    { size: 0.45, name: "450 Micron" },
    { size: 0.5, name: "500 Micron" },
    { size: 0.55, name: "550 Micron" },
    { size: 0.6, name: "600 Micron" },
    { size: 0.65, name: "650 Micron" },
    { size: 0.7, name: "700 Micron" },
    { size: 0.75, name: "750 Micron" },
    { size: 0.8, name: "800 Micron" },
    { size: 0.85, name: "850 Micron" },
    { size: 0.9, name: "900 Micron" },
    { size: 0.95, name: "950 Micron" },
    { size: 1.0, name: "1 mm" },
  ],
};
