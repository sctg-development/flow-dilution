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
        // Personnaliser le nommage des chunks
        entryFileNames: "js/flow-dilution-[hash].js",
        chunkFileNames: "js/flow-dilution-[hash].js",
        assetFileNames: "assets/flow-dilution-[hash].[ext]",
        // Stratégie de regroupement des chunks
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
            "@react-aria/visually-hidden",
          ],
          sctg: ["@sctg/aga8-js", "@sctg/scientific-notation"],
          heroui: [
            "@heroui/button",
            "@heroui/card",
            "@heroui/dropdown",
            "@heroui/input",
            "@heroui/link",
            "@heroui/navbar",
            "@heroui/select",
            "@heroui/skeleton",
            "@heroui/slider",
            "@heroui/switch",
            "@heroui/system",
            "@heroui/table",
            "@heroui/tabs",
            "@heroui/theme",
            "@heroui/use-clipboard",
          ],
          tailwindcss: ["tailwind-variants", "tailwindcss"],
          utilities: ["framer-motion"],
        },
      },
    },
  },
});
