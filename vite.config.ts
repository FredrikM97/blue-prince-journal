import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
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
