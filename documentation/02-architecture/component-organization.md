# Component Organization and Structure

This document outlines the organization, naming conventions, and best practices for components in the SmartBack application.

## Component Organization

### Directory Structure

The `src` directory is organized by functionality and component type:

```
src/
├── Page/                      # Page components (main views)
├── Dialog/                    # Modal and dialog components
├── auth/                      # Authentication components
├── navigation/                # Navigation and layout components
├── utils/                     # Utility functions
├── hooks/                     # Custom React hooks
├── general/                   # Type definitions and shared utilities
├── api/                       # API functions
├── components/                # Additional shared components
├── layouts/                   # Layout components
├── widgets/                   # Widget components
└── table/                     # Table components
```

### Component Categories

#### 1. Page Components (`/src/Page/`)
- **Purpose**: Main page components that represent entire views
- **Examples**:
  - `PageDashboard.tsx` - Dashboard overview
  - `PageOrderDesktop.tsx` - Desktop order management
  - `PageOrderMobile.tsx` - Mobile order management
  - `PageProductDesktop.tsx` - Desktop product catalog
  - `PageUsersDesktop.tsx` - Desktop user management
  - `PageSuppliers.tsx` - Supplier management
  - `PageInventoryDesktop.tsx` - Inventory overview

#### 2. Dialog Components (`/src/Dialog/`)
- **Purpose**: Modal dialogs, popups, and form overlays
- **Examples**:
  - `UserDialog.tsx` - User profile editing
  - `DialogProducts.tsx` - Product creation/editing with view/edit modes
  - `SupplierForm.tsx` - Supplier management modal
  - `OrderTableCreate.tsx` - Order creation dialog
  - `ActionDialogTicketCreate.tsx` - Ticket creation form
  - `DialogInventory.tsx` - Inventory settings modal

#### 3. Authentication Components (`/src/auth/`)
- **Purpose**: Authentication-related components and HOCs
- **Examples**:
  - `Login.tsx` - Login form
  - `LoginLayout.tsx` - Login page layout
  - `ProtectedRoute.tsx` - Route protection HOC
  - `withAuth.tsx` - Authentication wrapper HOC

#### 4. Navigation Components (`/src/navigation/`)
- **Purpose**: Navigation, layout, and menu components
- **Examples**:
  - `Sidebar.tsx` - Main desktop navigation
  - `MobileMenu.tsx` - Mobile bottom navigation
  - `ColorSchemeToggle.tsx` - Theme switcher
  - `menuConfig.ts` - Menu configuration

#### 5. Utility Components (`/src/utils/`)
- **Purpose**: Utility functions and helpers
- **Examples**:
  - `supabaseClient.ts` - Supabase client configuration
  - `twilioClient.ts` - Twilio client setup
  - `uiUtils.ts` - UI utility functions

#### 6. Custom Hooks (`/src/hooks/`)
- **Purpose**: Custom React hooks for data fetching and state management
- **Examples**:
  - `useTickets.ts` - Ticket management hook
  - `useResponsive.ts` - Responsive design hook (if implemented)

## Naming Conventions

### Component Names

#### 1. PascalCase Format
```typescript
// ✅ Correct
const UserDialog = () => { /* ... */ };
const PageOrderDesktop = () => { /* ... */ };
const MobilePageLayout = () => { /* ... */ };

// ❌ Incorrect
const userDialog = () => { /* ... */ };
const pageOrderDesktop = () => { /* ... */ };
const mobile_page_layout = () => { /* ... */ };
```

#### 2. File Name Matching
```
// ✅ Correct
UserDialog.tsx          → export const UserDialog
PageOrderDesktop.tsx    → export const PageOrderDesktop
SupplierForm.tsx        → export const SupplierForm

// ❌ Incorrect
user-dialog.tsx         → export const UserDialog
page_order_desktop.tsx  → export const PageOrderDesktop
```

#### 3. Descriptive Suffixes
```typescript
// ✅ Correct - Clear purpose
PageOrderDesktop.tsx    // Desktop version
PageOrderMobile.tsx     // Mobile version
OrderTableDetails.tsx   // Details view
DialogProducts.tsx       // Product dialog with view/edit modes

// ❌ Incorrect - Unclear or abbreviated
PageOrderD.tsx          // Unclear abbreviation
POTable.tsx            // Unclear abbreviation
OrderDets.tsx          // Unclear abbreviation
```

### Page Component Naming

#### 1. Prefix Convention
```typescript
// ✅ Correct - Page prefix
PageDashboard.tsx
PageOrderDesktop.tsx
PageOrderMobile.tsx
PageUsersDesktop.tsx
PageSettingsMobile.tsx

// ❌ Incorrect - No prefix
Dashboard.tsx
OrderDesktop.tsx
Users.tsx
```

#### 2. Platform Suffixes
```typescript
// ✅ Correct - Clear platform distinction
PageOrderDesktop.tsx    // Desktop-specific
PageOrderMobile.tsx     // Mobile-specific
PageSettings.tsx        // Unified responsive (preferred)

// ❌ Incorrect - Unclear platform
PageOrder.tsx           // Which platform?
PageOrderD.tsx          // Unclear abbreviation
PageOrderM.tsx          // Unclear abbreviation
```

### Dialog Component Naming

#### 1. Dialog Suffix
```typescript
// ✅ Correct - Clear dialog purpose
UserDialog.tsx          // User-related dialog
DialogProducts.tsx       // Product dialog with view/edit modes
SupplierForm.tsx        // Supplier form (modal)
ActionDialogTicketCreate.tsx  // Ticket creation dialog

// ❌ Incorrect - Unclear purpose
User.tsx                // Too generic
ProductModal.tsx        // Inconsistent naming
CreateTicket.tsx        // Unclear component type
```

## Best Practices

### 1. Component Structure

#### Standard Component Structure
```typescript
// Imports
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/joy';
import { supabase } from '../utils/supabaseClient';
import type { Database } from '../general/supabase.types';

// Types
interface ComponentProps {
  // Props definition
}

// Component
const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <Box>
      {/* Component JSX */}
    </Box>
  );
};

export default ComponentName;
```

#### Export Pattern
```typescript
// ✅ Correct - Default export
export default UserDialog;

// ✅ Also correct - Named export (if needed)
export { UserDialog };

// ❌ Incorrect - Mixed patterns
export default UserDialog;
export const UserDialog = () => { /* ... */ };
```

### 2. Mobile Layout Best Practices

#### Unified Mobile Layout
```typescript
// ✅ Correct - Use shared mobile layout
import MobilePageLayout from '../components/MobilePageLayout';

const PageOrderMobile = () => (
  <MobilePageLayout>
    {/* Page content */}
  </MobilePageLayout>
);

// ❌ Incorrect - Custom layout in each component
const PageOrderMobile = () => (
  <Box sx={{ 
    paddingTop: '60px', 
    paddingBottom: '70px',
    // Custom layout logic
  }}>
    {/* Page content */}
  </Box>
);
```

#### Three-Layer Mobile Architecture
```
App.tsx (Shell)
├── MobilePageLayout (Shared Layout)
    └── Page Component (Content)
```

### 3. Responsive Design Patterns

#### Unified Responsive Components (Preferred)
```typescript
// ✅ Preferred - Single responsive component
const PageOrder = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <>
      {isMobile ? (
        <MobileOrderView />
      ) : (
        <DesktopOrderView />
      )}
    </>
  );
};

// ❌ Legacy - Separate components
PageOrderDesktop.tsx
PageOrderMobile.tsx
```

#### Responsive Hook Pattern
```typescript
// Custom hook for responsive behavior
const useResponsive = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return { isMobile, isTablet, isDesktop };
};
```

### 4. Import Organization

#### Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { Box, Button, Typography } from '@mui/joy';

// 3. Local utilities
import { supabase } from '../utils/supabaseClient';

// 4. Local components
import UserDialog from '../Dialog/UserDialog';

// 5. Types
import type { Database } from '../general/supabase.types';
```

### 5. Prop Interface Patterns

#### Clear Prop Definitions
```typescript
// ✅ Correct - Clear prop interface
interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  onSave?: (user: User) => void;
}

// ❌ Incorrect - Unclear or generic
interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
  callback?: (data: any) => void;
}
```

### 6. Component Composition

#### Favor Composition Over Inheritance
```typescript
// ✅ Correct - Composition
const EnhancedButton = ({ children, ...props }) => (
  <Button variant="solid" {...props}>
    {children}
  </Button>
);

// ❌ Incorrect - Class inheritance
class EnhancedButton extends Button {
  // Override behavior
}
```

## Performance Considerations

### 1. Code Splitting
```typescript
// Route-based code splitting
const PageOrder = lazy(() => import('./Page/PageOrder'));
const PageUsers = lazy(() => import('./Page/PageUsers'));
```

### 2. Memoization
```typescript
// Component memoization
const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering logic
});

// Callback memoization
const handleClick = useCallback(() => {
  // Event handler logic
}, [dependency]);
```

### 3. Bundle Optimization
- Keep components focused and small
- Avoid unnecessary re-renders
- Use dynamic imports for rarely used components
- Implement proper dependency arrays in useEffect

## Migration Guidelines

### Legacy to Modern Patterns

#### 1. Separate Mobile/Desktop to Unified
```typescript
// Before: Separate components
PageOrderDesktop.tsx
PageOrderMobile.tsx

// After: Unified component
PageOrder.tsx (with responsive logic)
```

#### 2. Prop Drilling to Context
```typescript
// Before: Prop drilling
<Parent>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// After: Context (if needed)
<UserProvider>
  <Parent>
    <Child>
      <GrandChild />
    </Child>
  </Parent>
</UserProvider>
```

By following these organization and naming conventions, the SmartBack application maintains consistency, readability, and scalability across all components.
