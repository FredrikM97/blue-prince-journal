import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { cloudflare } from "@cloudflare/vite-plugin";

const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [tailwindcss(), tanstackStart({
    importProtection: {
      behavior: "error",
      client: {
        files: ["**/server/**"],
        specifiers: ["server-only"],
      },
    },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index",
      },
    },
    // Keep the server runtime entry for prerendering the SPA shell at build time.
    server: { entry: "server" },
  }), react(), cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
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