export type SiteConfig = typeof siteConfig;

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
};
