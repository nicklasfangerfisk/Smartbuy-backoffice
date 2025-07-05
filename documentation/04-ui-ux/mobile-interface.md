# Mobile Interface Design

## Overview

SmartBack's mobile interface is designed with a mobile-first approach, prioritizing touch interactions, edge-to-edge layouts, and optimized user flows. The mobile interface maintains full functionality while adapting to smaller screens and touch-based interactions.

## Core Mobile Design Principles

### 1. Touch-First Design
- **Minimum Touch Targets**: 44px minimum for all interactive elements
- **Comfortable Spacing**: Adequate spacing between interactive elements
- **Gesture Support**: Intuitive swipe and tap gestures
- **Thumb-Friendly**: Important actions within thumb reach

### 2. Edge-to-Edge Layout
- **Full Width**: Content spans full device width
- **Minimal Margins**: Efficient use of screen real estate
- **Visual Hierarchy**: Clear content organization
- **Safe Areas**: Respect device safe areas and notches

### 3. Content Priority
- **Essential First**: Most important content visible without scrolling
- **Progressive Disclosure**: Secondary content revealed on demand
- **Scannable Design**: Easy-to-scan information hierarchy
- **Action-Oriented**: Clear primary actions

## Mobile Layout Architecture

### 1. Three-Layer Architecture

```
App Shell (Fixed Elements)
├── Header (60px) - Navigation and branding
├── Content Area (Dynamic) - Main page content
└── Bottom Navigation (70px) - Primary navigation
```

### 2. Mobile Page Layout Component

```typescript
// /src/components/MobilePageLayout.tsx
interface MobilePageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
}

export const MobilePageLayout: React.FC<MobilePageLayoutProps> = ({
  children,
  title,
  actions,
  showBackButton = false
}) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{
      paddingTop: '60px', // Header height
      paddingBottom: '70px', // Bottom navigation height
      minHeight: '100vh',
      overflow: 'auto',
      bgcolor: 'background.body'
    }}>
      {/* Mobile Header */}
      {title && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          bgcolor: 'background.surface',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          zIndex: 1000
        }}>
          {showBackButton && (
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography level="title-md" sx={{ flex: 1 }}>
            {title}
          </Typography>
          {actions}
        </Box>
      )}
      
      {/* Page Content */}
      <Box sx={{ px: 2, py: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
```

## Mobile Navigation System

### 1. Bottom Navigation Bar

```typescript
// /src/navigation/MobileMenu.tsx
const MobileMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    { id: 'dashboard', path: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { id: 'orders', path: '/orders', icon: <OrderIcon />, label: 'Orders' },
    { id: 'products', path: '/products', icon: <ProductIcon />, label: 'Products' },
    { id: 'inventory', path: '/inventory', icon: <InventoryIcon />, label: 'Inventory' },
    { id: 'more', path: '/more', icon: <MoreIcon />, label: 'More' }
  ];
  
  return (
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
      zIndex: 1000,
      px: 1
    }}>
      {navigationItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        
        return (
          <IconButton
            key={item.id}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              p: 1,
              minWidth: 60,
              minHeight: 60,
              color: isActive ? 'primary.500' : 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            {item.icon}
            <Typography level="body-xs">
              {item.label}
            </Typography>
          </IconButton>
        );
      })}
    </Box>
  );
};
```

### 2. Mobile Header Component

```typescript
// /src/components/MobileHeader.tsx
interface MobileHeaderProps {
  title: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  actions,
  showBackButton = false,
  onBackClick
}) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      bgcolor: 'background.surface',
      borderBottom: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      px: 2,
      zIndex: 1000
    }}>
      {showBackButton && (
        <IconButton
          onClick={handleBackClick}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      
      <Typography 
        level="title-md" 
        sx={{ 
          flex: 1,
          textAlign: showBackButton ? 'left' : 'center',
          fontWeight: 'bold'
        }}
      >
        {title}
      </Typography>
      
      {actions && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};
```

## Mobile Component Patterns

### 1. Card-Based Data Display

```typescript
// Mobile-optimized card component
const MobileDataCard: React.FC<{ item: DataItem }> = ({ item }) => (
  <Card
    variant="outlined"
    sx={{
      mb: 1,
      '&:hover': {
        boxShadow: 'md'
      }
    }}
  >
    <CardContent sx={{ p: 2 }}>
      {/* Primary Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
          {item.title}
        </Typography>
        <Chip
          variant="soft"
          color={getStatusColor(item.status)}
          size="sm"
        >
          {item.status}
        </Chip>
      </Box>
      
      {/* Secondary Info */}
      <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
        {item.description}
      </Typography>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="sm" variant="plain">
          <EditIcon />
        </IconButton>
        <IconButton size="sm" variant="plain">
          <DeleteIcon />
        </IconButton>
      </Box>
    </CardContent>
  </Card>
);
```

### 2. Mobile Form Components

```typescript
// Mobile-optimized form
const MobileForm: React.FC<{ onSubmit: (data: FormData) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({});
  
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 2
      }}
    >
      <FormControl>
        <FormLabel>Field Label</FormLabel>
        <Input
          size="lg"
          sx={{
            fontSize: '16px', // Prevents zoom on iOS
            minHeight: 44
          }}
          value={formData.field}
          onChange={(e) => setFormData({ ...formData, field: e.target.value })}
        />
      </FormControl>
      
      <FormControl>
        <FormLabel>Select Field</FormLabel>
        <Select
          size="lg"
          sx={{
            fontSize: '16px',
            minHeight: 44
          }}
          value={formData.select}
          onChange={(e, value) => setFormData({ ...formData, select: value })}
        >
          <Option value="option1">Option 1</Option>
          <Option value="option2">Option 2</Option>
        </Select>
      </FormControl>
      
      <Button
        type="submit"
        size="lg"
        sx={{
          height: 48,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Submit
      </Button>
    </Box>
  );
};
```

### 3. Mobile Modal/Dialog

```typescript
// Full-screen mobile modal
const MobileModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          borderRadius: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <CloseIcon />
          </IconButton>
          <Typography level="title-md" sx={{ flex: 1 }}>
            {title}
          </Typography>
        </Box>
        
        {/* Modal Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {children}
        </Box>
      </ModalDialog>
    </Modal>
  );
};
```

## Mobile-Specific Features

### 1. Floating Action Button (FAB)

```typescript
// Mobile FAB component
const MobileFAB: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
}> = ({ onClick, icon, label }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'fixed',
      bottom: 90, // Above bottom navigation
      right: 16,
      width: 56,
      height: 56,
      bgcolor: 'primary.500',
      color: 'primary.contrastText',
      borderRadius: '50%',
      boxShadow: 'lg',
      zIndex: 1000,
      '&:hover': {
        bgcolor: 'primary.600',
        transform: 'scale(1.05)'
      }
    }}
    aria-label={label}
  >
    {icon}
  </IconButton>
);
```

### 2. Pull-to-Refresh

```typescript
// Pull-to-refresh implementation
const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Implementation details
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Implementation details
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance > 100) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };
  
  return {
    isRefreshing,
    pullDistance,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};
```

### 3. Swipe Gestures

```typescript
// Swipe gesture implementation
const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    // Check if horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};
```

## Performance Optimizations

### 1. Lazy Loading for Mobile

```typescript
// Lazy load mobile components
const MobileView = lazy(() => import('./MobileView'));

const ResponsiveComponent = () => {
  const { isMobile } = useResponsive();
  
  return (
    <Suspense fallback={<MobileLoader />}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Suspense>
  );
};
```

### 2. Virtual Scrolling

```typescript
// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const MobileVirtualList: React.FC<{ items: any[] }> = ({ items }) => (
  <List
    height={window.innerHeight - 140} // Account for header and navigation
    itemCount={items.length}
    itemSize={80}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <MobileListItem item={data[index]} />
      </div>
    )}
  </List>
);
```

### 3. Image Optimization

```typescript
// Responsive image component
const MobileImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}> = ({ src, alt, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <Box sx={{ position: 'relative', width, height }}>
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          animation="wave"
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isLoaded ? 'block' : 'none'
        }}
      />
    </Box>
  );
};
```

## Accessibility on Mobile

### 1. Touch Target Sizes

```typescript
// Accessible touch targets
const accessibleTouchTarget = {
  minHeight: 44,
  minWidth: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
```

### 2. Screen Reader Support

```typescript
// Screen reader announcements
const useMobileAnnouncements = () => {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };
  
  return { announce };
};
```

### 3. Focus Management

```typescript
// Mobile focus management
const useMobileFocus = () => {
  const focusFirstElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  };
  
  return { focusFirstElement };
};
```

## Testing Mobile Interface

### 1. Responsive Testing

```typescript
// Mobile-specific test utilities
const mobileTestUtils = {
  simulateTouch: (element: HTMLElement, eventType: string) => {
    const touchEvent = new TouchEvent(eventType, {
      touches: [new Touch({
        identifier: 0,
        target: element,
        clientX: 100,
        clientY: 100
      })]
    });
    element.dispatchEvent(touchEvent);
  },
  
  setMobileViewport: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
  }
};
```

### 2. Touch Testing

```typescript
// Touch interaction tests
describe('Mobile Touch Interactions', () => {
  beforeEach(() => {
    mobileTestUtils.setMobileViewport();
  });
  
  test('should handle swipe gestures', () => {
    const onSwipeLeft = jest.fn();
    const { getByTestId } = render(
      <SwipeableComponent onSwipeLeft={onSwipeLeft} />
    );
    
    const element = getByTestId('swipeable');
    mobileTestUtils.simulateTouch(element, 'touchstart');
    mobileTestUtils.simulateTouch(element, 'touchend');
    
    expect(onSwipeLeft).toHaveBeenCalled();
  });
});
```

## Best Practices

### 1. Performance
- Use lazy loading for mobile components
- Implement virtual scrolling for large lists
- Optimize images for mobile screens
- Minimize bundle size for mobile

### 2. User Experience
- Provide clear visual feedback for interactions
- Use loading states for network requests
- Implement offline capabilities where possible
- Ensure content is readable without zooming

### 3. Technical Implementation
- Use semantic HTML for accessibility
- Implement proper focus management
- Test on real devices when possible
- Consider different screen sizes and orientations

The mobile interface design system ensures that SmartBack provides an excellent user experience on mobile devices while maintaining full functionality and accessibility standards.
