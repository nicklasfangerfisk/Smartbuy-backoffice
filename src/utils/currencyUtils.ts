/**
 * Currency utilities for Danish kroner (DKK) formatting and multi-currency support
 */

export const CURRENCY_CONFIG = {
  currency: 'DKK',
  locale: 'da-DK',
  symbol: 'kr',
  baseCurrency: 'DKK' // Base currency for exchange rate calculations
} as const;

// Currency with exchange rate interface
export interface CurrencyAmount {
  amount: number;
  currency: string;
  exchangeRate: number;
}

/**
 * Format a number as Danish kroner currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "123 kr" or "123,45 kr")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) {
    return '0 kr';
  }

  // Check if the amount has decimal places
  const hasDecimals = amount % 1 !== 0;

  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number as Danish kroner with custom symbol position
 * @param amount - The amount to format
 * @param symbolAfter - Whether to place the symbol after the amount (default: true)
 * @returns Formatted currency string
 */
export function formatCurrencyWithSymbol(amount: number | null | undefined, symbolAfter: boolean = true): string {
  if (amount == null || isNaN(amount)) {
    return symbolAfter ? '0 kr' : 'kr 0';
  }

  // Check if the amount has decimal places
  const hasDecimals = amount % 1 !== 0;

  const formatted = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(amount);

  return symbolAfter ? `${formatted} kr` : `kr ${formatted}`;
}

/**
 * Format a currency amount with exchange rate conversion
 * @param currencyAmount - The currency amount object with amount, currency, and exchange rate
 * @param targetCurrency - Target currency to display (default: DKK)
 * @returns Formatted currency string
 */
export function formatCurrencyWithExchange(
  currencyAmount: CurrencyAmount, 
  targetCurrency: string = CURRENCY_CONFIG.currency
): string {
  if (!currencyAmount || currencyAmount.amount == null || isNaN(currencyAmount.amount)) {
    return formatCurrency(0);
  }

  // Convert to base currency first, then to target currency
  const baseAmount = currencyAmount.amount / currencyAmount.exchangeRate;
  
  if (targetCurrency === CURRENCY_CONFIG.baseCurrency) {
    return formatCurrency(baseAmount);
  }
  
  // For other currencies, we'd need their exchange rates
  // For now, just return in base currency (DKK)
  return formatCurrency(baseAmount);
}

/**
 * Convert amount between currencies using exchange rates
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param fromExchangeRate - Exchange rate from base currency to source currency
 * @param toExchangeRate - Exchange rate from base currency to target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fromExchangeRate: number = 1,
  toExchangeRate: number = 1
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to base currency first
  const baseAmount = amount / fromExchangeRate;
  
  // Convert from base currency to target currency
  return baseAmount * toExchangeRate;
}

/**
 * Create a currency amount object with default DKK values
 * @param amount - The amount
 * @param currency - Currency code (default: DKK)
 * @param exchangeRate - Exchange rate (default: 1)
 * @returns CurrencyAmount object
 */
export function createCurrencyAmount(
  amount: number,
  currency: string = CURRENCY_CONFIG.currency,
  exchangeRate: number = 1
): CurrencyAmount {
  return {
    amount,
    currency,
    exchangeRate
  };
}

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns The parsed number or 0 if invalid
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbols and non-numeric characters except comma and period
  const cleaned = currencyString.replace(/[^\d,.-]/g, '');
  
  // Handle Danish decimal format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get currency symbol
 * @returns The currency symbol (kr)
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Database helper functions for currency persistence
 */

/**
 * Prepare product data with currency fields for database insert/update
 * @param product - Product data with SalesPrice and CostPrice
 * @returns Product data with currency and exchange rate fields
 */
export function prepareProductCurrencyData(product: {
  SalesPrice: number;
  CostPrice: number;
  [key: string]: any;
}) {
  return {
    ...product,
    salesprice_currency: CURRENCY_CONFIG.currency,
    salesprice_exchrate: 1,
    costprice_currency: CURRENCY_CONFIG.currency,
    costprice_exchrate: 1
  };
}

/**
 * Prepare order data with currency fields for database insert/update
 * @param order - Order data with order_total
 * @returns Order data with currency and exchange rate fields
 */
export function prepareOrderCurrencyData(order: {
  order_total: number;
  [key: string]: any;
}) {
  return {
    ...order,
    order_total_currency: CURRENCY_CONFIG.currency,
    order_total_exchrate: 1
  };
}

/**
 * Prepare order item data with currency fields for database insert/update
 * @param orderItem - Order item data with unitprice and price
 * @returns Order item data with currency and exchange rate fields
 */
export function prepareOrderItemCurrencyData(orderItem: {
  unitprice: number;
  price?: number;
  [key: string]: any;
}) {
  return {
    ...orderItem,
    unitprice_currency: CURRENCY_CONFIG.currency,
    unitprice_exchrate: 1,
    price_currency: CURRENCY_CONFIG.currency,
    price_exchrate: 1
  };
}

/**
 * Prepare purchase order item data with currency fields for database insert/update
 * @param purchaseOrderItem - Purchase order item data with unit_price
 * @returns Purchase order item data with currency and exchange rate fields
 */
export function preparePurchaseOrderItemCurrencyData(purchaseOrderItem: {
  unit_price: number;
  [key: string]: any;
}) {
  return {
    ...purchaseOrderItem,
    unit_price_currency: CURRENCY_CONFIG.currency,
    unit_price_exchrate: 1
  };
}
