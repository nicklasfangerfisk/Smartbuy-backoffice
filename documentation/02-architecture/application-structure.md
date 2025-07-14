# SmartBack Application Architecture

## Overview

SmartBack is a React-based single-page application (SPA) built with modern web technologies. This document provides a comprehensive analysis of the application structure, component hierarchy, and architectural patterns.

**Technology Stack:**
- React 18 with TypeScript
- Material-UI Joy UI components
- Supabase (PostgreSQL, Auth, Real-time)
- Vite build tool
- Vercel deployment

## Component Hierarchy

### Root Level Structure

```
main.tsx (Entry Point)
├── App.tsx (Root Component)
    ├── CssVarsProvider (MUI Joy Theme Provider)
    ├── BrowserRouter
    └── Routes
        ├── LoginLayout (/login/*)
        └── Layout (/* - Main Application Layout)
            ├── Sidebar (Navigation)
            ├── MobileMenu (Mobile Navigation)
            └── Page Components (Route-specific content)
```

### Main Layout Component Tree

```
Layout (App.tsx)
├── Sidebar
│   ├── ColorSchemeToggle
│   ├── UserDialog (Modal)
│   └── Navigation Menu Items
├── MobileMenu (Mobile only)
│   └── BottomNavigation
└── Routes Container
    ├── Protected Routes (wrapped in ProtectedRoute HOC)
    └── Page Components
        ├── PageDashboard
        ├── PageOrderDesktop
        ├── PageProductDesktop
        ├── PageUsersDesktop/PageUsersMobile
        ├── PageSuppliersDesktop
        ├── PagePurchaseOrderDesktop
        ├── PageTicketDesktop
        ├── PageSmsCampaignsDesktop
        ├── PageMovementsDesktop/PageMovementsMobile
        ├── PageInventoryDesktop
        └── PageSettingsDesktop/PageSettingsMobile
```

### Page Component Internal Structure

Each page component follows a consistent pattern:

- **Data Fetching Layer**: React hooks for API calls
- **UI State Management**: Local state for modals, forms, filters
- **Table/List Components**: Display data with actions
- **Dialog Components**: Modal forms for CRUD operations
- **Responsive Components**: Mobile/Desktop variants where applicable

## Shared Components

### Core Shared Components

#### Navigation Components
- **Location**: `/src/navigation/`
- **Components**:
  - `Sidebar.tsx`: Main desktop navigation with collapsible menu areas
  - `MobileMenu.tsx`: Bottom navigation for mobile devices
  - `ColorSchemeToggle.tsx`: Theme switching component
  - `menuConfig.ts`: Centralized menu configuration

#### Dialog Components (Modal Forms)
- **Location**: `/src/Dialog/`
- **Reusable Modal Components**:
  - `UserDialog.tsx`: User profile editing with avatar upload
  - `DialogProducts.tsx`: Product creation/editing dialog with view/edit modes
  - `DialogProducts.tsx`: Product creation/editing dialog with view/edit modes
  - `SupplierForm.tsx`: Supplier management modal
  - `DialogPurchaseOrder.tsx`: Purchase order creation/editing
  - `OrderTableCreate.tsx`: Order creation with items
  - `OrderDetailsDialog.tsx`: Order details viewer
  - `ActionDialogTicketCreate.tsx`: Ticket creation form
  - `ActionDialogTicketResolve.tsx`: Ticket resolution form
  - `DialogInventory.tsx`: Inventory settings modal
  - `ActionDialogPurchaseOrderReceive.tsx`: PO receiving workflow

#### Utility Components
- **Material-UI Components**: Extensive use of Joy UI components
- **Custom Wrappers**: Most dialogs follow consistent Modal + ModalDialog pattern
- **Form Components**: Standardized Input, Select, Button configurations

### Component Import Patterns

```typescript
// Standard pattern for dialog imports
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';

// Utility imports
import { supabase } from '../utils/supabaseClient';
import withAuth from '../auth/withAuth';
```

## Higher-Order Components (HOCs)

### Authentication HOCs

#### `ProtectedRoute` Component
- **Location**: `/src/auth/ProtectedRoute.tsx`
- **Purpose**: Route-level authentication guard
- **Usage**: Wraps all main application routes
- **Behavior**: 
  - Checks Supabase session on mount
  - Redirects to login if no session
  - Shows loading state during session check
  - Renders children if authenticated

#### `withAuth` HOC
- **Location**: `/src/auth/withAuth.tsx`
- **Purpose**: Component-level authentication wrapper
- **Usage**: Applied to individual components (mainly dialogs)
- **Behavior**:
  - Similar to ProtectedRoute but for components
  - Returns wrapped component with session validation
  - Used in: `DialogProducts`, `ActionDialogTicketResolve`

### Theme and Styling HOCs

#### `CssVarsProvider`
- **Source**: `@mui/joy/styles`
- **Purpose**: Provides Joy UI theme context
- **Scope**: Wraps entire application
- **Features**: CSS custom properties for theming

## Data Flow Architecture

### State Management

#### Props-based Dependencies
- **User Data**: Flows from Layout → Page components (e.g., `users` array)
- **Modal States**: Parent components control dialog open/close states
- **Form Data**: Passed via props between parent and dialog components

#### Context Dependencies
- **Theme Context**: All components consume Joy UI theme via CssVarsProvider
- **Router Context**: Navigation components use React Router hooks
- **No Global State**: Application doesn't use Redux or Context API for app state

#### Supabase Integration
- **Database Client**: Shared `supabase` instance from `/utils/supabaseClient.ts`
- **Auth State**: Components directly query Supabase auth state
- **Real-time**: Some components may subscribe to Supabase real-time updates

### Data Flow Pattern

```
App Layout (fetches users)
├── Page Component (receives users as props)
│   ├── Table Component (displays data)
│   ├── Dialog Component (modal forms)
│   └── Child Components (dependent on parent state)
└── Navigation (independent auth state)
```

## Layout Structure

### HTML and JSX Structure

```jsx
<CssVarsProvider>
  <Router>
    <Routes>
      <Route path="/login/*" element={<LoginLayout />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  </Router>
</CssVarsProvider>
```

### Main Layout JSX Pattern

```jsx
<Box sx={{ display: 'flex', height: '100vh' }}>
  {/* Sidebar - Desktop Navigation */}
  <Sidebar />
  
  {/* Main Content Area */}
  <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
    {/* Mobile Menu - Conditional */}
    {isMobile && <MobileMenu />}
    
    {/* Page Content - React Router Routes */}
    <Routes>
      <Route path="..." element={<ProtectedRoute><PageComponent /></ProtectedRoute>} />
    </Routes>
  </Box>
</Box>
```

### Modal/Dialog JSX Pattern

```jsx
<Modal open={open} onClose={onClose}>
  <ModalDialog sx={{ minWidth: 400 }}>
    <ModalClose />
    <Typography level="title-md">Dialog Title</Typography>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit">Save</Button>
    </form>
  </ModalDialog>
</Modal>
```

## File and Module Structure

### Directory Organization

```
src/
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── App.css                    # Global styles
├── auth/                      # Authentication components
│   ├── Login.tsx
│   ├── LoginLayout.tsx
│   ├── ProtectedRoute.tsx
│   └── withAuth.tsx
├── navigation/                # Navigation components
│   ├── Sidebar.tsx
│   ├── MobileMenu.tsx
│   ├── ColorSchemeToggle.tsx
│   └── menuConfig.ts
├── Page/                      # Page components (main views)
│   ├── PageDashboard.tsx
│   ├── PageOrderDesktop.tsx
│   ├── PageUsersMobile.tsx
│   └── ... (other pages)
├── Dialog/                    # Reusable modal components
│   ├── UserDialog.tsx
│   ├── DialogProducts.tsx
│   ├── SupplierForm.tsx
│   └── ... (other dialogs)
├── utils/                     # Utility functions
│   ├── supabaseClient.ts
│   ├── twilioClient.ts
│   └── uiUtils.ts
├── api/                       # API functions
│   ├── receivePurchaseOrder.ts
│   └── send-sms-campaign.ts
├── hooks/                     # Custom React hooks
│   └── useTickets.ts
├── general/                   # Type definitions
│   └── supabase.types.ts
├── components/                # Shared UI components
├── layouts/                   # Layout components
├── theme/                     # Theme configuration
├── widgets/                   # Widget components
└── table/                     # Table components
```

### Import Patterns

```typescript
// Material-UI imports
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';

// Local imports
import { supabase } from '../utils/supabaseClient';
import withAuth from '../auth/withAuth';
import UserDialog from '../Dialog/UserDialog';

// Type imports
import type { Database } from '../general/supabase.types';
```

## Design Patterns

### Responsive Design Pattern

```typescript
// Responsive rendering
const isMobile = useMediaQuery('(max-width: 768px)');

return (
  <>
    {isMobile ? (
      <MobileComponent />
    ) : (
      <DesktopComponent />
    )}
  </>
);
```

### Modal Dialog Pattern

```typescript
// Consistent modal pattern
const [open, setOpen] = useState(false);

const handleOpen = () => setOpen(true);
const handleClose = () => setOpen(false);

return (
  <>
    <Button onClick={handleOpen}>Open Dialog</Button>
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        {/* Dialog content */}
      </ModalDialog>
    </Modal>
  </>
);
```

### Data Fetching Pattern

```typescript
// Standard data fetching
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*');
      
      if (error) throw error;
      setData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## Performance Considerations

### Code Splitting

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
```

### Memoization

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

### Bundle Optimization

- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Route and component-level splitting
- **Asset Optimization**: Image and font optimization
- **Lazy Loading**: Deferred loading of non-critical components

## Security Architecture

### Authentication Flow

```
User Request → ProtectedRoute → Session Check → Supabase Auth → Component Render
```

### Data Security

- **Row Level Security (RLS)**: Database-level access control
- **API Security**: Server-side validation and authentication
- **Client-side Validation**: Input validation and sanitization
- **Session Management**: Secure session handling via Supabase

## Testing Architecture

### Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full application workflow testing
- **Performance Tests**: Bundle size and performance monitoring

### Testing Structure

```
__tests__/
├── components/
├── pages/
├── hooks/
└── utils/
```

## Deployment Architecture

### Build Process

```
Source Code → TypeScript Compilation → Vite Build → Vercel Deployment
```

### Environment Configuration

- **Development**: Local development with hot reload
- **Preview**: Vercel preview deployments
- **Production**: Optimized production build

This architecture provides a solid foundation for scalable, maintainable React application development with proper separation of concerns and modern best practices.
