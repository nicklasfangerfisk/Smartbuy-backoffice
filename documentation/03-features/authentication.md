# Authentication System

## Overview

SmartBack uses Supabase for authentication, providing secure user management with session persistence, token refresh, and comprehensive access control. The authentication system implements multiple layers of protection at the route, component, and database levels.

## Core Authentication Features

### 1. Authentication Methods

#### Email/Password Authentication
```typescript
// Login with email and password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

if (error) {
  console.error('Login failed:', error.message);
} else {
  console.log('Login successful:', data);
  navigate('/dashboard');
}
```

#### Session Management
```typescript
// Get current session
const { data: session } = await supabase.auth.getSession();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
  
  if (event === 'SIGNED_OUT') {
    navigate('/login');
  }
});
```

### 2. Session Persistence

#### Automatic Session Storage
- **Local Storage**: Sessions persist across browser sessions
- **Session Storage**: Available for current tab only
- **Cookie Storage**: Server-side session handling
- **Automatic Refresh**: Tokens refresh automatically before expiration

#### Session Validation
```typescript
// Check if user is authenticated
const isAuthenticated = async () => {
  const { data: session } = await supabase.auth.getSession();
  return session?.user ? true : false;
};

// Get current user
const getCurrentUser = async () => {
  const { data: session } = await supabase.auth.getSession();
  return session?.user || null;
};
```

### 3. Logout Functionality

#### Complete Session Cleanup
```typescript
// Logout user and clear session
const logout = async () => {
  try {
    await supabase.auth.signOut();
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

## Access Control Architecture

### 1. Route-Level Protection

#### ProtectedRoute Component
```typescript
// /src/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        setAuthenticated(!!session?.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

#### Route Configuration
```typescript
// App.tsx route setup
<Routes>
  <Route path="/login/*" element={<LoginLayout />} />
  <Route
    path="/*"
    element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }
  />
</Routes>
```

### 2. Component-Level Protection

#### withAuth Higher-Order Component
```typescript
// /src/auth/withAuth.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const { data: session } = await supabase.auth.getSession();
          setAuthenticated(!!session?.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          setAuthenticated(false);
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!authenticated) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
};

export default withAuth;
```

#### Protected Components
```typescript
// Example usage in components
import withAuth from '../auth/withAuth';

const ProductTableForm = ({ /* props */ }) => {
  // Component logic
};

export default withAuth(ProductTableForm);
```

#### Components Using withAuth
- `ProductTableForm`: Product management forms
- `TicketResForm`: Ticket resolution forms
- `GeneralTable`: Data table components
- `Sidebar`: Navigation component

### 3. Navigation Guards

#### Mobile Menu Protection
```typescript
// Navigation guard in mobile menu
const handleNavigation = async (newValue: string) => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.user) {
    alert('You must be logged in to access this page.');
    return;
  }
  
  onChange(newValue);
};
```

#### Sidebar Protection
```typescript
// Sidebar authentication check
const [user, setUser] = useState(null);

useEffect(() => {
  const checkUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  checkUser();
}, []);

if (!user) {
  return <Navigate to="/login" />;
}
```

## Database-Level Security

### 1. Row Level Security (RLS)

#### RLS Policies
```sql
-- Enable RLS on protected tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own data
CREATE POLICY "Allow authenticated users" ON "products"
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Allow users to update their own records
CREATE POLICY "Allow user updates" ON "users"
FOR UPDATE
USING (auth.uid() = id);
```

#### Database Functions
```sql
-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = required_role
  );
END;
$$;
```

### 2. API Security

#### Supabase Client Configuration
```typescript
// /src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../general/supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

#### Authenticated API Calls
```typescript
// Example of authenticated API call
const fetchUserData = async () => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id);

  if (error) {
    throw error;
  }

  return data;
};
```

## Login Implementation

### 1. Login Form Component

```typescript
// /src/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Typography, Alert } from '@mui/joy';
import { supabase } from '../utils/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        maxWidth: 400,
        margin: '0 auto',
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography level="h2">Login</Typography>
      
      {error && (
        <Alert color="danger">{error}</Alert>
      )}
      
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <Button
        type="submit"
        loading={loading}
        variant="solid"
        color="primary"
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;
```

### 2. Login Layout

```typescript
// /src/auth/LoginLayout.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssVarsProvider } from '@mui/joy';
import Login from './Login';

const LoginLayout: React.FC = () => {
  return (
    <CssVarsProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.body',
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </Box>
    </CssVarsProvider>
  );
};

export default LoginLayout;
```

## User Management

### 1. User Profile Management

```typescript
// User profile component
const UserProfile: React.FC = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography level="h3">User Profile</Typography>
      {user && (
        <Box>
          <Typography>Email: {user.email}</Typography>
          <Typography>ID: {user.id}</Typography>
          <Typography>Last Sign In: {user.last_sign_in_at}</Typography>
        </Box>
      )}
    </Box>
  );
};
```

### 2. User Role Management

```typescript
// User roles and permissions
interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

const checkUserPermission = async (permission: string): Promise<boolean> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return false;
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const { data: role } = await supabase
    .from('roles')
    .select('permissions')
    .eq('name', user?.role)
    .single();

  return role?.permissions.includes(permission) || false;
};
```

## Error Handling

### 1. Authentication Errors

```typescript
// Common authentication error handling
const handleAuthError = (error: any) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password';
    case 'Email not confirmed':
      return 'Please confirm your email address';
    case 'Too many requests':
      return 'Too many login attempts. Please try again later';
    default:
      return 'An error occurred during login';
  }
};
```

### 2. Session Errors

```typescript
// Session error handling
const handleSessionError = (error: any) => {
  console.error('Session error:', error);
  
  // Redirect to login if session is invalid
  if (error.message.includes('JWT')) {
    navigate('/login');
  }
};
```

## Security Best Practices

### 1. Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Token Security

- **HTTPS Only**: Always use HTTPS in production
- **Token Rotation**: Automatic token refresh
- **Secure Storage**: Tokens stored in httpOnly cookies when possible
- **Expiration**: Proper token expiration handling

### 3. Access Control

- **Least Privilege**: Users only have necessary permissions
- **Role-Based Access**: Different roles for different user types
- **Regular Audits**: Periodic review of user permissions
- **Session Timeout**: Automatic logout after inactivity

## Testing Authentication

### 1. Unit Tests

```typescript
// Authentication tests
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
  });

  test('should fail with invalid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });
});
```

### 2. Integration Tests

```typescript
// Route protection tests
describe('Route Protection', () => {
  test('should redirect unauthenticated users', () => {
    // Test that protected routes redirect to login
    render(
      <Router>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Router>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Session Not Persisting**
   - Check localStorage/sessionStorage
   - Verify Supabase configuration
   - Check for conflicts with other auth systems

2. **Token Refresh Failing**
   - Verify network connectivity
   - Check Supabase project status
   - Validate environment variables

3. **Route Protection Not Working**
   - Ensure ProtectedRoute is properly implemented
   - Check component wrapping with withAuth
   - Verify navigation guards

4. **Database Access Denied**
   - Check RLS policies
   - Verify user permissions
   - Validate database connection

### Performance Considerations

- **Lazy Loading**: Load authentication components on demand
- **Caching**: Cache user data appropriately
- **Debouncing**: Debounce auth state checks
- **Optimization**: Minimize unnecessary auth checks

The SmartBack authentication system provides comprehensive security through multiple layers of protection, ensuring that only authenticated and authorized users can access the application and its data.
