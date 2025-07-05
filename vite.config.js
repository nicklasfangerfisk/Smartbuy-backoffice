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
    ],
    include: [
      'prop-types',
      'react-is',
      // Pre-bundle specific material icons only
      '@mui/icons-material/HomeRounded',
      '@mui/icons-material/DashboardRounded',
      '@mui/icons-material/ShoppingCartRounded',
      '@mui/icons-material/GroupRounded',
      '@mui/icons-material/SettingsRounded',
      '@mui/icons-material/Add',
      '@mui/icons-material/Search',
      '@mui/icons-material/FilterList'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'mui-core': ['@mui/joy', '@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material'],
          'supabase': ['@supabase/supabase-js'],
          'router': ['react-router-dom'],
          'utils': ['date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3000',
    },
    hmr: true, // Re-enable HMR for better dev experience
  },
});
