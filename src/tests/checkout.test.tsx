/**
 * ActionDialogOrderCheckout Tests
 * 
 * Basic tests to ensure the checkout dialog renders properly
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionDialogOrderCheckout from '../Dialog/ActionDialogOrderCheckout';

// Mock order items data
const mockOrderItems = [
  {
    uuid: 'item-1',
    product_uuid: 'prod-1',
    quantity: 2,
    unitprice: 50,
    discount: 0,
    Products: { ProductName: 'Test Product' }
  }
];

// Mock the Supabase client
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: mockOrderItems, 
          error: null 
        }))
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

describe('ActionDialogOrderCheckout', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    order: mockOrder,
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders checkout dialog when open', async () => {
    await act(async () => {
      render(<ActionDialogOrderCheckout {...defaultProps} />);
    });
    
    // Check for elements that actually exist in the component
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument();
    
    // Wait for order items to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('shows stepper with correct steps', async () => {
    await act(async () => {
      render(<ActionDialogOrderCheckout {...defaultProps} />);
    });
    
    // Check for the actual step labels used in the component (in the stepper)
    const contactSteps = screen.getAllByText('Contact');
    const deliverySteps = screen.getAllByText('Delivery');
    const paymentSteps = screen.getAllByText('Payment');
    
    // Should find each step at least once
    expect(contactSteps.length).toBeGreaterThanOrEqual(1);
    expect(deliverySteps.length).toBeGreaterThanOrEqual(1);
    expect(paymentSteps.length).toBeGreaterThanOrEqual(1);
  });

  test('displays order total correctly', async () => {
    await act(async () => {
      render(<ActionDialogOrderCheckout {...defaultProps} />);
    });
    
    // Wait for order items to load and total to be calculated
    await waitFor(() => {
      const totalElements = screen.getAllByText('$100.00');
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  test('does not render when closed', () => {
    render(<ActionDialogOrderCheckout {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
  });

  test('handles null order gracefully', () => {
    render(<ActionDialogOrderCheckout {...defaultProps} order={null} />);
    
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
  });
});
