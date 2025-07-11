/**
 * Currency Persistence Validation Script
 * This script validates that the currency persistence implementation is working correctly
 */

import { supabase } from '../utils/supabaseClient';
import { 
  prepareProductCurrencyData,
  prepareOrderCurrencyData,
  prepareOrderItemCurrencyData,
  preparePurchaseOrderItemCurrencyData,
  CURRENCY_CONFIG
} from '../utils/currencyUtils';

export async function validateCurrencyPersistence() {
  console.log('🧪 Starting Currency Persistence Validation...');
  
  const results = {
    products: false,
    orders: false,
    orderItems: false,
    purchaseOrderItems: false
  };

  try {
    // Test 1: Validate Products table structure
    console.log('📝 Testing Products table currency fields...');
    const testProduct = prepareProductCurrencyData({
      ProductName: 'Test Currency Product',
      SalesPrice: 299.99,
      CostPrice: 199.99,
      CreatedAt: new Date().toISOString()
    });

    // Check if the prepared data has the expected currency fields
    if (testProduct.salesprice_currency === CURRENCY_CONFIG.currency &&
        testProduct.salesprice_exchrate === 1 &&
        testProduct.costprice_currency === CURRENCY_CONFIG.currency &&
        testProduct.costprice_exchrate === 1) {
      results.products = true;
      console.log('✅ Products: Currency data preparation working correctly');
    } else {
      console.log('❌ Products: Currency data preparation failed');
    }

    // Test 2: Validate Orders table structure
    console.log('📝 Testing Orders table currency fields...');
    const testOrder = prepareOrderCurrencyData({
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      order_total: 599.98
    });

    if (testOrder.order_total_currency === CURRENCY_CONFIG.currency &&
        testOrder.order_total_exchrate === 1) {
      results.orders = true;
      console.log('✅ Orders: Currency data preparation working correctly');
    } else {
      console.log('❌ Orders: Currency data preparation failed');
    }

    // Test 3: Validate OrderItems table structure
    console.log('📝 Testing OrderItems table currency fields...');
    const testOrderItem = prepareOrderItemCurrencyData({
      order_uuid: 'test-uuid',
      product_uuid: 'test-product-uuid',
      quantity: 2,
      unitprice: 299.99,
      discount_percent: 10
    });

    if (testOrderItem.unitprice_currency === CURRENCY_CONFIG.currency &&
        testOrderItem.unitprice_exchrate === 1 &&
        testOrderItem.price_currency === CURRENCY_CONFIG.currency &&
        testOrderItem.price_exchrate === 1) {
      results.orderItems = true;
      console.log('✅ OrderItems: Currency data preparation working correctly');
    } else {
      console.log('❌ OrderItems: Currency data preparation failed');
    }

    // Test 4: Validate PurchaseOrderItems table structure
    console.log('📝 Testing PurchaseOrderItems table currency fields...');
    const testPurchaseOrderItem = preparePurchaseOrderItemCurrencyData({
      purchase_order_id: 1,
      product_id: 1,
      quantity_ordered: 5,
      unit_price: 199.99,
      notes: 'Test purchase order item'
    });

    if (testPurchaseOrderItem.unit_price_currency === CURRENCY_CONFIG.currency &&
        testPurchaseOrderItem.unit_price_exchrate === 1) {
      results.purchaseOrderItems = true;
      console.log('✅ PurchaseOrderItems: Currency data preparation working correctly');
    } else {
      console.log('❌ PurchaseOrderItems: Currency data preparation failed');
    }

    // Summary
    const allTestsPassed = Object.values(results).every(test => test === true);
    
    console.log('\n📊 Validation Summary:');
    console.log(`Products: ${results.products ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Orders: ${results.orders ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`OrderItems: ${results.orderItems ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`PurchaseOrderItems: ${results.purchaseOrderItems ? '✅ PASS' : '❌ FAIL'}`);
    
    if (allTestsPassed) {
      console.log('\n🎉 All currency persistence validations PASSED!');
      console.log(`💱 Base Currency: ${CURRENCY_CONFIG.currency}`);
      console.log(`🌍 Locale: ${CURRENCY_CONFIG.locale}`);
      console.log(`💰 Symbol: ${CURRENCY_CONFIG.symbol}`);
    } else {
      console.log('\n⚠️ Some validations FAILED. Please check the implementation.');
    }

    return results;

  } catch (error) {
    console.error('❌ Validation error:', error);
    return results;
  }
}

// Optional: Test database connectivity (if needed)
export async function testDatabaseCurrencyFields() {
  console.log('🔍 Testing database currency field structure...');
  
  try {
    // Test if we can query the new currency fields
    const { data, error } = await supabase
      .from('Products')
      .select('salesprice_currency, salesprice_exchrate, costprice_currency, costprice_exchrate')
      .limit(1);

    if (error) {
      console.log('❌ Database currency fields test failed:', error.message);
      return false;
    }

    console.log('✅ Database currency fields are accessible');
    return true;
  } catch (error) {
    console.log('❌ Database connection error:', error);
    return false;
  }
}
