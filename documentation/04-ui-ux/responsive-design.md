# Responsive Design System

## Overview

SmartBack implements a comprehensive responsive design system that ensures consistent user experiences across desktop, tablet, and mobile devices. The system emphasizes mobile-first design principles while maintaining desktop functionality.

## Design Principles

### 1. Mobile-First Approach
- **Primary Design**: Mobile interfaces designed first
- **Progressive Enhancement**: Desktop features built upon mobile foundation
- **Touch-Friendly**: All interactions optimized for touch input
- **Content Priority**: Most important content accessible on smallest screens

### 2. Consistent Breakpoints
- **Mobile**: 0px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Large Desktop**: 1200px+

### 3. Responsive Patterns
- **Adaptive Layout**: Different layouts for different screen sizes
- **Flexible Components**: Components that adapt to container size
- **Conditional Rendering**: Device-specific component variants
- **Unified Functionality**: Same features across all devices

## Responsive Hook System

### 1. useResponsive Hook

```typescript
// /src/hooks/useResponsive.ts
import { useMediaQuery } from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy/styles';

export function useResponsive() {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    // Standardized breakpoints
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
    // Utility functions
    getSpacing: (mobile: number, desktop: number) => isMobile ? mobile : desktop,
    getModalSize: (size: 'small' | 'medium' | 'large') => ({
      width: isMobile ? '95vw' : size === 'small' ? 400 : size === 'medium' ? 600 : 800,
      maxWidth: isMobile ? '95vw' : '90vw',
      maxHeight: isMobile ? '90vh' : '80vh'
    })
  };
}
```

### 2. Usage in Components

```typescript
// Example component using responsive hook
const PageExample = () => {
  const { isMobile, getSpacing } = useResponsive();
  
  return (
    <Box sx={{ 
      padding: getSpacing(1, 3),
      height: '100%'
    }}>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </Box>
  );
};
```

## Layout System

### 1. Responsive Container Component

```typescript
// /src/components/ResponsiveContainer.tsx
interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'page' | 'dialog' | 'form' | 'card';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  variant = 'page',
  padding = 'medium',
  fullHeight = false
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();
  
  const getPadding = () => {
    if (padding === 'none') return 0;
    
    const paddingMap = {
      small: isMobile ? 1 : 2,
      medium: isMobile ? 2 : 3,
      large: isMobile ? 3 : 4
    };
    
    return paddingMap[padding];
  };
  
  return (
    <Box sx={{
      p: getPadding(),
      height: fullHeight ? '100%' : 'auto',
      overflow: variant === 'page' ? 'auto' : 'visible',
      bgcolor: variant === 'page' ? 'background.body' : 'transparent'
    }}>
      {children}
    </Box>
  );
}
```

### 2. Responsive Modal Component

```typescript
// /src/components/ResponsiveModal.tsx
interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  actions?: React.ReactNode;
}

export function ResponsiveModal({
  open,
  onClose,
  children,
  title,
  size = 'medium',
  actions
}: ResponsiveModalProps) {
  const { isMobile, getModalSize } = useResponsive();
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={getModalSize(size)}>
        {title && (
          <DialogTitle>
            {title}
            {!isMobile && <ModalClose />}
          </DialogTitle>
        )}
        
        <DialogContent>
          {children}
        </DialogContent>
        
        {actions && (
          <DialogActions>
            {actions}
          </DialogActions>
        )}
      </ModalDialog>
    </Modal>
  );
}
```

## Page Layout Standards

### 1. Unified Page Component Pattern

```typescript
// Example: Unified responsive page component
export default function PageExample() {
  const { isMobile } = useResponsive();
  const [data, setData] = useState([]);
  
  // Shared data fetching
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return (
    <ResponsiveContainer variant="page" fullHeight>
      <Typography level="h2" sx={{ mb: 2 }}>
        Page Title
      </Typography>
      
      {isMobile ? (
        <MobileView data={data} />
      ) : (
        <DesktopView data={data} />
      )}
    </ResponsiveContainer>
  );
}
```

### 2. Content Area Styling

#### Desktop Standards
```typescript
const desktopStyles = {
  width: '100%',
  minHeight: '100dvh',
  bgcolor: 'background.body',
  borderRadius: 0,
  boxShadow: 'none',
  p: 3, // 24px padding
};
```

#### Mobile Standards
```typescript
const mobileStyles = {
  width: '100%',
  minHeight: '100vh',
  bgcolor: 'background.body',
  p: 1, // 8px padding
  pb: 10, // Extra bottom padding for mobile menu
};
```

### 3. Page Title Styling

```typescript
const PageTitle = ({ children }) => (
  <Typography 
    level="h2" 
    sx={{ 
      mb: 2, 
      fontSize: 'xlarge',
      fontWeight: 'bold'
    }}
  >
    {children}
  </Typography>
);
```

## Component Patterns

### 1. Data Display Patterns

#### Mobile: Card-Based Layout
```typescript
const MobileDataView = ({ data }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {data.map((item) => (
      <Card key={item.id} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography level="title-sm">{item.title}</Typography>
          <Chip variant="soft" size="sm">{item.status}</Chip>
        </Box>
        <Typography level="body-sm" sx={{ mt: 1 }}>
          {item.description}
        </Typography>
      </Card>
    ))}
  </Box>
);
```

#### Desktop: Table Layout
```typescript
const DesktopDataView = ({ data }) => (
  <Table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          <td>{item.title}</td>
          <td><Chip variant="soft" size="sm">{item.status}</Chip></td>
          <td>{item.description}</td>
          <td>
            <IconButton size="sm">
              <EditIcon />
            </IconButton>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
```

### 2. Navigation Patterns

#### Mobile: Bottom Navigation
```typescript
const MobileNavigation = () => (
  <Box sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    bgcolor: 'background.surface',
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000
  }}>
    {navigationItems.map((item) => (
      <IconButton key={item.id} onClick={() => navigate(item.path)}>
        {item.icon}
      </IconButton>
    ))}
  </Box>
);
```

#### Desktop: Sidebar Navigation
```typescript
const DesktopNavigation = () => (
  <Box sx={{
    width: 250,
    height: '100vh',
    bgcolor: 'background.surface',
    borderRight: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    flexDirection: 'column',
    p: 2
  }}>
    {navigationItems.map((item) => (
      <Button
        key={item.id}
        variant={isActive(item.path) ? 'solid' : 'plain'}
        onClick={() => navigate(item.path)}
        sx={{ mb: 1 }}
      >
        {item.icon}
        {item.label}
      </Button>
    ))}
  </Box>
);
```

### 3. Form Patterns

#### Responsive Forms
```typescript
const ResponsiveForm = ({ onSubmit }) => {
  const { isMobile } = useResponsive();
  
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 2 : 3,
        maxWidth: isMobile ? '100%' : 600,
        mx: 'auto'
      }}
    >
      <FormControl>
        <FormLabel>Field Label</FormLabel>
        <Input 
          size={isMobile ? 'lg' : 'md'} 
          sx={{ 
            fontSize: isMobile ? '16px' : '14px' // Prevent zoom on iOS
          }}
        />
      </FormControl>
      
      <Button
        type="submit"
        size={isMobile ? 'lg' : 'md'}
        sx={{ 
          height: isMobile ? 48 : 40,
          fontSize: isMobile ? '16px' : '14px'
        }}
      >
        Submit
      </Button>
    </Box>
  );
};
```

## Layout Isolation

### 1. Page Content Isolation

```typescript
// Prevents layout bleed-through between pages
const PageWrapper = ({ children }) => (
  <Box sx={{
    width: '100%',
    minHeight: '100dvh',
    bgcolor: 'background.body',
    borderRadius: 0,
    boxShadow: 'none',
    position: 'relative',
    zIndex: 1
  }}>
    {children}
  </Box>
);
```

### 2. Mobile Menu Considerations

```typescript
// Ensures content doesn't scroll under mobile menu
const MobilePageLayout = ({ children }) => (
  <Box sx={{
    paddingTop: '60px', // Header height
    paddingBottom: '70px', // Bottom navigation height
    minHeight: '100vh',
    overflow: 'auto'
  }}>
    {children}
  </Box>
);
```

## Performance Optimization

### 1. Conditional Rendering
```typescript
// Only render components when needed
const ResponsiveComponent = () => {
  const { isMobile } = useResponsive();
  
  return (
    <>
      {isMobile && <MobileComponent />}
      {!isMobile && <DesktopComponent />}
    </>
  );
};
```

### 2. Lazy Loading
```typescript
// Lazy load mobile-specific components
const MobileView = lazy(() => import('./MobileView'));
const DesktopView = lazy(() => import('./DesktopView'));

const ResponsiveView = () => {
  const { isMobile } = useResponsive();
  
  return (
    <Suspense fallback={<Loading />}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Suspense>
  );
};
```

## Accessibility Considerations

### 1. Touch Targets
```typescript
const touchFriendlyStyles = {
  minHeight: 44, // Minimum 44px for touch targets
  minWidth: 44,
  padding: 2,
  fontSize: '16px' // Prevents zoom on iOS
};
```

### 2. Focus Management
```typescript
const AccessibleButton = ({ children, ...props }) => (
  <Button
    {...props}
    sx={{
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.500',
        outlineOffset: 2
      }
    }}
  >
    {children}
  </Button>
);
```

## Migration Strategy

### 1. From Separate Components to Unified
```typescript
// Before: Separate components
PageOrderDesktop.tsx
PageOrderMobile.tsx

// After: Unified component
PageOrders.tsx (with responsive logic)

// Completed migrations:
✅ PageMovements.tsx (unified from PageMovementsDesktop.tsx + PageMovementsMobile.tsx)
✅ PageOrders.tsx (unified from PageOrderDesktop.tsx + PageOrderMobile.tsx)
```

### 2. Implementation Steps
1. **Identify**: Components with separate mobile/desktop versions
2. **Analyze**: Shared functionality and data requirements
3. **Create**: Unified component with responsive rendering
4. **Test**: Behavior across all screen sizes
5. **Update**: Route configurations
6. **Remove**: Legacy separate components

### 3. Testing Checklist
- [ ] Mobile portrait (320px - 767px)
- [ ] Mobile landscape (568px - 1023px)
- [ ] Tablet portrait (768px - 1023px)
- [ ] Tablet landscape (1024px - 1199px)
- [ ] Desktop (1200px+)
- [ ] Touch interactions work properly
- [ ] Keyboard navigation functions
- [ ] Screen reader compatibility

## Future Enhancements

### 1. Advanced Responsive Features
- **Container Queries**: CSS Container Queries for component-based breakpoints
- **Viewport Units**: Better viewport unit support (dvh, lvh, svh)
- **Responsive Typography**: Fluid typography scaling
- **Orientation Handling**: Landscape/portrait specific layouts

### 2. Performance Improvements
- **Preloading**: Preload components based on screen size
- **Code Splitting**: Split mobile/desktop bundles
- **Resource Optimization**: Screen size-specific asset loading
- **Caching**: Responsive state caching

### 3. Enhanced User Experience
- **Gesture Support**: Swipe navigation on mobile
- **Haptic Feedback**: Touch feedback on mobile devices
- **Orientation Lock**: Lock orientation for specific views
- **Progressive Enhancement**: Enhanced features for capable devices

The responsive design system in SmartBack provides a consistent, performant, and accessible user experience across all devices while maintaining a single codebase with unified functionality.
