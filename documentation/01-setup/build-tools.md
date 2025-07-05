# Build Tools and Configuration

This guide covers the build tools, configuration, and migration from Webpack to Vite.

## Vite Configuration

SmartBack uses Vite as its build tool for modern, fast development and build processes.

### Why Vite?

Vite offers several advantages over traditional bundlers:

- **Fast Development**: Instant server start and lightning-fast HMR
- **Modern ES Modules**: Native ESM support in development
- **Optimized Builds**: Rollup-based production builds
- **Plugin Ecosystem**: Rich plugin ecosystem
- **TypeScript Support**: Built-in TypeScript support

### Configuration

The `vite.config.js` file contains the main Vite configuration:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Key Configuration Options

#### Development Server
```javascript
server: {
  port: 3000,           // Development server port
  host: true,           // Allow external connections
  open: true,           // Open browser on start
  hmr: {                // Hot Module Replacement
    port: 3001,
  },
}
```

#### Build Configuration
```javascript
build: {
  outDir: 'dist',       // Output directory
  sourcemap: true,      // Generate source maps
  minify: 'terser',     // Minification tool
  target: 'esnext',     // Target environment
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        mui: ['@mui/joy'],
      },
    },
  },
}
```

#### Path Resolution
```javascript
resolve: {
  alias: {
    '@': '/src',        // Path alias for imports
    '~': '/src',        // Alternative alias
  },
}
```

## TypeScript Configuration

The `tsconfig.json` file configures TypeScript compilation:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Key TypeScript Features

- **Strict Mode**: Enabled for better type safety
- **Path Mapping**: Supports alias imports
- **JSX**: React JSX transform
- **Module Resolution**: Bundler-style resolution

## Build Scripts

The `package.json` includes various build scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Script Descriptions

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build
- `type-check`: Check TypeScript types
- `lint`: Run ESLint

## Migration from Webpack

### Migration Steps

1. **Install Vite**
```bash
npm install vite @vitejs/plugin-react --save-dev
```

2. **Update Project Structure**
- Move `public/index.html` to root directory
- Update HTML file to use ES modules
- Remove webpack-specific configurations

3. **Create Vite Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ... other configurations
});
```

4. **Update Package Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

5. **Update HTML Template**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartBack</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### Common Migration Issues

**1. Import Paths**
```typescript
// Before (Webpack)
import logo from './assets/logo.png';

// After (Vite)
import logo from '@/assets/logo.png';
```

**2. Environment Variables**
```typescript
// Before (Webpack)
process.env.REACT_APP_API_URL

// After (Vite)
import.meta.env.VITE_API_URL
```

**3. Dynamic Imports**
```typescript
// Before (Webpack)
import(/* webpackChunkName: "chunk-name" */ './component')

// After (Vite)
import('./component') // Vite handles chunking automatically
```

## Build Optimization

### Code Splitting

Vite automatically handles code splitting:

```javascript
// Dynamic imports create separate chunks
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Analyze bundle
npx vite-bundle-analyzer dist
```

### Optimization Techniques

1. **Tree Shaking**: Automatic dead code elimination
2. **Minification**: Terser for JavaScript, cssnano for CSS
3. **Compression**: Gzip and Brotli compression
4. **Asset Optimization**: Automatic asset optimization

## Plugin Ecosystem

### Essential Plugins

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Add other plugins as needed
  ],
});
```

### Popular Plugins

- `@vitejs/plugin-react`: React support
- `vite-plugin-pwa`: Progressive Web App features
- `vite-plugin-windicss`: WindiCSS integration
- `vite-plugin-eslint`: ESLint integration

## Development Tools

### Hot Module Replacement (HMR)

Vite provides fast HMR out of the box:

```typescript
// Accept HMR updates
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

### Development Server

```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3001

# Start with host exposure
npm run dev -- --host
```

## Production Builds

### Build Process

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (other assets)
└── ... (other files)
```

### Build Options

```javascript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: true,
  minify: 'terser',
  target: 'esnext',
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'mui': ['@mui/joy'],
        'supabase': ['@supabase/supabase-js'],
      },
    },
  },
}
```

## Performance Monitoring

### Build Analysis

```bash
# Time build process
npm run build -- --profile

# Analyze bundle size
npm run build -- --reporter=verbose
```

### Lighthouse Integration

Vite builds are optimized for Lighthouse scores:

- Automatic code splitting
- Optimized asset loading
- Modern JavaScript output
- Efficient caching strategies

## Troubleshooting

### Common Issues

**1. Module Resolution**
```javascript
// Add to vite.config.js
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
  },
}
```

**2. Environment Variables**
```bash
# .env.local
VITE_API_URL=https://api.example.com
```

**3. Build Errors**
```bash
# Clear cache
rm -rf node_modules/.vite
npm run build
```

### Performance Issues

**1. Slow Development Server**
- Check for large dependencies
- Use dynamic imports
- Optimize images

**2. Large Bundle Size**
- Analyze bundle composition
- Remove unused dependencies
- Implement code splitting

By following this build tools guide, you'll have a well-configured, optimized build process for the SmartBack application.
