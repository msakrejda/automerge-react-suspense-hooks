import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";

import path from "node:path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import wasm from "vite-plugin-wasm";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [
    topLevelAwait(),
    wasm(),
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/hooks/index.ts"),
      name: packageJson.name,
      formats: ["es"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    setupFiles: path.resolve(__dirname, "src/setup.tests.ts"),
  },
});
