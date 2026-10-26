import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import app from './server/app';

function expressPlugin(): Plugin {
  return {
    name: 'express-backend-plugin',
    configureServer(server) {
      server.middlewares.use(app);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), expressPlugin()],
  server: {
    port: 5173,
    open: false,
  },
});

