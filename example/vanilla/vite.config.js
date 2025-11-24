import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..", "..");

export default defineConfig({
  publicDir: path.resolve(workspaceRoot, "public"),
  server: {
    host: true,
    port: 4173,
    strictPort: false,
    fs: {
      allow: [workspaceRoot],
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
});
