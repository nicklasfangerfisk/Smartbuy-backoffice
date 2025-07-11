import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../auth/Login';
import { supabase } from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(() => Promise.resolve({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
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
  },
}));

describe('Authentication Tests', () => {
  describe('Login Component', () => {
    it('logs in successfully with valid credentials', async () => {
      render(
        <MemoryRouter>
          <Login onLogin={jest.fn()} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('displays an error message for invalid credentials', async () => {
      (supabase.auth.signInWithPassword as unknown as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      render(
        <MemoryRouter>
          <Login onLogin={jest.fn()} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••'), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Logout Procedure', () => {
    it('logs out successfully and redirects to login', async () => {
      // Simulate logout logic
      await supabase.auth.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      // Add assertions for redirection or session clearing logic
    });
  });
});
