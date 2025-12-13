import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/engine-rest": {
        target: "https://digibp.engine.martinlab.science",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
