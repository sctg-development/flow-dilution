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
import fs from "node:fs";
import path from "node:path";

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
 * Vite plugin to configure some values in the JSON-LD schema
 * - Update the softwareVersion with a timestamp
 * - Update the datePublished with the current date
 * - Update the fileSize with the size of the dist folder
 * in the JSON-LD schema.
 */
function jsonLdSetPlugin(): Plugin {
  return {
    name: "version-timestamp",
    enforce: "post",
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
    closeBundle() {
      /**
       * Get all files in a directory
       * @param dirPath - Directory path
       * @param arrayOfFiles - Array of files
       * @returns Array of files
       */
      const getAllFiles = function (
        dirPath: fs.PathLike,
        arrayOfFiles?: string[],
      ): string[] {
        const files = fs.readdirSync(dirPath);

        let _arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            _arrayOfFiles = getAllFiles(dirPath + "/" + file, _arrayOfFiles);
          } else {
            // eslint-disable-next-line no-undef
            _arrayOfFiles.push(path.join(__dirname, dirPath.toString(), file));
          }
        });
        if (arrayOfFiles) {
          arrayOfFiles = _arrayOfFiles;
        }

        return _arrayOfFiles;
      };

      /**
       * Get the total size of all files in a directory
       * @param directoryPath - Directory path
       * @returns Total size of all files in the directory
       */
      const getTotalSize = function (directoryPath: fs.PathLike): number {
        const arrayOfFiles = getAllFiles(directoryPath);

        let totalSize = 0;

        arrayOfFiles.forEach(function (filePath) {
          totalSize += fs.statSync(filePath).size;
        });

        return totalSize;
      };

      // Compute the size of the dist folder
      const distSize = getTotalSize("dist");

      /**
       * Format the file size in bytes to a human-readable compliant with the JSON-LD
       * @param bytes - File size in bytes
       * @returns Human-readable file size
       *
       * @see {@link https://schema.org/fileSize}
       * @example
       * formatFileSize(1024) // 1KB
       */
      const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + "B";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + "KB";
        else return (bytes / 1048576).toFixed(3) + "MB";
      };

      const readableDistSize = formatFileSize(distSize);
      // Change the "fileSize": "xxxx" in the JSON-LD to the actual dist folder size
      // eslint-disable-next-line no-undef
      const jsonLdPath = path.join(__dirname, "dist", "index.html");
      let jsonLd = fs.readFileSync(jsonLdPath, "utf8");

      jsonLd = jsonLd.replace(
        /"fileSize":\s*"[^"]*"/,
        `"fileSize": "${readableDistSize.toString()}"`,
      );
      fs.writeFileSync(jsonLdPath, jsonLd);
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
  plugins: [react(), tsconfigPaths(), tailwindcss(), jsonLdSetPlugin()],
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
          i18next: ["i18next", "react-i18next"],
          sctg: extractPerVendorDependencies(packageJson, "@sctg"),
          heroui: extractHerouiDependencies(packageJson),
          tailwindcss: ["tailwind-variants", "tailwindcss"],
          utilities: ["framer-motion"],
        },
      },
    },
  },
});
