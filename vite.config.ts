import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./env");
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
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
          target: env.VITE_CHAT_API_URL,
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
      setupFiles: "./src/test-utils/CommonMocks.ts",
      coverage: {
        provider: "istanbul",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage",
        exclude: [
          "**/*.ts",
          "**/*test.tsx",
          "src/config/**",
          "src/main.tsx",
          "src/App.tsx",
          "src/context/**",
          "src/utils/**",
          "src/routes/chat/**",
          "dist/**",
          "src/layouts",
          "src/components/**",
        ],
      },
    },
  };
});
