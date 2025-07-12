/**
 * CheckoutDialog Tests
 * 
 * Basic tests to ensure the checkout dialog renders properly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutDialog from '../Dialog/CheckoutDialog';

// Mock the Supabase client
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

// Mock currency utils
jest.mock('../utils/currencyUtils', () => ({
  formatCurrencyWithSymbol: jest.fn((amount) => `$${amount.toFixed(2)}`)
}));

const mockOrder = {
  uuid: 'test-uuid-123',
  order_number_display: 'ORD-001',
  order_total: 100,
  customer_name: 'John Doe',
  customer_email: 'john@example.com'
};

describe('CheckoutDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    order: mockOrder,
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders checkout dialog when open', () => {
    render(<CheckoutDialog {...defaultProps} />);
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument();
  });

  test('shows stepper with correct steps', () => {
    render(<CheckoutDialog {...defaultProps} />);
    
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Review Order')).toBeInTheDocument();
  });

  test('displays order total correctly', () => {
    render(<CheckoutDialog {...defaultProps} />);
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<CheckoutDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
  });

  test('handles null order gracefully', () => {
    render(<CheckoutDialog {...defaultProps} order={null} />);
    
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
  });
});
