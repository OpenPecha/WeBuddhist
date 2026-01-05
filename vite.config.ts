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
        "/chats": {
          target: "https://at-chat-20299882697-4758f1e.onrender.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
        },
        "/threads": {
          target: "https://at-chat-20299882697-4758f1e.onrender.com",
          changeOrigin: true,
          secure: true,
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
          "dist/**",
          "src/layouts",
          "src/components/**",
        ],
      },
    },
  };
});
