# Flow Dilution Calculator

A web-based tool for calculating gas flow dilution using sonic nozzles according to ISO 9300:2022 standards.

## Overview

This application helps calculate and visualize gas flow dilution using sonic nozzles. It implements the AGA8/GERG-2008 equations of state for accurate gas property calculations and follows ISO 9300:2022 standards for sonic nozzle flow calculations.

## Features

- Real-time calculation of mass flow rates
- Support for multiple gas mixtures using GERG-2008 equation of state
- Configurable inlet pressures (0-1000 kPa)
- Selectable orifice sizes (1-1000 microns)
- Automatic calculation of:
  - Mass flow rates
  - Critical pressures
  - Gas mixture concentrations
- Scientific notation display for precise values
- Responsive design for desktop and mobile use

## Technical Stack

- React 19
- HeroUI 2.7
- TailwindCSS 4
- WebAssembly (via @sctg/aga8-js)
- TypeScript
- Vite

## Installation

```bash
# Clone the repository
git clone https://github.com/sctg-development/flow-dilution.git

# Install dependencies
cd flow-dilution
npm install

# Start development server
npm run dev
```

## Usage

1. Select gas mixtures for both inlets
2. Adjust inlet pressures using the sliders
3. Choose appropriate orifice sizes
4. View results in the table below:
   - Mass flow rates for each inlet
   - Resulting concentration
   - Critical pressure requirements

## Technical Details

The application uses the GERG-2008 equation of state through a WebAssembly port (@sctg/aga8-js) to calculate gas properties. Flow calculations follow ISO 9300:2022 standards for sonic nozzles, including:

- Critical flow factor calculations
- Discharge coefficient estimation
- Mass flow rate computation
- Critical pressure ratio verification

## Dependencies

- [@sctg/aga8-js](https://github.com/sctg-development/aga8-js) - GERG-2008 equation of state
- [vite-react-heroui-template](https://github.com/sctg-development/vite-react-heroui-template) - Base template

## License

Copyright (c) 2024-2025 Ronan LE MEILLAT

This project is licensed under the GNU Affero General Public License v3.0 or later - see the [LICENSE](LICENSE.md) file for details.

## Author

Ronan LE MEILLAT  
SCTG Development

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Acknowledgments

- Based on ISO 9300:2022 standards
- Uses GERG-2008 equation of state
- Implements AGA8 calculations