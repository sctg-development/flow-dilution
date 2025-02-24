import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@sctg/aga8-js"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react")) {
            return "react";
          }
          if (id.includes("heroui")) {
            return "heroui";
          }
          if (id.includes("sctg")) {
            return "sctg";
          }
          if (id.includes("tailwind")) {
            return "tailwind";
          }

          return null;
        },
      },
    },
  },
});
