# Unit Testing Login and Logout Procedures

This document provides a guide to creating unit tests for the login and logout procedures in the Smartbuy application. The tests ensure that the authentication flow works as expected, including handling errors and session management.

## Prerequisites

1. **Testing Framework**: Ensure you have a testing framework like [Jest](https://jestjs.io/) installed.
2. **Mocking Library**: Use a library like [msw](https://mswjs.io/) or [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock) to mock API calls.
3. **Supabase Client**: Mock the Supabase client to simulate authentication and database interactions.

## Test Cases

### 1. Login Procedure

#### Test Scenarios
- Successful login with valid credentials.
- Failed login with invalid credentials.
- Handling network errors during login.
- Redirecting to `/dashboard` after successful login.
- Displaying error messages for failed login attempts.

#### Example Test Code
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/auth/Login';
import { supabase } from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));

describe('Login Component', () => {
  it('logs in successfully with valid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(<Login onLogin={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays an error message for invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    render(<Login onLogin={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });
});
```

### 2. Logout Procedure

#### Test Scenarios
- Successful logout.
- Redirecting to `/login` after logout.
- Clearing session data on logout.

#### Example Test Code
```tsx
import { supabase } from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

describe('Logout Procedure', () => {
  it('logs out successfully and redirects to login', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    // Simulate logout logic
    await supabase.auth.signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    // Add assertions for redirection or session clearing logic
  });
});
```

## Best Practices

1. **Mock External Dependencies**: Mock Supabase client methods to isolate the tests from external services.
2. **Test Edge Cases**: Include tests for network errors, invalid inputs, and unexpected responses.
3. **Use Descriptive Test Names**: Clearly describe the behavior being tested.
4. **Clean Up After Tests**: Reset mocks and clear any side effects after each test.

## Repository Placement for Jest Code

For unit testing login and logout procedures, it is recommended to keep the Jest code within the current repository. This ensures that the tests are tightly integrated with the codebase, making it easier to maintain and run tests as part of the development workflow.

### Reasons to Keep Jest Code in the Current Repository

1. **Integration with CI/CD**: Tests can be run automatically during pull requests or deployments using tools like GitHub Actions.
2. **Code Coverage**: Keeping tests in the same repository allows you to measure and track code coverage effectively.
3. **Ease of Maintenance**: Tests are updated alongside the code they test, reducing the risk of outdated tests.
4. **Developer Workflow**: Developers can run tests locally as they work on the codebase.

### When to Use a Separate Repository

- If the tests are meant to be generic and reusable across multiple projects.
- If the tests are for end-to-end (E2E) testing and require a completely isolated environment.
- If the repository is very large and splitting tests improves performance or organization.

For the current use case of unit testing login/logout procedures, keeping the Jest code in the current repository is the best approach.

## Conclusion

Unit testing the login and logout procedures ensures the reliability of the authentication flow and improves the overall quality of the application. Follow the examples and best practices outlined in this document to create comprehensive tests for your application.
