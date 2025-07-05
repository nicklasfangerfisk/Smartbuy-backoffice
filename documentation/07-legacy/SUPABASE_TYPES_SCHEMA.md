# Supabase Types & Database Schema Documentation

This document describes the structure of the Supabase-generated types and the underlying database schema for the Smartbuy Backoffice project.

---

## Overview
The file `main/components/general/supabase.types.ts` is auto-generated from your Supabase project and provides full TypeScript type safety for all tables, views, functions, and enums in your database. It is updated using:

```bash
npx supabase gen types typescript --project-id <your-project-id> --schema public > main/components/general/supabase.types.ts
```

---

## Main Tables

### Orders
| Column                | Type      | Description                                      |
|---------------------- |---------- |-------------------------------------------------|
| uuid                  | string    | Primary key (UUID)                               |
| order_number          | number    | Auto-incrementing order number (6 digits)        |
| order_number_display  | string    | Display order number (e.g. SO-100000)            |
| customer_name         | string?   | Customer's name                                  |
| customer_email        | string?   | Customer's email                                 |
| date                  | string?   | Order date (ISO)                                 |
| discount              | number    | Order-level discount (%)                         |
| order_items_count     | number?   | Number of items in the order                     |
| order_total           | number?   | Total price after discounts                      |
| status                | enum      | 'Draft', 'Paid', 'Refunded', 'Cancelled'         |
| ...                   | ...       | Other metadata fields                            |

### OrderItems
| Column        | Type      | Description                                 |
|-------------- |---------- |-------------------------------------------- |
| uuid          | string    | Primary key (UUID)                          |
| order_uuid    | string?   | Foreign key to Orders                       |
| product_uuid  | string?   | Foreign key to Products                     |
| quantity      | number    | Quantity of the product                     |
| unitprice     | number?   | Unit price at time of order                 |
| discount      | number?   | Discount (%) for this item                  |
| price         | number    | Calculated: quantity * unitprice * (1-discount/100) |

### Products
| Column        | Type      | Description                                 |
|-------------- |---------- |-------------------------------------------- |
| uuid          | string    | Primary key (UUID)                          |
| ProductName   | string?   | Name of the product                         |
| SalesPrice    | number?   | Sales price                                 |
| CostPrice     | number?   | Cost price                                  |
| ProductType   | enum?     | 'Beer', 'Wine', 'Bread', 'Soda', 'Champagne'|
| ...           | ...       | Other metadata fields                       |

### Suppliers
| Column        | Type      | Description                                 |
|-------------- |---------- |-------------------------------------------- |
| id            | string    | Primary key (UUID)                          |
| name          | string    | Supplier name                               |
| email         | string?   | Supplier email                              |
| ...           | ...       | Other metadata fields                       |

### PurchaseOrders
| Column        | Type      | Description                                 |
|-------------- |---------- |-------------------------------------------- |
| id            | string    | Primary key (UUID)                          |
| order_number  | string    | Purchase order number                       |
| supplier_id   | string?   | Foreign key to Suppliers                    |
| order_date    | string    | Date of the purchase order                  |
| total         | number?   | Total amount                                |
| status        | string    | Status                                      |
| ...           | ...       | Other metadata fields                       |

### users
| Column        | Type      | Description                                 |
|-------------- |---------- |-------------------------------------------- |
| id            | string    | Primary key (UUID)                          |
| email         | string    | User email                                  |
| name          | string?   | User name                                   |
| role          | string?   | User role                                   |
| ...           | ...       | Other metadata fields                       |

---

## Enums
- `order_status`: 'Draft', 'Paid', 'Refunded', 'Cancelled'
- `ProductCategory`: 'Beer', 'Wine', 'Bread', 'Soda', 'Champagne'

---

## Functions
- `is_employee()`: Returns boolean
- `update_order_rollups(order_uuid: string)`: Triggers rollup logic for an order

---

## Notes
- This file is auto-generated. Do not edit manually.
- To update, run the provided script or command. The file includes a last updated date for traceability.
- For more details, see the Supabase SQL schema or the migrations in the `migrations/` folder.
