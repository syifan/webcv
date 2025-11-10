import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [
    react({
      include: /\.(j|t)sx?$/,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/library.js"),
      name: "WebCv",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "es" ? "index.mjs" : format === "cjs" ? "index.cjs" : "index.js",
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
    sourcemap: true,
    emptyOutDir: true,
  },
});
