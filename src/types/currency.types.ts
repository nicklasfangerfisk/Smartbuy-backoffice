/**
 * Extended TypeScript interfaces for currency-enabled database tables
 * These interfaces extend the existing types to include currency and exchange rate fields
 */

// Extended Product interface with currency fields
export interface ProductWithCurrency {
  uuid: string;
  ProductName: string;
  SalesPrice: number;
  salesprice_currency: string;
  salesprice_exchrate: number;
  CostPrice: number;
  costprice_currency: string;
  costprice_exchrate: number;
  CreatedAt?: string;
  // ... other existing fields
}

// Extended Order interface with currency fields
export interface OrderWithCurrency {
  uuid: string;
  date: string;
  status: string;
  customer_name: string;
  customer_email: string;
  order_total: number;
  order_total_currency: string;
  order_total_exchrate: number;
  // ... other existing fields
}

// Extended OrderItem interface with currency fields
export interface OrderItemWithCurrency {
  uuid: string;
  order_uuid: string;
  product_uuid: string;
  quantity: number;
  unitprice: number;
  unitprice_currency: string;
  unitprice_exchrate: number;
  price?: number;
  price_currency: string;
  price_exchrate: number;
  discount_percent?: number;
  // ... other existing fields
}

// Extended PurchaseOrderItem interface with currency fields
export interface PurchaseOrderItemWithCurrency {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity_ordered: number;
  unit_price: number;
  unit_price_currency: string;
  unit_price_exchrate: number;
  notes?: string;
  // ... other existing fields
}

// Helper type for currency data preparation
export interface CurrencyFieldData {
  currency: string;
  exchrate: number;
}

// Type for currency-enabled price fields
export interface PriceWithCurrency {
  amount: number;
  currency: string;
  exchangeRate: number;
}
