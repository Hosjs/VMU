import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ['@mui/x-data-grid', '@mui/material', '@mui/system'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "white-louisville-startup-tuition.trycloudflare.com"
    ]
  }
});
