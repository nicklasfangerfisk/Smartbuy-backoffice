import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@emotion/react': require.resolve('@emotion/react'),
    },
  },
  optimizeDeps: {
    exclude: [
      // Leave out Joy UI style overrides if needed, but include icons and core packages
      '@mui/joy',
      '@mui/joy/styles',
      '@mui/joy/CssBaseline',
      '@mui/joy/Box',
      '@mui/joy/List',
      '@mui/joy/ListItem',
      '@mui/joy/ListItemButton',
      '@mui/joy/Textarea',
      '@mui/joy/Button',
      '@mui/joy/Stack',
      '@mui/joy/Avatar',
      '@mui/joy/Chip',
      '@mui/joy/ListDivider',
      '@mui/joy/Typography',
      // '@mui/icons-material' // Removed to ensure icon components are pre-bundled
    ],
    include: [
      'prop-types',
      'react-is',
      // Pre-bundle all material icon modules
      /^@mui\/icons-material\/.*$/
    ]
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3000',
    },
    hmr: false,
  },
});
