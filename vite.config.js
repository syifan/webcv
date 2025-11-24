import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/library.js"),
      name: "EasyCv",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "es" ? "index.mjs" : format === "cjs" ? "index.cjs" : "index.js",
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
