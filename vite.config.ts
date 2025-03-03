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
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

import _package from "./package.json";

type PackageJson = {
  name: string;
  private: boolean;
  version: string;
  type: string;
  scripts: {
    dev: string;
    build: string;
    lint: string;
    preview: string;
    [key: string]: string;
  };
  dependencies: {
    react: string;
    "react-dom": string;
    "react-router-dom": string;
    [key: string]: string;
  };
  devDependencies: {
    typescript: string;
    eslint: string;
    vite: string;
    [key: string]: string;
  };
};

const packageJson: PackageJson = _package;

/**
 * Vite plugin to add a version timestamp to the softwareVersion and datePublished
 * in the JSON-LD schema.
 */
function versionTimestampPlugin(): Plugin {
  return {
    name: "version-timestamp",
    transformIndexHtml(html: string) {
      // Create a version timestamp
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      const version = `2.0.${timestamp}`;

      // Update the version and datePublished in the JSON-LD
      return html
        .replace(
          /"softwareVersion":\s*"[^"]*"/,
          `"softwareVersion": "${version}"`,
        )
        .replace(
          /"datePublished":\s*"[^"]*"/,
          `"datePublished": "${year}-${month}-${day}"`,
        );
    },
  };
}

/**
 * Extract all vendor package from package.json dependencies
 * @param packageJson
 * @param vendorPrefix
 * @returns Array of vendor package names
 */
function extractPerVendorDependencies(
  packageJson: PackageJson,
  vendorPrefix: string,
): string[] {
  const dependencies = Object.keys(packageJson.dependencies || {});

  return dependencies.filter((dependency) =>
    dependency.startsWith(`${vendorPrefix}/`),
  );
}

/**
 * Extract all "@heroui/*" package from package.json dependencies
 * @param packageJson
 * @returns Array of "@heroui/*" package names
 */
function extractHerouiDependencies(packageJson: PackageJson): string[] {
  return extractPerVendorDependencies(packageJson, "@heroui");
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(), versionTimestampPlugin()],
  optimizeDeps: {
    exclude: ["@sctg/aga8-js"],
  },
  build: {
    rollupOptions: {
      output: {
        // Customizing the output file names
        entryFileNames: "js/flow-dilution-[hash].js",
        chunkFileNames: "js/flow-dilution-[hash].js",
        assetFileNames: "assets/flow-dilution-[hash].[ext]",
        // Grouping strategy
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
            "@react-aria/visually-hidden",
          ],
          sctg: extractPerVendorDependencies(packageJson, "@sctg"),
          heroui: extractHerouiDependencies(packageJson),
          tailwindcss: ["tailwind-variants", "tailwindcss"],
          utilities: ["framer-motion"],
        },
      },
    },
  },
});
