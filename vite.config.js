import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api/upload": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/upload/, ""),
      },

      "/api/inference": {
        target: "http://localhost:8085",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/inference/, ""),
      },

      "/api/status": {
        target: "http://localhost:8086",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/status/, ""),
      },
    },
  },
});