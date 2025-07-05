# Login Implementation with Supabase

## Overview
This document outlines the correct implementation of login functionality using Supabase. The goal is to ensure a seamless user experience with persistent sessions, token management, and proper redirection.

## Key Features
1. **Authentication**: Authenticate users using Supabase's `signIn` or `signInWithPassword` methods.
2. **Session Persistence**: Maintain user sessions across page reloads.
3. **Token Refresh**: Automatically refresh tokens when they expire.
4. **Route Protection**: Guard routes to ensure only authenticated users can access them.
5. **Logout**: Clear sessions and redirect users to the login page.

## Implementation Steps

### 1. Initialize Supabase Client
Ensure the Supabase client is initialized with the correct environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
export default supabase;
```

### 2. Login Functionality
Use `supabase.auth.signInWithPassword` to authenticate users.

```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
if (error) {
  console.error('Login failed:', error.message);
} else {
  console.log('Login successful:', data);
}
```

### 3. Session Persistence
Supabase automatically persists the session in `localStorage` or `sessionStorage`. Use `supabase.auth.getSession()` to retrieve the current session.

```tsx
const { data: session } = await supabase.auth.getSession();
if (session) {
  console.log('User is logged in:', session.user);
} else {
  console.log('No active session');
}
```

### 4. Token Refresh
Supabase automatically refreshes tokens when they expire. Listen for session changes:

```tsx
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});
```

### 5. Redirect After Login
After successful login, redirect users to the dashboard:

```tsx
navigate('/dashboard');
```

### 6. Logout
Use `supabase.auth.signOut()` to log out users and clear the session:

```tsx
await supabase.auth.signOut();
navigate('/login');
```

### 7. Protect Routes
Use a `ProtectedRoute` component to guard routes and redirect unauthenticated users to the login page:

```tsx
const ProtectedRoute = ({ children }) => {
  const { data: session } = supabase.auth.getSession();
  if (!session) {
    return <Navigate to="/login" />;
  }
  return children;
};
```

### 8. Error Handling
Display user-friendly error messages for login failures or session issues.

### 9. Enforcing Protected Routes

To ensure all components and routes are protected, follow these best practices:

1. **Centralize Route Protection**:
   - Use a `ProtectedRoute` component to wrap all routes that require authentication.
   - This ensures consistent access control across the app.

   Example:
   ```tsx
   <Route
     path="/dashboard"
     element={
       <ProtectedRoute>
         <PageDashboard />
       </ProtectedRoute>
     }
   />
   ```

2. **Guard Navigation in UI Components**:
   - For components like `MobileMenu` or `Sidebar`, check the user's session before allowing navigation to protected pages.
   - Display an alert or redirect to the login page if the user is not authenticated.

   Example:
   ```tsx
   const handleNavigation = async (newValue: string) => {
     const { data: session } = await supabase.auth.getSession();
     if (!session) {
       alert('You must be logged in to access this page.');
       return;
     }
     onChange(newValue);
   };
   ```

3. **Use a Higher-Order Component (HOC)**:
   - Create a HOC to wrap components that require authentication. This ensures access control at the component level.

   Example:
   ```tsx
   const withAuth = (Component: React.FC) => {
     return (props: any) => {
       const { data: session } = supabase.auth.getSession();
       if (!session) {
         return <Navigate to="/login" />;
       }
       return <Component {...props} />;
     };
   };

   export default withAuth;
   ```

4. **Global Session Listener**:
   - Use `supabase.auth.onAuthStateChange` to listen for session changes globally. Redirect users to the login page if they are logged out.

   Example:
   ```tsx
   supabase.auth.onAuthStateChange((event, session) => {
     if (!session && window.location.pathname !== '/login') {
       window.location.href = '/login';
     }
   });
   ```

5. **Backend Enforcement**:
   - Use Supabase's Row-Level Security (RLS) policies to enforce access control at the database level. This ensures that even if a user bypasses the frontend, they cannot access unauthorized data.

   Example RLS Policy:
   ```sql
   CREATE POLICY "Allow authenticated users" ON "protected_table"
   FOR SELECT
   USING (auth.uid() = user_id);
   ```

6. **Test Access Control**:
   - Regularly test your app to ensure that unauthenticated users cannot access protected routes or data.
   - Use tools like browser dev tools or automated tests to simulate unauthorized access.

### Refactoring Components to Use `withAuth` HOC

To ensure consistent authentication protection across the app, several components have been refactored to use the `withAuth` Higher-Order Component (HOC). This approach enforces authentication at the component level, ensuring that only authenticated users can access these components.

#### Updated Components
The following components have been wrapped with the `withAuth` HOC:

1. `TicketResForm`
2. `ProductTableForm`
3. `GeneralTable`
4. `Sidebar`

#### Benefits of Using `withAuth`
- Centralized authentication logic.
- Simplified component-level access control.
- Improved code maintainability and consistency.

#### Example
Here is an example of how a component is wrapped with the `withAuth` HOC:

```tsx
import withAuth from '../auth/withAuth';

export default withAuth(ComponentName);
```

This ensures that the `ComponentName` is only accessible to authenticated users. If a user is not authenticated, they will be redirected to the login page.

## Best Practices
- Use HTTPS in production to secure tokens.
- Store sensitive environment variables securely (e.g., in Vercel's environment settings).
- Regularly test the login flow to ensure session persistence and token refresh work as expected.

## Common Issues
1. **Frequent Logouts**: Ensure the Supabase client is initialized correctly and tokens are being refreshed.
2. **Environment Variable Errors**: Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in the environment.
3. **Route Protection**: Ensure all protected routes are wrapped with the `ProtectedRoute` component.

## Conclusion
Following these steps will ensure a robust and user-friendly login system with Supabase. For further assistance, refer to the [Supabase documentation](https://supabase.com/docs).