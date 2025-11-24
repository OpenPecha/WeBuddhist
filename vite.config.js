import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./env");
  return {
    plugins: [react(), tailwindcss()],
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
        "/chat": {
          target: "https://buddhist-consensus.onrender.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/chat/, ""),
        },
        "/webuddhist": {
          target: "https://pecha-tool-sync-editor-1.onrender.com/webuddhist",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/webuddhist/, ""),
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
          "src/components/commons/expandtext/**",
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
