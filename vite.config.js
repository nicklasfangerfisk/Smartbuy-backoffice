import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@emotion/react': require.resolve('@emotion/react'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    hmr: {
      host: 'refactored-space-robot-97qrgx65675r2p46-3000.app.github.dev',
      port: 443,
      protocol: 'wss',
    },
  },
});
