import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./env");
  return {
    plugins: [react()],
    envDir: "./env",
    server: {
      host: true,
      open: true,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_BASE_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test-utils/CommonMocks.js",
      coverage: {
        provider: "istanbul",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage",
        exclude: [
          "**/*.js",
          "**/*test.jsx",
          "src/config/**",
          "src/main.jsx",
          "src/App.jsx",
          "src/context/**",
          "src/utils/**",
        ],
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  };
});
