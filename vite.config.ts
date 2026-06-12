import tailwindcss from "@tailwindcss/vite";
import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const base = process.env.BASE_PATH ?? "/";
const appCommitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  base,
  define: {
    __APP_COMMIT_HASH__: JSON.stringify(appCommitHash),
  },
  plugins: [tailwindcss(), react()],
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
    tsconfigPaths: true,
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
    cssCodeSplit: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {},
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
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
