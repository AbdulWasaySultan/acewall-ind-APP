import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target:
          "https://acewall-backend-school-instance-production.up.railway.app/api",
        changeOrigin: true,
        secure: false, // allows self-signed certs, if any
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
