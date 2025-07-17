import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

// Read version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [react({
    fastRefresh: false // Keep React refresh disabled to prevent errors
  })],
  publicDir: 'public',
  define: {
    // Inject version information
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_NAME__: JSON.stringify(packageJson.name),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@emotion/react': require.resolve('@emotion/react'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: false, // Keep HMR disabled to prevent refresh issues
  },
});
