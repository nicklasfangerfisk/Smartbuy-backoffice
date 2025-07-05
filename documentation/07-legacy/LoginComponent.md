# Login Component Documentation

The `Login` component is responsible for handling user authentication in the application. It provides a form for users to log in using their email and password, as well as an option to log in with Google.

## Component Overview

- **File Path**: `/workspaces/smartback/components/auth/Login.tsx`
- **Dependencies**:
  - `supabase` for authentication.
  - `react-router-dom` for navigation.
  - `@mui/joy` components for UI elements.

## Props

- `onLogin`: A callback function that is triggered after a successful login.

## State Variables

- `email`: Stores the user's email input.
- `password`: Stores the user's password input.
- `loading`: Indicates whether a login request is in progress.
- `error`: Stores any error messages encountered during login.

## Functions

### `handleLogin`
Handles the login process when the user submits the form.

- **Steps**:
  1. Calls `supabase.auth.signInWithPassword` with the provided email and password.
  2. Fetches the user's role from the `users` table.
  3. If the user does not exist, upserts a new user with the role `employee`.
  4. Ensures the user has the `employee` role before granting access.
  5. Redirects the user to `/dashboard` upon successful login.

- **Error Handling**:
  - Displays appropriate error messages for authentication or database issues.

### `handleGoogleLogin`
Handles Google OAuth login. Currently, it sets the loading state but does not implement the full flow.

## UI Layout

- The main content is wrapped in a `Box` component with full-height and centered alignment for layout isolation.
- A `Card` component is used to visually separate the login form.
- Includes:
  - Email and password input fields.
  - A "Sign In" button.
  - A "Sign in with Google" button.
  - Error messages displayed below the form.

## Example Usage

```tsx
<Login onLogin={() => console.log('User logged in')} />
```

## Notes

- The component ensures that only users with the `employee` role can access the app.
- Includes retry logic for fetching user data after an upsert operation.
