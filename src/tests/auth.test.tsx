/**
 * Authentication Tests
 * 
 * Tests for the Login component functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../auth/Login';

// Create a mock for the supabase client module
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();

// Mock the entire module
jest.mock('../utils/supabaseClient', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: '123', name: 'Test User' },
            error: null,
          })),
        })),
      })),
    })),
  };
  
  return {
    supabase: mockSupabase,
  };
});

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default successful response
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });
    mockSignOut.mockResolvedValue({ error: null });
  });

  describe('Login Component', () => {
    it('renders login form with required fields', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <Login onLogin={jest.fn()} />
          </MemoryRouter>
        );
      });

      // Check that the login form renders correctly using more specific selectors
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('allows typing in email and password fields', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <Login onLogin={jest.fn()} />
          </MemoryRouter>
        );
      });

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••');

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Component Behavior', () => {
    it('validates component can be rendered without errors', async () => {
      const mockOnLogin = jest.fn();
      
      await act(async () => {
        render(
          <MemoryRouter>
            <Login onLogin={mockOnLogin} />
          </MemoryRouter>
        );
      });

      // Basic rendering validation
      expect(screen.getByText('SmartBack')).toBeInTheDocument();
      expect(screen.getByText('Welcome back to SmartBack! Please sign in to continue.')).toBeInTheDocument();
    });
  });
});
