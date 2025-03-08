# Flow Dilution Calculator

A web-based tool for calculating gas flow dilution using sonic nozzles according to ISO 9300:2022 standards.

## Star the project

**If you appreciate my work, please consider giving it a star! 🤩**

## 🚀 Live Flow Dilution Demo

Try it now at [Lasersmart Dilution](https://dilution.lasersmart.work/)!  
Or [Live edit it on CodeSandbox](https://githubbox.com/sctg-development/flow-dilution)

<img width="1257" alt="image" src="https://github.com/user-attachments/assets/e7f4a749-329a-4abc-8a23-6f1f620fc32b" />

## Overview

This application helps calculate and visualize gas flow dilution using sonic nozzles. It implements the AGA8/GERG-2008 equations of state for accurate gas property calculations and follows ISO 9300:2022 standards for sonic nozzle flow calculations.

## Features

- Two main calculation modes:
  - General gas dilution
  - Calibration gas dilution
- Real-time calculation of mass flow rates
- Support for multiple gas mixtures using GERG-2008 equation of state
- Configurable inlet pressures (0-1000 kPa)
- Selectable standard orifice sizes (1-1000 microns)
- Automatic calculation of:
  - Mass flow rates
  - Critical pressures
  - Gas mixture concentrations
  - Final calibration gas concentration
- Predefined calibration concentrations (5-1000 ppm)
- Scientific notation display for precise values
- Responsive design for desktop and mobile use
- Detailed gas properties display for each inlet

## Usage

### General Dilution

1. Select gas mixtures for both inlets
2. Adjust inlet pressures using the sliders
3. Choose appropriate orifice sizes
4. View results in the table below

### Calibration Gas Dilution

1. Set the temperature
2. Configure the dilution gas (typically N₂)
3. Select the calibration gas concentration
4. Adjust pressures and orifice sizes
5. View resulting concentration and flow rates
6. Optional: View detailed gas properties for each inlet

Note: The mass of the calibration gas (ppm values) is ignored in calculations as 1000 ppm = 0.1% is within ISO 9300:2022 standard tolerance.

## Technical Stack

- React 19
- HeroUI 2.7
- TailwindCSS 4
- WebAssembly (via [@sctg/aga8-js](https://github.com/sctg-development/aga8-js))
- TypeScript 5.7
- Vite 6

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

## Privacy & Security

All calculations are performed locally in your browser using WebAssembly technology. No data is ever sent to external servers or third parties. The application can even work offline once loaded, ensuring complete privacy of your calculations and gas mixture configurations.

Key privacy features:

- 100% client-side calculations
- No data collection or tracking
- No external API calls
- Works offline
- No server-side processing

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
