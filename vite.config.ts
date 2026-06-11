import tailwindcss from "@tailwindcss/vite";
import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const base = process.env.BASE_PATH ?? "/";
const appCommitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  base,
  define: {
    __APP_COMMIT_HASH__: JSON.stringify(appCommitHash),
  },
  plugins: [tsconfigPaths(), tailwindcss(), react()],
  optimizeDeps: {
    include: [
      "@tanstack/react-query",
      "@tanstack/react-router",
      "dexie",
      "dexie-react-hooks",
      "lucide-react",
      "sonner",
    ],
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/@tanstack/react-router/") ||
            id.includes("node_modules/@tanstack/react-query/")
          ) {
            return "vendor";
          }
          if (
            id.includes("node_modules/react-markdown/") ||
            id.includes("node_modules/remark-gfm/")
          ) {
            return "markdown";
          }
          if (id.includes("node_modules/jszip/")) {
            return "zip";
          }
          return undefined;
        },
      },
    },
  },
  server: { host: "::", port: 8080 },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.tsx",
    globals: true,
    include: ["tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["**/*.css"],
    },
  },
});
