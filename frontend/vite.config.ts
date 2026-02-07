import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    {
      name: 'ignore-well-known',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/.well-known/')) {
            res.statusCode = 404;
            res.end();
            return;
          }
          next();
        });
      },
    },
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
